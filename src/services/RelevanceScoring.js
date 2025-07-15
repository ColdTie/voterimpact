// Enhanced relevance scoring for personalized content recommendations
import { ContentCategories } from '../types/contentTypes';

class RelevanceScoring {
  constructor() {
    // Weight factors for different scoring criteria
    this.weights = {
      location: 0.25,
      demographics: 0.20,
      interests: 0.20,
      income: 0.15,
      veteran: 0.10,
      category: 0.10
    };
  }

  // Calculate overall relevance score for content item
  calculateRelevanceScore(contentItem, userProfile) {
    if (!userProfile || !contentItem) return 0;

    let totalScore = 0;
    let appliedWeights = 0;

    // Location scoring
    const locationScore = this.calculateLocationScore(contentItem, userProfile);
    if (locationScore > 0) {
      totalScore += locationScore * this.weights.location;
      appliedWeights += this.weights.location;
    }

    // Demographics scoring
    const demographicsScore = this.calculateDemographicsScore(contentItem, userProfile);
    if (demographicsScore > 0) {
      totalScore += demographicsScore * this.weights.demographics;
      appliedWeights += this.weights.demographics;
    }

    // Interests scoring
    const interestsScore = this.calculateInterestsScore(contentItem, userProfile);
    if (interestsScore > 0) {
      totalScore += interestsScore * this.weights.interests;
      appliedWeights += this.weights.interests;
    }

    // Income-based scoring
    const incomeScore = this.calculateIncomeScore(contentItem, userProfile);
    if (incomeScore > 0) {
      totalScore += incomeScore * this.weights.income;
      appliedWeights += this.weights.income;
    }

    // Veteran status scoring
    const veteranScore = this.calculateVeteranScore(contentItem, userProfile);
    if (veteranScore > 0) {
      totalScore += veteranScore * this.weights.veteran;
      appliedWeights += this.weights.veteran;
    }

    // Category preference scoring
    const categoryScore = this.calculateCategoryScore(contentItem, userProfile);
    if (categoryScore > 0) {
      totalScore += categoryScore * this.weights.category;
      appliedWeights += this.weights.category;
    }

    // Normalize score based on applied weights
    const normalizedScore = appliedWeights > 0 ? (totalScore / appliedWeights) * 100 : 0;
    
    return Math.min(100, Math.max(0, normalizedScore));
  }

  // Score based on geographic relevance
  calculateLocationScore(contentItem, userProfile) {
    if (!userProfile.location || !contentItem.location) return 0;

    const userLocation = userProfile.location.toLowerCase();
    const itemLocation = contentItem.location;

    // Exact city match gets highest score
    if (itemLocation.city && userLocation.includes(itemLocation.city.toLowerCase())) {
      return 100;
    }

    // County match gets high score
    if (itemLocation.county && userLocation.includes(itemLocation.county.toLowerCase())) {
      return 85;
    }

    // State match gets medium score
    if (itemLocation.state && userLocation.includes(itemLocation.state.toLowerCase())) {
      return 70;
    }

    // State code match
    if (itemLocation.stateCode && userLocation.includes(itemLocation.stateCode.toLowerCase())) {
      return 70;
    }

    // Federal content gets baseline score for all users
    if (contentItem.scope === 'Federal') {
      return 50;
    }

    return 0;
  }

  // Score based on user demographics
  calculateDemographicsScore(contentItem, userProfile) {
    if (!contentItem.relevantDemographics) return 0;

    const userDemographics = this.getUserDemographics(userProfile);
    const matches = contentItem.relevantDemographics.filter(demo => 
      userDemographics.includes(demo) || demo === 'all_residents'
    );

    if (matches.length === 0) return 0;

    // Score based on percentage of matching demographics
    const matchPercentage = matches.length / Math.max(contentItem.relevantDemographics.length, 1);
    return matchPercentage * 100;
  }

  // Score based on user interests
  calculateInterestsScore(contentItem, userProfile) {
    if (!contentItem.relevantInterests || !userProfile.interests) return 0;

    const userInterests = userProfile.interests.map(i => i.toLowerCase());
    const matches = contentItem.relevantInterests.filter(interest => 
      userInterests.includes(interest.toLowerCase())
    );

    if (matches.length === 0) return 0;

    // Score based on percentage of matching interests
    const matchPercentage = matches.length / Math.max(contentItem.relevantInterests.length, 1);
    return matchPercentage * 100;
  }

  // Score based on income relevance
  calculateIncomeScore(contentItem, userProfile) {
    if (!contentItem.incomeRelevance || !userProfile.monthlyIncome) return 0;

    const annualIncome = userProfile.monthlyIncome * 12;
    const incomeCategory = this.getIncomeCategory(annualIncome);

    if (contentItem.incomeRelevance.includes(incomeCategory) || 
        contentItem.incomeRelevance.includes('any_income')) {
      return 80;
    }

    return 0;
  }

  // Score based on veteran status
  calculateVeteranScore(contentItem, userProfile) {
    // High priority for veterans affairs content
    if (contentItem.category === ContentCategories.VETERANS_AFFAIRS) {
      return userProfile.isVeteran ? 100 : 20;
    }

    // Check if content specifically targets veterans
    if (contentItem.relevantDemographics?.includes('veterans') ||
        contentItem.relevantDemographics?.includes('military_families')) {
      return userProfile.isVeteran ? 90 : 0;
    }

    return 0;
  }

  // Score based on category preferences
  calculateCategoryScore(contentItem, userProfile) {
    if (!userProfile.priorityCategories || !contentItem.category) return 0;

    const categoryPriority = userProfile.priorityCategories.indexOf(contentItem.category);
    
    if (categoryPriority === -1) return 0;

    // Higher score for higher priority categories (lower index)
    const maxPriorities = userProfile.priorityCategories.length;
    return ((maxPriorities - categoryPriority) / maxPriorities) * 100;
  }

  // Determine user demographics based on profile
  getUserDemographics(userProfile) {
    const demographics = [];

    // Age-based demographics
    if (userProfile.age) {
      if (userProfile.age >= 65) demographics.push('seniors');
      if (userProfile.age <= 30) demographics.push('young_adults');
      if (userProfile.age >= 18 && userProfile.age <= 25) demographics.push('students');
    }

    // Income-based demographics
    if (userProfile.monthlyIncome) {
      const annualIncome = userProfile.monthlyIncome * 12;
      if (annualIncome < 50000) demographics.push('low_income');
      if (annualIncome > 100000) demographics.push('high_income');
    }

    // Veteran status
    if (userProfile.isVeteran) {
      demographics.push('veterans', 'military_families');
    }

    // Housing status (inferred from goals/interests)
    if (userProfile.goals?.includes('home_purchase') || 
        userProfile.interests?.includes('housing_affordability')) {
      demographics.push('renters', 'potential_homebuyers');
    }

    // Family status (inferred from interests)
    if (userProfile.interests?.includes('education_policy') ||
        userProfile.interests?.includes('childcare')) {
      demographics.push('families_with_children');
    }

    // Transportation usage
    if (userProfile.interests?.includes('public_transportation')) {
      demographics.push('public_transit_users');
    }

    // Default
    demographics.push('all_residents');

    return demographics;
  }

  // Categorize income level
  getIncomeCategory(annualIncome) {
    if (annualIncome < 30000) return 'very_low_income';
    if (annualIncome < 50000) return 'low_income';
    if (annualIncome < 80000) return 'moderate_income';
    if (annualIncome < 120000) return 'middle_income';
    return 'high_income';
  }

  // Sort content by relevance score
  sortByRelevance(contentArray, userProfile) {
    return contentArray
      .map(item => ({
        ...item,
        relevanceScore: this.calculateRelevanceScore(item, userProfile)
      }))
      .sort((a, b) => b.relevanceScore - a.relevanceScore);
  }

  // Filter content by minimum relevance threshold
  filterByRelevance(contentArray, userProfile, minScore = 30) {
    return this.sortByRelevance(contentArray, userProfile)
      .filter(item => item.relevanceScore >= minScore);
  }

  // Get personalized content recommendations
  getPersonalizedRecommendations(contentArray, userProfile, limit = 10) {
    const scored = this.filterByRelevance(contentArray, userProfile, 25);
    return scored.slice(0, limit);
  }
}

export default new RelevanceScoring();