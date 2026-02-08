# GAMIFIED SAVINGS APP - SETUP GUIDE

## Quick Start (For Hackathon Demo)

### Prerequisites
- Python 3.8+
- Node.js 18+
- MongoDB Atlas account (free tier)
- Google AI Studio API key
- Capital One Nessie API key

---

## STEP 1: Environment Configuration

### Backend Environment (.env)
Create `backend/.env` file:

```env
MONGODB_URI=mongodb+srv://your-username:your-password@cluster.mongodb.net/savings_app?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_jwt_key_here
NESSIE_API_KEY=your_nessie_api_key
GOOGLE_AI_API_KEY=your_google_ai_api_key
PORT=5000
```

#### How to get API keys:

**MongoDB Atlas:**
1. Go to https://www.mongodb.com/cloud/atlas
2. Sign up for free tier
3. Create a cluster
4. Get connection string from "Connect" button

**Google AI Studio:**
1. Go to https://aistudio.google.com
2. Click "Get API key"
3. Create new API key

**Nessie API:**
1. Go to http://api.nessieisreal.com
2. Register for API key (Capital One Sandbox)

### Frontend Environment (.env)
Create `frontend/.env` file:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

---

## STEP 2: Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment (Windows)
python -m venv venv
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run the backend server
python app.py
```

Backend will run on `http://localhost:5000`

Test it: Open browser to `http://localhost:5000/api/health`

---

## STEP 3: Seed Demo Data

```bash
# With backend virtual environment activated
python ../scripts/seed_demo_data.py
```

This creates 3 demo users:
- **alice_saves** / demo123 (House goal, $5k/$50k, Level 5)
- **bob_budgets** / demo123 (Hawaii vacation, $1.5k/$3k, Level 15)
- **carol_goals** / demo123 (Credit card, $1.8k/$2k, Level 18)

---

## STEP 4: Frontend Setup

Open a NEW terminal:

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Run the development server
npm run dev
```

Frontend will run on `http://localhost:5173`

---

## STEP 5: Test the Application

1. Open browser to `http://localhost:5173`
2. Click "Login"
3. Use demo credentials: **alice_saves** / **demo123**
4. You should see:
   - Dashboard with House goal
   - 450 points, 230 currency, 12 day streak
   - Progress bar at 10%

### Test Flow:
1. **Dashboard**: Add $100 contribution → Watch level up animation
2. **Quests**: Accept a quest → Complete it → See confetti & rewards
3. **Leaderboard**: See alice_saves at #2 (Bob is #1 with 680 points)

---

## Project Structure

```
XPense/
├── backend/
│   ├── app.py                 # Main Flask application
│   ├── config/
│   │   └── database.py        # MongoDB connection
│   ├── models/
│   │   ├── user.py           # User model
│   │   ├── goal.py           # Goal model
│   │   └── side_quest.py     # Quest model
│   ├── utils/
│   │   ├── auth.py           # JWT authentication
│   │   ├── nessie.py         # Nessie API integration
│   │   └── ai_calculator.py  # Google AI integration
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/       # React components
│   │   │   ├── ProgressBar.jsx
│   │   │   ├── StatCard.jsx
│   │   │   ├── GoalCard.jsx
│   │   │   ├── QuestCard.jsx
│   │   │   ├── BottomNav.jsx
│   │   │   └── CreateGoalModal.jsx
│   │   ├── pages/            # Page components
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Quests.jsx
│   │   │   └── Leaderboard.jsx
│   │   ├── context/          # State management
│   │   │   ├── AuthContext.jsx
│   │   │   └── GameContext.jsx
│   │   ├── services/
│   │   │   └── api.js        # API client
│   │   └── App.jsx           # Main app with routing
│   └── package.json
└── scripts/
    └── seed_demo_data.py     # Demo data seeding script
```

---

## API Endpoints Reference

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Goals
- `POST /api/goals` - Create goal (AI calculates levels automatically)
- `GET /api/goals` - Get all user goals
- `POST /api/goals/:id/contribute` - Add money to goal

### Quests
- `GET /api/quests/available` - Get all available quests
- `GET /api/quests/active` - Get user's active quests
- `POST /api/quests/:id/accept` - Accept a quest
- `POST /api/quests/:id/complete` - Complete a quest

### Gamification
- `GET /api/gamification/stats` - Get points, currency, streak
- `GET /api/gamification/leaderboard` - Get top 100 users

### AI
- `POST /api/ai/chat` - Chat with AI assistant (context-aware)

---

## Common Issues & Fixes

### Backend won't start
**Error**: `ModuleNotFoundError: No module named 'flask'`
**Fix**: Make sure virtual environment is activated and run `pip install -r requirements.txt`

### Frontend won't start
**Error**: `Cannot find module 'react-router-dom'`
**Fix**: Run `npm install` in frontend directory

### MongoDB connection error
**Error**: `Failed to connect to MongoDB`
**Fix**: Check that MONGODB_URI in .env is correct and your IP is whitelisted in MongoDB Atlas

### CORS error in browser
**Error**: `blocked by CORS policy`
**Fix**: Backend has `flask-cors` installed and configured. Make sure backend is running.

### AI not working
**Error**: AI features failing
**Fix**: Check GOOGLE_AI_API_KEY in .env. The app has fallback logic so it will work without AI but with basic calculations.

---

## Demo Presentation Tips

### 5-Minute Demo Flow:

**[0:00-0:30] Intro**
"Saving money is boring. We gamified it with AI, levels, and social accountability."

**[0:30-1:30] Dashboard**
- Login as alice_saves
- Show progress: "Alice wants to buy a house. $50k goal, currently at $5k, Level 5/50"
- Add $500 contribution → Watch level up to Level 6
- Points increase: 450 → 500, Currency: 230 → 255

**[1:30-2:30] AI Features**
- Click on goal details → Show AI-calculated levels
- "Our AI broke down this $50k goal into 50 achievable levels"
- Show daily target: "$25/day recommended"

**[2:30-3:30] Side Quests**
- Navigate to Quests tab
- Accept "No-Spend Challenge" quest
- Complete it → Confetti animation
- Show rewards: +50 points, +25 currency

**[3:30-4:30] Leaderboard & Social**
- Navigate to Leaderboard
- "Alice is #2 with 500 points. Bob leads with 680 points and a 21-day streak"
- Highlight social competition aspect

**[4:30-5:00] Closing**
- "First savings app that makes it FUN"
- "AI personalizes the journey"
- "Social accountability prevents overspending"

---

## Next Steps (Post-Hackathon)

- [ ] Deploy backend to Railway/Render
- [ ] Deploy frontend to Vercel
- [ ] Add veto card system
- [ ] Add AI chatbot interface
- [ ] Add world builder visualization
- [ ] Real bank integration (Plaid)
- [ ] Mobile app (React Native)

---

## Team Contacts

- **Anna**: Backend (Python, Flask, MongoDB)
- **Aadya**: Frontend (React, UI/UX)
- **Suhani**: Integration (API, State Management, Features)
