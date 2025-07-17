// API endpoint for backend server
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://voterimpact.vercel.app';

export const analyzePersonalImpact = async (legislation, userProfile) => {
  try {
    const prompt = `You are a legislative impact analyst. You must be HONEST about limitations in the data provided and ONLY analyze based on actual bill content.

AVAILABLE LEGISLATION DATA:
Title: ${legislation.title}
Status: ${legislation.status}
Category: ${legislation.category}
Scope: ${legislation.scope || 'Federal'} level legislation
Location: ${legislation.location || 'Nationwide'}
Description: ${legislation.description || 'No description provided'}
Bill Number: ${legislation.billNumber || 'Not provided'}
Congress Session: ${legislation.congress || 'Not provided'}

${legislation.summary ? `
DETAILED BILL SUMMARY:
${legislation.summary}
` : ''}

${legislation.keyProvisions ? `
KEY PROVISIONS:
${legislation.keyProvisions.map(provision => `• ${provision}`).join('\n')}
` : ''}

${legislation.fullTextExcerpts ? `
ACTUAL BILL TEXT EXCERPTS:
${legislation.fullTextExcerpts.impactSections && legislation.fullTextExcerpts.impactSections.length > 0 ? `
Impact Sections:
${legislation.fullTextExcerpts.impactSections.map(section => `"${section}"`).join('\n\n')}
` : ''}

${legislation.fullTextExcerpts.eligibilityText ? `
Eligibility Requirements:
"${legislation.fullTextExcerpts.eligibilityText}"
` : ''}

${legislation.fullTextExcerpts.financialImpact ? `
Financial Impact Details:
"${legislation.fullTextExcerpts.financialImpact}"
` : ''}
` : legislation.enhancedSummary ? `
ENHANCED BILL INFORMATION:
${legislation.enhancedSummary}

NOTE: Full bill text was not available. Analysis based on available summary and metadata.
` : ''}

${legislation.fallbackSummary ? `
ADDITIONAL CONTEXT:
${legislation.fallbackSummary}
` : ''}

${!legislation.enhancedSummary && !legislation.fallbackSummary ? 'WARNING: No actual bill text available - analysis will be limited to summary information only.' : ''}

CRITICAL INSTRUCTIONS:
- When actual bill text excerpts are provided, use them for specific, detailed analysis
- Quote specific sections and dollar amounts from the actual bill text when available
- If the status is "Passed" or "Signed into law", acknowledge this has already been enacted
- If only a title and brief description are provided, state that detailed analysis requires the full bill text
- DO NOT make up specific financial amounts, percentages, or benefits not explicitly stated in the bill text
- When bill text is available, provide specific timelines, eligibility criteria, and implementation details
- If the description seems generic or incomplete, mention this limitation in your response

USER PROFILE:
Name: ${userProfile.name}
Age: ${userProfile.age}
Location: ${userProfile.location}
Annual Income: $${(userProfile.monthly_income || 0) * 12}
Monthly Income: $${userProfile.monthly_income || 0}
Company: ${userProfile.company || 'Not specified'}
Veteran Status: ${userProfile.is_veteran ? 'Yes' : 'No'}
Political Interests: ${userProfile.political_interests?.join(', ') || 'None specified'}

WORK & ECONOMICS:
Employment Status: ${userProfile.employment_status || 'Not specified'}
Industry: ${userProfile.industry || 'Not specified'}

FAMILY & HOUSING:
Household Size: ${userProfile.household_size || 'Not specified'}
Housing Status: ${userProfile.housing_status || 'Not specified'}
Dependents: ${userProfile.dependents || 'Not specified'}

LIFESTYLE:
Transportation: ${userProfile.transportation || 'Not specified'}
Health Coverage: ${userProfile.health_coverage || 'Not specified'}
Education Level: ${userProfile.education || 'Not specified'}

CIVIC ENGAGEMENT:
Voting Frequency: ${userProfile.voting_frequency || 'Not specified'}

PERSONAL PRIORITIES:
Top Issues: ${userProfile.top_issues || 'Not specified'}
Daily Policy Impacts: ${userProfile.daily_policies || 'Not specified'}
Community Issues: ${userProfile.community_issues || 'Not specified'}
Financial Concerns: ${userProfile.financial_concerns || 'Not specified'}
Future Goals: ${userProfile.future_goals || 'Not specified'}

ANALYSIS REQUIREMENTS:
You must be COMPLETELY HONEST about what you can and cannot determine from the limited information provided.

WHEN LIMITED INFORMATION IS AVAILABLE:
1. Focus on what can reasonably be inferred from the title, category, and any available metadata
2. Use the bill's category, sponsor party affiliation, and status to provide context
3. Reference similar legislation or programs when helpful for context
4. Clearly distinguish between what is known vs. what would need the full bill text
5. Provide general impact categories (e.g., "tax-related", "veteran benefits", "healthcare access") when specific amounts aren't available
6. Always end with guidance on where to find more detailed information

IF FULL BILL TEXT IS NOT PROVIDED:
- Acknowledge that you only have the title and brief description
- State that a complete analysis would require the full legislative text
- Do not fabricate specific dollar amounts, percentages, or detailed provisions
- Be transparent about uncertainty

WHEN ESTIMATING IMPACTS:
- Only use information explicitly stated in the description
- If no specific financial provisions are mentioned, state "Financial impact cannot be determined without full bill text"
- Use ranges and uncertainty language like "potentially," "may," "would likely require full bill review"
- Set confidence scores low (under 40%) when working with limited information

FOR BILLS ALREADY PASSED:
- Clearly state "This legislation has already been enacted" 
- Acknowledge that the impacts would already be in effect or implementation phase

IMPORTANT: Write the personalImpact in SECOND PERSON perspective, directly addressing the user as "you". For example: "You would benefit from..." or "Your monthly costs would decrease by..." NOT "Steven would benefit..." or "The user would see..."

Please provide a JSON response with the following structure:
{
  "personalImpact": "HONEST assessment in SECOND PERSON. If information is limited, say so. Example: 'Based on the limited information available, this bill appears to focus on [topic]. However, without the full legislative text, I cannot determine specific impacts on your situation. A detailed analysis would require reviewing the complete bill provisions.'",
  "financialEffect": 0, // Use 0 if no specific financial provisions are stated in the description. Do not fabricate amounts.
  "timeline": "Unknown", // Use "Unknown" unless specific implementation timelines are mentioned in the description
  "confidence": 25, // Use low confidence (10-40%) when working with limited title/description only
  "isBenefit": null // Use null if impact cannot be determined from available information
}

REMEMBER: Your primary duty is honesty. If you cannot provide a meaningful analysis due to insufficient information, say so clearly. Do not make up benefits, costs, or timelines that are not explicitly supported by the provided description.`;

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
      
      // Check if AI is making up detailed benefits without sufficient information
      const hasDetailedClaims = data.personalImpact && (
        /\d+%\s*(increase|decrease)/i.test(data.personalImpact) ||
        /\$\d+/i.test(data.personalImpact) ||
        /specific.*amount/i.test(data.personalImpact)
      );
      
      const hasMinimalInfo = !legislation.description || 
        legislation.description.length < 100 ||
        legislation.description === 'No description provided';
      
      if (hasDetailedClaims && hasMinimalInfo) {
        console.warn('AI making detailed claims with insufficient bill information');
        data.confidence = Math.max(0, data.confidence - 30);
        data.personalImpact = `Based on limited information, this bill appears to relate to ${legislation.category || 'legislative matters'}. However, without access to the full bill text, I cannot provide specific details about financial impacts or benefits. A thorough analysis would require reviewing the complete legislative provisions.`;
        data.financialEffect = 0;
        data.timeline = 'Unknown';
      }
      
      // Validate financial effect is reasonable
      if (data.financialEffect && (Math.abs(data.financialEffect) > 25000)) {
        console.warn('AI provided large financial impact with limited information');
        data.financialEffect = 0;
        data.confidence = Math.max(0, data.confidence - 20);
      }
      
      // Flag high confidence with limited information
      if (data.confidence > 60 && hasMinimalInfo) {
        console.warn('AI showing overconfidence with limited bill information');
        data.confidence = Math.min(40, data.confidence);
      }
      
      // Validate confidence is between 0-100
      if (data.confidence && (data.confidence < 0 || data.confidence > 100)) {
        data.confidence = Math.max(0, Math.min(100, data.confidence));
      }
      
      // Check for status inconsistencies
      if ((legislation.status === 'Passed' || legislation.status === 'Signed into law') &&
          data.personalImpact && !data.personalImpact.toLowerCase().includes('already') &&
          !data.personalImpact.toLowerCase().includes('enacted')) {
        console.warn('AI not acknowledging bill already passed');
        data.personalImpact = `This legislation has already been enacted. ${data.personalImpact}`;
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