import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

const UserProfileForm = ({ onComplete }) => {
  const { userProfile, updateProfile } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    location: '',
    company: '',
    monthly_income: '',
    is_veteran: false,
    political_interests: [],
    employmentStatus: '',
    industry: '',
    householdSize: '',
    housingStatus: '',
    dependents: '',
    transportation: '',
    healthcoverage: '',
    education: '',
    votingFrequency: '',
    topIssues: '',
    dailyPolicies: '',
    communityIssues: '',
    financialConcerns: '',
    futureGoals: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [expandedSections, setExpandedSections] = useState({
    basic: true,
    work: false,
    family: false,
    lifestyle: false,
    civic: false,
    priorities: false
  });

  const interestOptions = [
    'Economic',
    'Veterans Affairs',
    'Social Issues',
    'Healthcare',
    'Housing',
    'Environment'
  ];

  const employmentOptions = ['Full-time', 'Part-time', 'Self-employed', 'Student', 'Retired', 'Unemployed', 'Disability'];
  const industryOptions = ['Healthcare', 'Education', 'Technology', 'Manufacturing', 'Agriculture', 'Government', 'Finance', 'Other'];
  const householdSizeOptions = ['1', '2', '3', '4', '5', '6+'];
  const housingStatusOptions = ['Own', 'Rent', 'Living with family', 'Other'];
  const dependentsOptions = ['No children', '1 child', '2 children', '3+ children', 'Elderly dependents'];
  const transportationOptions = ['Car owner', 'Public transit', 'Walk/bike', 'Ride share', 'Work from home'];
  const healthCoverageOptions = ['Employer insurance', 'ACA marketplace', 'Medicare', 'Medicaid', 'VA', 'Uninsured'];
  const educationOptions = ['High school', 'Some college', 'Bachelor\'s', 'Graduate degree', 'Trade school'];
  const votingFrequencyOptions = ['Every election', 'Major elections only', 'Occasionally', 'First-time voter'];

  useEffect(() => {
    if (userProfile) {
      setFormData({
        name: userProfile.name || '',
        age: userProfile.age || '',
        location: userProfile.location || '',
        company: userProfile.company || '',
        monthly_income: userProfile.monthly_income || '',
        is_veteran: userProfile.is_veteran || false,
        political_interests: userProfile.political_interests || [],
        employmentStatus: userProfile.employment_status || '',
        industry: userProfile.industry || '',
        householdSize: userProfile.household_size || '',
        housingStatus: userProfile.housing_status || '',
        dependents: userProfile.dependents || '',
        transportation: userProfile.transportation || '',
        healthcoverage: userProfile.health_coverage || '',
        education: userProfile.education || '',
        votingFrequency: userProfile.voting_frequency || '',
        topIssues: userProfile.top_issues || '',
        dailyPolicies: userProfile.daily_policies || '',
        communityIssues: userProfile.community_issues || '',
        financialConcerns: userProfile.financial_concerns || '',
        futureGoals: userProfile.future_goals || ''
      });
    }
  }, [userProfile]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleInterestChange = (interest) => {
    setFormData(prev => ({
      ...prev,
      political_interests: prev.political_interests.includes(interest)
        ? prev.political_interests.filter(i => i !== interest)
        : [...prev.political_interests, interest]
    }));
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const validateTextarea = (text, limit) => {
    return text.length <= limit;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validation
    if (!formData.name || !formData.location || !formData.age) {
      setError('Please fill in all required fields');
      setLoading(false);
      return;
    }

    if (formData.age < 18 || formData.age > 120) {
      setError('Age must be between 18 and 120');
      setLoading(false);
      return;
    }

    // Validate textarea character limits
    if (!validateTextarea(formData.topIssues, 500)) {
      setError('Top issues must be 500 characters or less');
      setLoading(false);
      return;
    }
    if (!validateTextarea(formData.dailyPolicies, 300)) {
      setError('Daily policies must be 300 characters or less');
      setLoading(false);
      return;
    }
    if (!validateTextarea(formData.communityIssues, 300)) {
      setError('Community issues must be 300 characters or less');
      setLoading(false);
      return;
    }
    if (!validateTextarea(formData.financialConcerns, 200)) {
      setError('Financial concerns must be 200 characters or less');
      setLoading(false);
      return;
    }
    if (!validateTextarea(formData.futureGoals, 200)) {
      setError('Future goals must be 200 characters or less');
      setLoading(false);
      return;
    }

    try {
      const profileData = {
        ...formData,
        age: parseInt(formData.age),
        monthly_income: formData.monthly_income ? parseFloat(formData.monthly_income) : null,
        employment_status: formData.employmentStatus,
        household_size: formData.householdSize,
        housing_status: formData.housingStatus,
        health_coverage: formData.healthcoverage,
        voting_frequency: formData.votingFrequency,
        top_issues: formData.topIssues,
        daily_policies: formData.dailyPolicies,
        community_issues: formData.communityIssues,
        financial_concerns: formData.financialConcerns,
        future_goals: formData.futureGoals
      };

      const { error } = await updateProfile(profileData);
      
      if (error) throw error;
      
      if (onComplete) onComplete();
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const renderSection = (title, section, children) => (
    <div className="border border-gray-200 rounded-lg">
      <button
        type="button"
        onClick={() => toggleSection(section)}
        className="w-full px-4 py-3 text-left bg-gray-50 hover:bg-gray-100 flex justify-between items-center"
      >
        <span className="font-medium text-gray-700">{title}</span>
        <span className="text-gray-500">
          {expandedSections[section] ? '−' : '+'}
        </span>
      </button>
      {expandedSections[section] && (
        <div className="p-4 space-y-4">
          {children}
        </div>
      )}
    </div>
  );

  const renderDropdown = (name, label, options, value, required = false) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && '*'}
      </label>
      <select
        name={name}
        value={value}
        onChange={handleInputChange}
        required={required}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="">Select...</option>
        {options.map((option) => (
          <option key={option} value={option}>{option}</option>
        ))}
      </select>
    </div>
  );

  const renderTextarea = (name, label, value, maxLength, placeholder = '') => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} <span className="text-gray-500">({maxLength} char limit)</span>
      </label>
      <textarea
        name={name}
        value={value}
        onChange={handleInputChange}
        maxLength={maxLength}
        placeholder={placeholder}
        rows={3}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <div className="text-xs text-gray-500 mt-1">
        {value.length}/{maxLength} characters
      </div>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        {userProfile ? 'Update Your Profile' : 'Complete Your Profile'}
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {renderSection('Basic Info', 'basic', (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Age *
              </label>
              <input
                type="number"
                name="age"
                required
                min="18"
                max="120"
                value={formData.age}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Location (City, State) *
              </label>
              <input
                type="text"
                name="location"
                required
                placeholder="e.g., Austin, TX"
                value={formData.location}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Monthly Income ($)
              </label>
              <input
                type="number"
                name="monthly_income"
                min="0"
                step="100"
                value={formData.monthly_income}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                name="is_veteran"
                checked={formData.is_veteran}
                onChange={handleInputChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label className="ml-2 block text-sm text-gray-700">
                I am a military veteran
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Political Interests
              </label>
              <div className="space-y-2">
                {interestOptions.map((interest) => (
                  <label key={interest} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.political_interests.includes(interest)}
                      onChange={() => handleInterestChange(interest)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">{interest}</span>
                  </label>
                ))}
              </div>
            </div>
          </>
        ))}

        {renderSection('Work & Economics', 'work', (
          <>
            {renderDropdown('employmentStatus', 'Employment Status', employmentOptions, formData.employmentStatus)}
            {renderDropdown('industry', 'Industry', industryOptions, formData.industry)}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Company/Employer
              </label>
              <input
                type="text"
                name="company"
                value={formData.company}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </>
        ))}

        {renderSection('Family & Housing', 'family', (
          <>
            {renderDropdown('householdSize', 'Household Size', householdSizeOptions, formData.householdSize)}
            {renderDropdown('housingStatus', 'Housing Status', housingStatusOptions, formData.housingStatus)}
            {renderDropdown('dependents', 'Dependents', dependentsOptions, formData.dependents)}
          </>
        ))}

        {renderSection('Lifestyle', 'lifestyle', (
          <>
            {renderDropdown('transportation', 'Transportation', transportationOptions, formData.transportation)}
            {renderDropdown('healthcoverage', 'Health Coverage', healthCoverageOptions, formData.healthcoverage)}
            {renderDropdown('education', 'Education Level', educationOptions, formData.education)}
          </>
        ))}

        {renderSection('Civic Engagement', 'civic', (
          <>
            {renderDropdown('votingFrequency', 'Voting Frequency', votingFrequencyOptions, formData.votingFrequency)}
          </>
        ))}

        {renderSection('Your Priorities', 'priorities', (
          <>
            {renderTextarea('topIssues', 'Top 3 political issues you care about', formData.topIssues, 500, 'Describe the political issues that matter most to you...')}
            {renderTextarea('dailyPolicies', 'Government policies affecting your daily life', formData.dailyPolicies, 300, 'How do current policies impact your day-to-day life?')}
            {renderTextarea('communityIssues', 'Local community problems needing attention', formData.communityIssues, 300, 'What issues does your local community face?')}
            {renderTextarea('financialConcerns', 'Biggest financial concerns', formData.financialConcerns, 200, 'What are your main financial worries?')}
            {renderTextarea('futureGoals', 'Goals for next 5 years', formData.futureGoals, 200, 'What do you hope to achieve in the next 5 years?')}
          </>
        ))}

        <button
          type="submit"
          disabled={loading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {loading ? 'Saving...' : 'Save Profile'}
        </button>
      </form>
    </div>
  );
};

export default UserProfileForm;