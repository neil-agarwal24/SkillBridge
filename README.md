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

Create a `.env` file in the `backend` directory:

```env
PORT=5001
MONGODB_URI=mongodb://localhost:27017/neighbornet
GEMINI_API_KEY=your_gemini_api_key_here
```

Get your Gemini API key from: https://makersuite.google.com/app/apikey

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

### Frontend (Vercel)
```bash
cd frontend
vercel deploy
```

### Backend (Railway/Heroku)
```bash
cd backend
# Add MongoDB Atlas connection string to env
git push railway main
```

## 🤝 Contributing

This was built for a hackathon. Feel free to fork and improve!

## 📄 License

MIT License - See LICENSE file for details

## 👥 Team

Built with ❤️ by [Your Team Name]

## 🙏 Acknowledgments

- Google Generative AI for smart matching
- Next.js team for an amazing framework
- All open-source contributors
