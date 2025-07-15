import { useState, useEffect, useCallback } from 'react';
import CongressService from '../services/CongressService';
import OpenStatesService from '../services/OpenStatesService';
import LocalGovernmentService from '../services/LocalGovernmentService';
import { analyzePersonalImpact } from '../services/claudeService';
import locationParser from '../utils/locationParser';

// Fallback to sample data if API fails
import { sampleLegislation } from '../data/sampleLegislation';

export const useLegislation = (userProfile, filters = {}) => {
  const [legislation, setLegislation] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);

  const { category, scope, searchQuery } = filters;
  const pageSize = 20;

  // Load legislation data
  const loadLegislation = useCallback(async (reset = false) => {
    try {
      setLoading(true);
      setError(null);

      const currentPage = reset ? 0 : page;
      
      // Parse user location for state/local legislation
      const parsedLocation = userProfile?.location ? 
        locationParser.parseLocation(userProfile.location) : null;
      
      // Fetch different types of legislation based on scope filter
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
        // Fetch local ballot measures and legislation
        try {
          const localMeasures = await LocalGovernmentService.getLocalMeasuresByLocation(userProfile.location);
          bills = [...bills, ...localMeasures];
        } catch (error) {
          console.error('Error fetching local measures:', error);
        }
      }
      
      // If no real data and it's the first page, use sample data
      if (bills.length === 0 && currentPage === 0) {
        bills = sampleLegislation;
      }

      // Filter by category if needed
      let filteredBills = bills;
      
      if (category && category !== 'All Issues') {
        filteredBills = filteredBills.filter(bill => bill.category === category);
      }
      
      // Additional scope filtering (in case we have mixed data)
      if (scope && scope !== 'All Levels') {
        filteredBills = filteredBills.filter(bill => bill.scope === scope);
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

      // Add personal impact analysis for each bill (if user profile exists)
      if (userProfile) {
        const billsWithImpact = await Promise.all(
          filteredBills.map(async (bill) => {
            try {
              const result = await analyzePersonalImpact(bill, userProfile);
              if (result.success) {
                return {
                  ...bill,
                  personalImpact: result.data.personalImpact,
                  financialEffect: result.data.financialEffect,
                  timeline: result.data.timeline,
                  confidence: result.data.confidence,
                  isBenefit: result.data.isBenefit
                };
              }
            } catch (err) {
              console.error('Error analyzing bill impact:', err);
            }
            return bill;
          })
        );
        filteredBills = billsWithImpact;
      }

      if (reset) {
        setLegislation(filteredBills);
        setPage(1);
      } else {
        setLegislation(prev => [...prev, ...filteredBills]);
        setPage(prev => prev + 1);
      }

      setHasMore(filteredBills.length === pageSize);
      
    } catch (err) {
      console.error('Error loading legislation:', err);
      setError('Failed to load legislation. Using sample data.');
      
      // Fallback to sample data
      if (page === 0) {
        setLegislation(sampleLegislation);
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