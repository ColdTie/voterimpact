-- VoterImpact Database Schema
-- Run this in your Supabase SQL Editor

-- Create user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  age INTEGER CHECK (age >= 18 AND age <= 120),
  location VARCHAR(200) NOT NULL,
  company VARCHAR(200),
  monthly_income DECIMAL(10,2) CHECK (monthly_income >= 0),
  is_veteran BOOLEAN DEFAULT FALSE,
  political_interests TEXT[],
  
  -- Work & Economics
  employment_status VARCHAR(50),
  industry VARCHAR(50),
  
  -- Family & Housing
  household_size VARCHAR(10),
  housing_status VARCHAR(50),
  dependents VARCHAR(50),
  
  -- Lifestyle
  transportation VARCHAR(50),
  health_coverage VARCHAR(50),
  education VARCHAR(50),
  
  -- Civic Engagement
  voting_frequency VARCHAR(50),
  
  -- Your Priorities (with character limits enforced in app)
  top_issues TEXT,
  daily_policies TEXT,
  community_issues TEXT,
  financial_concerns TEXT,
  future_goals TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on user_profiles
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see and edit their own profile
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

-- Create legislation table for future use
CREATE TABLE IF NOT EXISTS legislation (
  id SERIAL PRIMARY KEY,
  title VARCHAR(500) NOT NULL,
  status VARCHAR(50) NOT NULL,
  category VARCHAR(100) NOT NULL,
  description TEXT,
  financial_impact_formula TEXT,
  timeline VARCHAR(100),
  confidence_score INTEGER CHECK (confidence_score >= 0 AND confidence_score <= 100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on legislation (everyone can read, admins can write)
ALTER TABLE legislation ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view legislation" ON legislation
  FOR SELECT USING (true);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for updated_at
CREATE TRIGGER update_user_profiles_updated_at 
  BEFORE UPDATE ON user_profiles 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_legislation_updated_at 
  BEFORE UPDATE ON legislation 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();