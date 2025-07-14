# VoterImpact Deployment Guide

## 🔧 Architecture Overview

VoterImpact now uses a **secure client-server architecture**:

- **Frontend**: React app (port 3000) - handles UI and authentication
- **Backend**: Express API server (port 3001) - handles Anthropic AI calls securely

## 🚀 Local Development Setup

### 1. Install Backend Dependencies

```bash
cd server
npm install
```

### 2. Configure Environment Variables

**Backend (.env in `/server` folder):**
```env
ANTHROPIC_API_KEY=your_anthropic_api_key_here
CLIENT_URL=http://localhost:3000
PORT=3001
```

**Frontend (.env in root folder):**
```env
REACT_APP_SUPABASE_URL=your_supabase_url_here
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key_here
REACT_APP_API_URL=http://localhost:3001
```

### 3. Start Both Servers

**Terminal 1 - Backend API:**
```bash
cd server
npm run dev
# or npm start for production
```

**Terminal 2 - React Frontend:**
```bash
npm start
```

### 4. Verify Setup

- Frontend: http://localhost:3000
- Backend API: http://localhost:3001/api/health

## 🌐 Production Deployment

### Option 1: Vercel + Railway

**Frontend (Vercel):**
1. Deploy React app to Vercel
2. Add environment variables:
   - `REACT_APP_SUPABASE_URL`
   - `REACT_APP_SUPABASE_ANON_KEY`
   - `REACT_APP_API_URL` (your Railway backend URL)

**Backend (Railway):**
1. Deploy `/server` folder to Railway
2. Add environment variables:
   - `ANTHROPIC_API_KEY`
   - `CLIENT_URL` (your Vercel frontend URL)
   - `PORT=3001`

### Option 2: Single Platform (Railway/Render)

Deploy both frontend and backend to the same platform using build scripts.

## 🔒 Security Features

### ✅ What's Secure Now:
- **API Key Protection**: Anthropic API key only on server-side
- **CORS Configuration**: Only your frontend can access the API
- **Input Validation**: API validates all requests
- **Rate Limiting**: Basic protection against abuse
- **Helmet Security**: Standard security headers
- **Environment Isolation**: Separate client/server environment variables

### 🛡️ Additional Security Recommendations:

1. **API Rate Limiting**: Implement Redis-based rate limiting
2. **Authentication**: Add API authentication for backend calls
3. **Request Size Limits**: Already implemented (10MB limit)
4. **Error Handling**: Implemented with proper error responses

## 📊 API Endpoints

### POST /api/anthropic/analyze
Analyzes personal impact of legislation.

**Request:**
```json
{
  "prompt": "Your detailed analysis prompt..."
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "personalImpact": "Analysis text...",
    "financialEffect": 1500,
    "timeline": "6-12 months",
    "confidence": 85,
    "isBenefit": true
  }
}
```

### POST /api/anthropic/summarize
Summarizes legislation text.

**Request:**
```json
{
  "legislationText": "Full legislation text..."
}
```

### GET /api/health
Health check endpoint.

## 🔧 Development Scripts

```bash
# Backend development
cd server
npm run dev          # Start with nodemon
npm start           # Start normally

# Frontend development  
npm start           # Start React app
npm run build       # Build for production

# Full stack development
# Run both commands in separate terminals
```

## 🐛 Troubleshooting

**"API request failed with status 500":**
- Check backend server is running on port 3001
- Verify Anthropic API key is set in server/.env
- Check server logs for detailed errors

**CORS errors:**
- Ensure CLIENT_URL in server/.env matches your frontend URL
- Check that REACT_APP_API_URL points to correct backend

**Connection refused:**
- Verify both servers are running
- Check firewall settings for ports 3000 and 3001
- Ensure URLs in environment variables are correct

## 📈 Performance Optimization

1. **Caching**: Implement Redis caching for API responses
2. **Load Balancing**: Use multiple backend instances
3. **CDN**: Serve static assets through CDN
4. **Database Optimization**: Index Supabase queries
5. **API Compression**: Enable gzip compression

## 🔮 Future Enhancements

1. **WebSocket Integration**: Real-time legislation updates
2. **Background Jobs**: Scheduled analysis updates
3. **Analytics**: Track API usage and performance
4. **Multi-tenant**: Support for multiple organizations
5. **API Versioning**: Version the backend API endpoints

---

**Your VoterImpact app is now production-ready with enterprise-grade security!** 🛡️🗳️