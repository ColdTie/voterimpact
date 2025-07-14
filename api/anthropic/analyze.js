import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({
        success: false,
        error: 'Prompt is required'
      });
    }

    console.log(`API request from: ${req.headers['user-agent']}`);

    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1000,
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
    
    if (jsonStart === -1 || jsonEnd === 0) {
      throw new Error('Could not find JSON in response');
    }
    
    const jsonResponse = responseText.substring(jsonStart, jsonEnd);
    const analysis = JSON.parse(jsonResponse);
    
    if (!analysis.personalImpact || typeof analysis.financialEffect !== 'number') {
      throw new Error('Invalid response structure from Claude');
    }
    
    res.json({
      success: true,
      data: {
        personalImpact: analysis.personalImpact,
        financialEffect: analysis.financialEffect,
        timeline: analysis.timeline || 'Unknown',
        confidence: analysis.confidence || 50,
        isBenefit: analysis.isBenefit !== undefined ? analysis.isBenefit : null
      }
    });
    
  } catch (error) {
    console.error('Error in /api/anthropic/analyze:', error);
    
    res.status(500).json({
      success: false,
      error: error.message,
      data: {
        personalImpact: 'Unable to analyze personal impact at this time. Please try again later.',
        financialEffect: 0,
        timeline: 'Unknown',
        confidence: 0,
        isBenefit: null
      }
    });
  }
}