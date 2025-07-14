import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.REACT_APP_ANTHROPIC_API_KEY,
  dangerouslyAllowBrowser: true
});

export const analyzePersonalImpact = async (legislation, userProfile) => {
  try {
    const prompt = `You are a legislative impact analyst. Analyze how this legislation specifically affects this person and provide a personalized assessment.

LEGISLATION:
Title: ${legislation.title}
Status: ${legislation.status}
Category: ${legislation.category}
Description: ${legislation.description || 'No description provided'}

USER PROFILE:
Name: ${userProfile.name}
Age: ${userProfile.age}
Location: ${userProfile.location}
Monthly Income: $${userProfile.monthly_income || 0}
Company: ${userProfile.company || 'Not specified'}
Veteran Status: ${userProfile.is_veteran ? 'Yes' : 'No'}
Political Interests: ${userProfile.political_interests?.join(', ') || 'None specified'}

Please provide a JSON response with the following structure:
{
  "personalImpact": "A detailed 2-3 sentence explanation of how this legislation specifically affects this person based on their profile",
  "financialEffect": 0, // Estimated annual financial impact in dollars (positive for savings/benefits, negative for costs)
  "timeline": "3-6 months", // When this person would likely see the impact
  "confidence": 75, // Confidence level 0-100 in this analysis
  "isBenefit": true // true if generally positive, false if generally negative
}

Consider their location, income level, age, employment, and interests when making your analysis. Be specific about dollar amounts when possible, and explain your reasoning in the personalImpact field.`;

    const message = await anthropic.messages.create({
      model: 'claude-3-sonnet-20240229',
      max_tokens: 1000,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    });

    const responseText = message.content[0].text;
    
    // Parse the JSON response
    const jsonStart = responseText.indexOf('{');
    const jsonEnd = responseText.lastIndexOf('}') + 1;
    
    if (jsonStart === -1 || jsonEnd === 0) {
      throw new Error('Could not find JSON in response');
    }
    
    const jsonResponse = responseText.substring(jsonStart, jsonEnd);
    const analysis = JSON.parse(jsonResponse);
    
    // Validate the response structure
    if (!analysis.personalImpact || typeof analysis.financialEffect !== 'number') {
      throw new Error('Invalid response structure from Claude');
    }
    
    return {
      success: true,
      data: {
        personalImpact: analysis.personalImpact,
        financialEffect: analysis.financialEffect,
        timeline: analysis.timeline || 'Unknown',
        confidence: analysis.confidence || 50,
        isBenefit: analysis.isBenefit !== undefined ? analysis.isBenefit : null
      }
    };
    
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
    const prompt = `Please summarize this legislation in simple terms that a regular voter can understand:

${legislationText}

Provide a JSON response with:
{
  "title": "Clear, concise title",
  "summary": "2-3 sentence summary in plain English",
  "category": "One of: Economic, Healthcare, Housing, Veterans Affairs, Social Issues, Environment",
  "keyPoints": ["Point 1", "Point 2", "Point 3"]
}`;

    const message = await anthropic.messages.create({
      model: 'claude-3-sonnet-20240229',
      max_tokens: 800,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    });

    const responseText = message.content[0].text;
    const jsonStart = responseText.indexOf('{');
    const jsonEnd = responseText.lastIndexOf('}') + 1;
    
    const jsonResponse = responseText.substring(jsonStart, jsonEnd);
    const summary = JSON.parse(jsonResponse);
    
    return {
      success: true,
      data: summary
    };
    
  } catch (error) {
    console.error('Error generating legislation summary:', error);
    return {
      success: false,
      error: error.message
    };
  }
};