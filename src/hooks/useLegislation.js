import { useState, useEffect, useCallback } from 'react';
import CongressService from '../services/CongressService';
import { analyzePersonalImpact } from '../services/claudeService';

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
      
      // Try to fetch from Congress.gov API
      let bills = [];
      
      if (searchQuery) {
        bills = await CongressService.searchBills(searchQuery, {
          limit: pageSize,
          offset: currentPage * pageSize
        });
      } else {
        const response = await CongressService.getRecentBills({
          limit: pageSize,
          offset: currentPage * pageSize
        });
        bills = response;
      }

      // Filter by category and scope if needed
      let filteredBills = bills;
      
      if (category && category !== 'All Issues') {
        filteredBills = filteredBills.filter(bill => bill.category === category);
      }
      
      if (scope && scope !== 'All Levels') {
        filteredBills = filteredBills.filter(bill => bill.scope === scope);
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