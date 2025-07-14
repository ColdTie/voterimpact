import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

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
}