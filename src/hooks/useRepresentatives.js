import { useState, useEffect, useCallback } from 'react';
import RepresentativeService from '../services/RepresentativeService';

export const useRepresentatives = (userLocation) => {
  const [representatives, setRepresentatives] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastLocation, setLastLocation] = useState(null);

  const fetchRepresentatives = useCallback(async (location) => {
    if (!location) {
      setRepresentatives([]);
      return;
    }

    // Don't refetch if location hasn't changed
    if (location === lastLocation && representatives.length > 0) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const reps = await RepresentativeService.getRepresentativesByLocation(location);
      setRepresentatives(reps);
      setLastLocation(location);
    } catch (err) {
      console.error('Failed to fetch representatives:', err);
      setError(err.message);
      setRepresentatives([]);
    } finally {
      setLoading(false);
    }
  }, [lastLocation, representatives.length]);

  useEffect(() => {
    fetchRepresentatives(userLocation);
  }, [userLocation, fetchRepresentatives]);

  const refresh = useCallback(() => {
    setLastLocation(null); // Force refetch
    fetchRepresentatives(userLocation);
  }, [userLocation, fetchRepresentatives]);

  return {
    representatives,
    loading,
    error,
    refresh
  };
};