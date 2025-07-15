import { useState, useEffect, useCallback } from 'react';
import CongressService from '../services/CongressService';
import OpenStatesService from '../services/OpenStatesService';
import LocalGovernmentService from '../services/LocalGovernmentService';
import UniversalDataSources from '../services/UniversalDataSources';
import { analyzePersonalImpact } from '../services/claudeService';
import locationParser from '../utils/locationParser';
import RelevanceScoring from '../services/RelevanceScoring';

// Fallback to sample data if API fails
import { getNationalizedContent, generateLocalContentTemplates } from '../data/nationalSampleContent';

export const useLegislation = (userProfile, filters = {}) => {
  const [legislation, setLegislation] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);

  const { category, scope, searchQuery } = filters;
  const pageSize = 20;

  // Legacy API sources fallback
  const loadLegacyAPISources = async (scope, searchQuery, currentPage, pageSize, parsedLocation, userProfile) => {
    let bills = [];
    
    if (scope === 'Federal' || scope === 'All Levels') {
      // Fetch federal bills from Congress.gov
      let federalBills = [];
      if (searchQuery) {
        federalBills = await CongressService.searchBills(searchQuery, {
          limit: pageSize,
          offset: currentPage * pageSize
        });
      } else {
        federalBills = await CongressService.getRecentBills({
          limit: pageSize,
          offset: currentPage * pageSize
        });
      }
      bills = [...bills, ...federalBills];
    }
    
    if ((scope === 'State' || scope === 'All Levels') && parsedLocation?.stateCode) {
      // Fetch state bills from OpenStates
      try {
        let stateBills = [];
        if (searchQuery) {
          stateBills = await OpenStatesService.searchStateBills(
            parsedLocation.stateCode, 
            searchQuery, 
            { limit: Math.floor(pageSize / 3), page: currentPage + 1 }
          );
        } else {
          stateBills = await OpenStatesService.getStateBills(
            parsedLocation.stateCode, 
            { limit: Math.floor(pageSize / 3), page: currentPage + 1 }
          );
        }
        bills = [...bills, ...stateBills];
      } catch (error) {
        console.error('Error fetching state bills:', error);
      }
    }
    
    if ((scope === 'Local' || scope === 'All Levels') && userProfile?.location) {
      // Fetch local ballot measures and legislation with timeout
      try {
        const localMeasures = await Promise.race([
          LocalGovernmentService.getLocalMeasuresByLocation(userProfile.location),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Local content timeout after 8 seconds')), 8000)
          )
        ]);
        
        if (localMeasures && Array.isArray(localMeasures)) {
          bills = [...bills, ...localMeasures];
          console.log(`Loaded ${localMeasures.length} local items for ${userProfile.location}`);
        }
      } catch (error) {
        console.error('Error fetching local measures:', error.message);
        
        // Fallback to simple local content generation
        try {
          const fallbackContent = generateLocalContentTemplates(userProfile.location);
          bills = [...bills, ...fallbackContent];
          console.log(`Using fallback local content (${fallbackContent.length} items)`);
        } catch (fallbackError) {
          console.error('Error generating fallback content:', fallbackError);
        }
      }
    }
    
    return bills;
  };

  // Load legislation data
  const loadLegislation = useCallback(async (reset = false) => {
    try {
      setLoading(true);
      setError(null);

      const currentPage = reset ? 0 : page;
      let bills = [];
      
      // Parse user location for state/local legislation
      const parsedLocation = userProfile?.location ? 
        locationParser.parseLocation(userProfile.location) : null;
      
      // Try universal data sources first (real data)
      try {
        const universalContent = await Promise.race([
          UniversalDataSources.getAllContent(userProfile?.location, userProfile),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Universal data timeout')), 10000)
          )
        ]);
        
        if (universalContent && universalContent.length > 0) {
          console.log(`✅ Loaded ${universalContent.length} real items from universal sources`);
          bills = [...bills, ...universalContent];
        } else {
          console.log('⚠️ No real data available, using legacy sources...');
          // Fall back to legacy API system
          bills = await loadLegacyAPISources(scope, searchQuery, currentPage, pageSize, parsedLocation, userProfile);
        }
      } catch (error) {
        console.error('Universal data sources failed:', error.message);
        console.log('⚠️ Falling back to legacy API sources...');
        // Fall back to legacy API system
        bills = await loadLegacyAPISources(scope, searchQuery, currentPage, pageSize, parsedLocation, userProfile);
      }
      
      // If no real data and it's the first page, use nationalized sample data
      if (bills.length === 0 && currentPage === 0) {
        bills = getNationalizedContent(userProfile);
      }

      // Filter by category if needed
      let filteredBills = bills;
      
      if (category && category !== 'All Issues') {
        filteredBills = filteredBills.filter(bill => bill.category === category);
      }
      
      // Additional scope filtering (in case we have mixed data)
      if (scope && scope !== 'All Levels') {
        filteredBills = filteredBills.filter(bill => {
          if (scope === 'Local') {
            // Include all local-level content: Local, City, County, Special District
            return ['Local', 'City', 'County', 'Special District'].includes(bill.scope);
          }
          return bill.scope === scope;
        });
      }
      
      // Location-based filtering for relevant local bills
      if (parsedLocation?.city && userProfile?.location) {
        filteredBills = filteredBills.filter(bill => {
          // Include federal bills
          if (bill.scope === 'Federal') return true;
          
          // Include state bills for user's state
          if (bill.scope === 'State' && bill.location?.includes(parsedLocation.state)) return true;
          
          // Include local bills for user's area
          if (bill.scope === 'Local') {
            const billLocation = bill.location?.toLowerCase() || '';
            const userCity = parsedLocation.city?.toLowerCase() || '';
            const userState = parsedLocation.state?.toLowerCase() || '';
            
            return billLocation.includes(userCity) || billLocation.includes(userState);
          }
          
          return true;
        });
      }

      // Apply relevance scoring and sort by relevance
      if (userProfile) {
        filteredBills = RelevanceScoring.sortByRelevance(filteredBills, userProfile);
      }

      // Display content immediately without waiting for AI analysis
      if (reset) {
        setLegislation(filteredBills);
        setPage(1);
      } else {
        setLegislation(prev => [...prev, ...filteredBills]);
        setPage(prev => prev + 1);
      }

      // Add personal impact analysis asynchronously (non-blocking)
      if (userProfile && filteredBills.length > 0) {
        // Run AI analysis in background without blocking UI
        Promise.allSettled(
          filteredBills.map(async (bill, index) => {
            try {
              const result = await Promise.race([
                analyzePersonalImpact(bill, userProfile),
                new Promise((_, reject) => 
                  setTimeout(() => reject(new Error('AI analysis timeout')), 10000)
                )
              ]);
              
              if (result.success) {
                const enhancedBill = {
                  ...bill,
                  personalImpact: result.data.personalImpact,
                  financialEffect: result.data.financialEffect,
                  timeline: result.data.timeline,
                  confidence: result.data.confidence,
                  isBenefit: result.data.isBenefit
                };
                
                // Update individual bill without re-rendering entire list
                setLegislation(prev => 
                  prev.map(item => item.id === bill.id ? enhancedBill : item)
                );
              }
            } catch (err) {
              console.error('Error analyzing bill impact for', bill.title, ':', err.message);
              // Continue with original bill data
            }
          })
        ).catch(err => {
          console.error('Error in background AI analysis:', err);
        });
      }

      setHasMore(filteredBills.length === pageSize);
      
    } catch (err) {
      console.error('Error loading legislation:', err);
      setError('Failed to load legislation. Using sample data.');
      
      // Fallback to nationalized sample data
      if (page === 0) {
        setLegislation(getNationalizedContent(userProfile));
      }
      setHasMore(false);
      
    } finally {
      setLoading(false);
    }
  }, [userProfile, category, scope, searchQuery, page]);

  // Load initial data
  useEffect(() => {
    loadLegislation(true);
  }, [category, scope, searchQuery]); // Reset when filters change

  // Refresh data
  const refresh = useCallback(() => {
    setPage(0);
    loadLegislation(true);
  }, [loadLegislation]);

  // Load more data
  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      loadLegislation(false);
    }
  }, [loading, hasMore, loadLegislation]);

  return {
    legislation,
    loading,
    error,
    hasMore,
    refresh,
    loadMore
  };
};