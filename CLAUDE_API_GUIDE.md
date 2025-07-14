# Claude API Integration Guide

## 🤖 AI-Powered Personal Impact Analysis

VoterImpact now includes Claude AI integration to generate personalized legislation impact analysis based on individual user profiles.

## 🔧 Setup Instructions

### 1. Get Claude API Key
1. Visit [console.anthropic.com](https://console.anthropic.com)
2. Create an account or sign in
3. Go to **API Keys** section
4. Create a new API key
5. Copy the key (starts with `sk-ant-api03-...`)

### 2. Add to Environment Variables
```env
REACT_APP_ANTHROPIC_API_KEY=sk-ant-api03-your-key-here
```

### 3. Restart Development Server
```bash
npm start
```

## 🎯 How It Works

### AI Toggle
Users can enable AI-powered analysis with a simple checkbox in the app interface.

### Personal Impact Analysis
When enabled, Claude AI analyzes each piece of legislation against the user's profile:

**Input Data:**
- User profile (age, location, income, veteran status, interests)
- Legislation details (title, status, category, description)

**AI Output:**
- Personalized impact explanation (2-3 sentences)
- Financial effect estimate (annual dollars)
- Timeline for impact
- Confidence level (0-100%)
- Benefit/loss classification

### Example Analysis
```json
{
  "personalImpact": "As a 32-year-old tech worker in Austin earning $62,400 annually, this housing tax credit could save you approximately $2,400 per year in reduced rent costs through increased affordable housing development.",
  "financialEffect": 2400,
  "timeline": "6-12 months",
  "confidence": 85,
  "isBenefit": true
}
```

## 🔍 Technical Implementation

### Claude Service (`src/services/claudeService.js`)

**`analyzePersonalImpact(legislation, userProfile)`**
- Sends structured prompt to Claude API
- Parses JSON response
- Handles errors gracefully
- Returns standardized format

**`generateLegislationSummary(legislationText)`**
- Summarizes complex legislation
- Categorizes by policy area
- Extracts key points

### UI Components

**LegislationCard Updates:**
- `useAI` prop enables AI features
- Loading states during analysis
- Error handling and fallbacks
- "AI Analysis" badge for generated content
- Refresh button for re-analysis

**App.js Integration:**
- AI toggle checkbox
- Pass `useAI` prop to cards
- Claude branding

## 🛡️ Security & Best Practices

### API Key Security
- ✅ Stored in environment variables
- ✅ Not committed to Git (.gitignore)
- ✅ Client-side usage flagged with `dangerouslyAllowBrowser: true`

### Rate Limiting & Costs
- API calls only made when user explicitly enables AI
- Analysis cached per legislation item
- Fallback to static data if API fails

### Error Handling
- Network failures → Show error message + fallback data
- API rate limits → Graceful degradation
- Invalid responses → Use default analysis

## 📊 Usage Analytics

Track these metrics for optimization:
- AI toggle usage rate
- Analysis generation success rate
- User engagement with AI-generated content
- API response times

## 🚀 Future Enhancements

### Phase 2 Features
1. **Bulk Analysis**: Analyze all legislation at once
2. **Real-time Updates**: New legislation auto-analysis
3. **Comparison Mode**: Compare multiple bills side-by-side
4. **Confidence Explanations**: Why is confidence high/low?

### Phase 3 Advanced Features
1. **Custom Scenarios**: "What if my income changes?"
2. **Historical Analysis**: Track how past legislation affected user
3. **Recommendation Engine**: Suggest legislation user should care about
4. **Impact Trends**: Show cumulative effects over time

## 🎛️ Configuration Options

### Prompt Customization
Edit `claudeService.js` to modify analysis prompts:
- Adjust tone (formal vs casual)
- Focus areas (financial vs social impact)
- Analysis depth (brief vs detailed)

### Model Selection
Currently uses `claude-3-sonnet-20240229`:
- Good balance of speed and quality
- Can upgrade to `claude-3-opus` for more detailed analysis
- Or `claude-3-haiku` for faster responses

## 🔧 Development Commands

```bash
# Test API connection
npm run test:claude

# Analyze sample legislation
npm run analyze:sample

# Check API usage
npm run api:status
```

## 📈 Performance Optimization

### Caching Strategy
- Cache analyses in localStorage
- Invalidate cache when user profile changes
- Background refresh for stale data

### Loading States
- Show spinner during analysis
- Progressive disclosure of results
- Optimistic UI updates

## 🆘 Troubleshooting

**"API key not found" error:**
- Check `.env` file exists and has correct key
- Restart development server
- Verify key starts with `sk-ant-api03-`

**"Rate limit exceeded":**
- Reduce frequency of API calls
- Implement request queuing
- Upgrade to higher tier plan

**"Analysis taking too long":**
- Check network connection
- Verify API status at status.anthropic.com
- Implement timeout handling

## 📞 Support

- Claude API Documentation: [docs.anthropic.com](https://docs.anthropic.com)
- VoterImpact Issues: Create GitHub issue
- API Status: [status.anthropic.com](https://status.anthropic.com)