const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const Anthropic = require('@anthropic-ai/sdk');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize Anthropic client with server-side API key
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'VoterImpact API is running' });
});

// Anthropic API proxy endpoint
app.post('/api/anthropic/analyze', async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({
        success: false,
        error: 'Prompt is required'
      });
    }

    // Rate limiting check (simple implementation)
    const userAgent = req.get('User-Agent');
    console.log(`API request from: ${userAgent}`);

    // Call Anthropic API
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
    
    // Parse JSON response from Claude
    const jsonStart = responseText.indexOf('{');
    const jsonEnd = responseText.lastIndexOf('}') + 1;
    
    if (jsonStart === -1 || jsonEnd === 0) {
      throw new Error('Could not find JSON in response');
    }
    
    const jsonResponse = responseText.substring(jsonStart, jsonEnd);
    const analysis = JSON.parse(jsonResponse);
    
    // Validate response structure
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
});

// Anthropic summary endpoint
app.post('/api/anthropic/summarize', async (req, res) => {
  try {
    const { legislationText } = req.body;

    if (!legislationText) {
      return res.status(400).json({
        success: false,
        error: 'Legislation text is required'
      });
    }

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
      model: 'claude-3-5-sonnet-20241022',
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
    
    res.json({
      success: true,
      data: summary
    });
    
  } catch (error) {
    console.error('Error in /api/anthropic/summarize:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: 'Something went wrong!'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found'
  });
});

app.listen(PORT, () => {
  console.log(`🚀 VoterImpact API server running on port ${PORT}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
});