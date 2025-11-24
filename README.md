# NeighborNet

**Share Skills, Share Stuff, Shrink the Gap**

A hyperlocal community platform that uses AI to connect neighbors for skill-sharing, item-lending, and building stronger communities.

## 🌟 Features

- **AI-Powered Matching** - Google Gemini AI generates personalized match explanations
- **Smart Sorting** - Neighbors ranked by relevance to your profile (+10 skill match, +8 item match, +7 mutual benefit)
- **Real-Time Messaging** - Socket.io powered chat with instant notifications
- **Gamification** - Earn points for connections (10pts), exchanges (20pts), messages (5pts)
- **Interactive Leaderboard** - See top community contributors with podium display
- **Skills & Items Exchange** - Trade both services and physical items
- **Geolocation-Based** - Find neighbors within walking distance
- **Responsive Design** - Beautiful UI with Framer Motion animations

## 🚀 Tech Stack

### Frontend
- Next.js 16.0.3 with React 19
- TypeScript
- Tailwind CSS
- Framer Motion
- Socket.io Client

### Backend
- Node.js + Express
- MongoDB with Mongoose (with mock data fallback)
- Socket.io for real-time communication
- Google Generative AI (Gemini Pro)

## 📦 Installation

### Prerequisites
- Node.js 18+
- npm or pnpm

### Setup

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd NeighborNet
```

2. **Backend Setup**
```bash
cd backend
npm install
cp .env.example .env
# Add your GEMINI_API_KEY to .env
npm run dev
```

3. **Frontend Setup**
```bash
cd frontend
npm install
npm run dev
```

4. **Access the application**
- Frontend: http://localhost:3000
- Backend API: http://localhost:5001

## 🔑 Environment Variables

### Backend (.env in `/backend`)

**Required for AI features:**
```env
PORT=5001
MONGODB_URI=mongodb://localhost:27017/neighbornet
GEMINI_API_KEY=your_gemini_api_key_here

# AI Configuration (optional, has defaults)
AI_CACHE_TTL_MINUTES=60
AI_CACHE_MAX_SIZE=1000
AI_RATE_LIMIT_PER_MINUTE=30
```

Get your Gemini API key from: https://makersuite.google.com/app/apikey

**Without GEMINI_API_KEY:** AI features will use rule-based fallbacks

### Frontend (.env.local in `/frontend`)

**Required for production:**
```env
NEXT_PUBLIC_API_URL=http://localhost:5001/api
NEXT_PUBLIC_SOCKET_URL=http://localhost:5001
NEXT_PUBLIC_ENABLE_AI=true
```

**For deployment:** Update URLs to your production backend URL

## 🎮 Usage

1. **Create Profile** - Add your skills, items, and needs
2. **Discover Neighbors** - Browse AI-matched profiles sorted by relevance
3. **Connect** - Click connect to earn 10 points
4. **Message** - Start conversations with suggested openers
5. **Exchange** - Complete exchanges to earn 20 points
6. **Climb Leaderboard** - Compete for top community contributor

## 🏆 Point System

- 🤝 **10 points** - Make a new connection
- 🔄 **20 points** - Complete a skill/item exchange
- 💬 **5 points** - Send meaningful messages

## 📱 Key Pages

- **Home** - Landing page with community stats and time-lapse animation
- **Discover** - Browse and filter neighbors with AI match reasons
- **Messages** - Real-time chat with neighbors
- **Profile** - Manage your skills, items, and availability
- **Leaderboard** - Top community members ranked by points

## 🤖 AI Features

- **Match Explanations** - "Sarah can teach you piano and needs pet sitting, which you offer"
- **Suggested Messages** - Personalized conversation starters for each neighbor
- **Intelligent Fallback** - Works even without API with rule-based matching

## 📊 Mock Data

The app includes 8 demo neighbors with diverse profiles:
- Sarah Chen (Piano Teacher)
- Marcus Johnson (Handyman)
- Elena Rodriguez (New Mom)
- David Kim (Software Engineer)
- Aisha Patel (Yoga Instructor)
- Tom Anderson (Retired Teacher)
- Maria Santos (Seamstress)
- James Wilson (College Student)

## 🛠️ Development

```bash
# Backend (with auto-reload)
cd backend && npm run dev

# Frontend (with Turbopack)
cd frontend && npm run dev
```

## 🌐 Deployment

### ⚠️ Required Environment Variables

**Backend Production (.env):**
- `GEMINI_API_KEY` - **Required** for AI features (or fallbacks will be used)
- `MONGODB_URI` - Database connection string
- `PORT` - Default 5001
- `CLIENT_URL` - Frontend URL for CORS
- `AI_CACHE_TTL_MINUTES`, `AI_CACHE_MAX_SIZE`, `AI_RATE_LIMIT_PER_MINUTE` - Optional AI config

**Frontend Production (.env.local or platform config):**
- `NEXT_PUBLIC_API_URL` - **Required** - Backend API URL (e.g., `https://api.yourapp.com/api`)
- `NEXT_PUBLIC_SOCKET_URL` - **Required** - Backend WebSocket URL (e.g., `https://api.yourapp.com`)
- Without these, frontend defaults to `localhost:5001` and will fail in production

### Frontend (Vercel/Netlify)
```bash
cd frontend
# Set environment variables in platform dashboard
vercel deploy
```

### Backend (Railway/Heroku/Render)
```bash
cd backend
# Set environment variables in platform dashboard
# Add MongoDB Atlas connection string
railway up
# or
git push heroku main
```

### Health Checks
- Backend: `GET /api/health`
- AI Status: `GET /api/ai/stats` (shows cache hit rate, AI enabled status)
