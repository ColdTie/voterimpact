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
${userProfile.is_veteran ? `
VETERAN-SPECIFIC CONSIDERATIONS:
- Analyze VA benefit interactions and eligibility changes
- Consider military pension implications (TSP, retirement pay)
- Account for veteran tax benefits and exemptions
- Evaluate veteran-specific programs and services
- Consider VA healthcare and disability compensation impacts
` : ''}

LOCATION-SPECIFIC FACTORS:
- Consider cost of living in ${userProfile.location}
- Account for state and local tax implications
- Evaluate regional economic conditions
- Consider local industry impacts (${userProfile.location.includes('Nevada') || userProfile.location.includes('Las Vegas') ? 'gaming/tourism industry,' : ''} cost of living variations)

IMPORTANT: Write the personalImpact in SECOND PERSON perspective, directly addressing the user as "you". For example: "You would benefit from..." or "Your monthly costs would decrease by..." NOT "Steven would benefit..." or "The user would see..."

Please provide a JSON response with the following structure:
{
  "personalImpact": "A detailed 2-3 sentence explanation written in SECOND PERSON (you/your) of how this legislation specifically affects the user based on their profile, veteran status, and location",
  "financialEffect": 0, // Estimated annual financial impact in dollars (positive for savings/benefits, negative for costs)
  "timeline": "3-6 months", // When this person would likely see the impact
  "confidence": 75, // Confidence level 0-100 in this analysis
  "isBenefit": true // true if generally positive, false if generally negative
}

Consider their location-specific factors, income level, age, employment, veteran status, and interests when making your analysis. Be specific about dollar amounts when possible, and explain your reasoning in the personalImpact field using "you/your" language. For veterans, always consider VA benefits, military retirement, and veteran-specific tax implications.`;

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