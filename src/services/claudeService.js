// API endpoint for backend server
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://voterimpact.vercel.app';

export const analyzePersonalImpact = async (legislation, userProfile) => {
  try {
    const prompt = `You are a legislative impact analyst specializing in personalized assessments. Analyze how this legislation specifically affects this person and provide a detailed, personalized assessment written in SECOND PERSON (using "you/your").

LEGISLATION:
Title: ${legislation.title}
Status: ${legislation.status}
Category: ${legislation.category}
Scope: ${legislation.scope || 'Federal'} level legislation
Location: ${legislation.location || 'Nationwide'}
Description: ${legislation.description || 'No description provided'}

USER PROFILE:
Name: ${userProfile.name}
Age: ${userProfile.age}
Location: ${userProfile.location}
Annual Income: $${(userProfile.monthly_income || 0) * 12}
Monthly Income: $${userProfile.monthly_income || 0}
Company: ${userProfile.company || 'Not specified'}
Veteran Status: ${userProfile.is_veteran ? 'Yes' : 'No'}
Political Interests: ${userProfile.political_interests?.join(', ') || 'None specified'}

ANALYSIS REQUIREMENTS:
Focus on the ACTUAL CONTENT and PROVISIONS of this legislation. Only mention topics that are directly relevant to the bill's content.

DEMOGRAPHIC CONSIDERATIONS (only if relevant to this specific bill):
- Age-related impacts: Consider if the legislation has provisions that specifically affect the user's age group
- Income-based impacts: Analyze tax implications, benefit eligibility, or costs based on the user's income level
- Location impacts: Consider how the legislation affects residents of ${userProfile.location}
- Employment impacts: Consider how this affects workers in the user's industry/employment situation
- Veteran impacts: Only mention if this bill specifically contains veteran-related provisions or benefits
- Other relevant demographics: Only include factors that are directly addressed in the legislation

FINANCIAL IMPACT CALCULATION:
- Base estimates on the actual financial provisions in the legislation
- Use realistic calculations based on the user's income level and circumstances
- Don't use arbitrary or inflated numbers
- Consider both direct and indirect financial effects

IMPORTANT: Write the personalImpact in SECOND PERSON perspective, directly addressing the user as "you". For example: "You would benefit from..." or "Your monthly costs would decrease by..." NOT "Steven would benefit..." or "The user would see..."

Please provide a JSON response with the following structure:
{
  "personalImpact": "A detailed 2-3 sentence explanation written in SECOND PERSON (you/your) of how this legislation specifically affects the user based on their profile, veteran status, and location",
  "financialEffect": 0, // Estimated annual financial impact in dollars (positive for savings/benefits, negative for costs)
  "timeline": "3-6 months", // When this person would likely see the impact
  "confidence": 75, // Confidence level 0-100 in this analysis
  "isBenefit": true // true if generally positive, false if generally negative
}

Consider their location-specific factors, income level, age, employment, and interests when making your analysis, but ONLY if those factors are actually relevant to the specific provisions in this legislation. Be specific about dollar amounts when possible, and explain your reasoning in the personalImpact field using "you/your" language.`;

    // Call backend API instead of Anthropic directly
    const response = await fetch(`${API_BASE_URL}/api/anthropic/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt })
    });

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'API request failed');
    }

    // Validate and sanitize the AI response
    if (result.data) {
      const data = result.data;
      
      // Validate financial effect is reasonable (between -$50k and +$50k annually)
      if (data.financialEffect && (Math.abs(data.financialEffect) > 50000)) {
        console.warn('AI provided unrealistic financial impact, capping at reasonable levels');
        data.financialEffect = Math.sign(data.financialEffect) * Math.min(Math.abs(data.financialEffect), 10000);
      }
      
      // Validate confidence is between 0-100
      if (data.confidence && (data.confidence < 0 || data.confidence > 100)) {
        data.confidence = Math.max(0, Math.min(100, data.confidence));
      }
      
      // Ensure personal impact doesn't contain excessive veteran bias for non-veteran bills
      if (data.personalImpact && !legislation.title?.toLowerCase().includes('veteran') && 
          !legislation.description?.toLowerCase().includes('veteran')) {
        const veteranKeywords = ['va benefits', 'military pension', 'veteran compensation', 'va disability'];
        const hasVeteranBias = veteranKeywords.some(keyword => 
          data.personalImpact.toLowerCase().includes(keyword)
        );
        
        if (hasVeteranBias) {
          console.warn('AI response contains veteran bias for non-veteran legislation, flagging for review');
          data.confidence = Math.max(0, data.confidence - 25); // Reduce confidence for biased responses
        }
      }
    }
    
    return result;
    
  } catch (error) {
    console.error('Error analyzing personal impact:', error);
    return {
      success: false,
      error: error.message,
      data: {
        personalImpact: 'Unable to analyze personal impact at this time. Please try again later.',
        financialEffect: 0,
        timeline: 'Unknown',
        confidence: 0,
        isBenefit: null
      }
    };
  }
};

export const generateLegislationSummary = async (legislationText) => {
  try {
    // Call backend API instead of Anthropic directly
    const response = await fetch(`${API_BASE_URL}/api/anthropic/summarize`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ legislationText })
    });

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'API request failed');
    }
    
    return result;
    
  } catch (error) {
    console.error('Error generating legislation summary:', error);
    return {
      success: false,
      error: error.message
    };
  }
};