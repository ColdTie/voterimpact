import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      
      if (session?.user) {
        await fetchUserProfile(session.user.id);
      }
      
      setLoading(false);
    };

    getSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null);
        
        if (session?.user) {
          await fetchUserProfile(session.user.id);
        } else {
          setUserProfile(null);
        }
        
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching user profile:', error);
        setUserProfile(null);
        return;
      }

      if (data) {
        console.log('User profile loaded successfully:', data);
        setUserProfile(data);
      } else {
        console.log('No user profile found - new user needs to create profile');
        setUserProfile(null);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const signUp = async (email, password) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    return { data, error };
  };

  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (!error) {
      setUserProfile(null);
    }
    return { error };
  };

  const updateProfile = async (profileData) => {
    if (!user) return { error: { message: 'No user logged in' } };

    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .upsert({
          id: user.id,
          name: profileData.name,
          age: profileData.age,
          location: profileData.location,
          company: profileData.company,
          monthly_income: profileData.monthly_income,
          is_veteran: profileData.is_veteran,
          political_interests: profileData.political_interests,
          employment_status: profileData.employment_status,
          industry: profileData.industry,
          household_size: profileData.household_size,
          housing_status: profileData.housing_status,
          dependents: profileData.dependents,
          transportation: profileData.transportation,
          health_coverage: profileData.health_coverage,
          education: profileData.education,
          voting_frequency: profileData.voting_frequency,
          top_issues: profileData.top_issues,
          daily_policies: profileData.daily_policies,
          community_issues: profileData.community_issues,
          financial_concerns: profileData.financial_concerns,
          future_goals: profileData.future_goals,
        })
        .select()
        .single();

      if (error) throw error;

      setUserProfile(data);
      return { data, error: null };
    } catch (error) {
      console.error('Error updating profile:', error);
      console.error('Error details:', error.message, error.details, error.hint);
      return { data: null, error };
    }
  };

  const value = {
    user,
    userProfile,
    loading,
    signUp,
    signIn,
    signOut,
    updateProfile,
    fetchUserProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};