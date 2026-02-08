# Test Guide – XPense App

## Prerequisites

1. **MongoDB Atlas** – Free cluster with connection string  
2. **Node.js** – For frontend  
3. **Python 3** – For backend  

---

## Step 1: Create Backend `.env`

Create `backend/.env`:

```bash
cp backend/.env.example backend/.env
```

Edit `backend/.env` and set:

- **MONGODB_URI** – Your MongoDB Atlas connection string (required)
- **JWT_SECRET** – Any random string (e.g. `hackathon123`)
- **NESSIE_API_KEY** – From http://api.nessieisreal.com (optional for basic testing)
- **GOOGLE_AI_API_KEY** – From https://aistudio.google.com (optional for basic testing)
- **PORT** – 5000 (default)

> **Minimum to run:** MONGODB_URI and JWT_SECRET. The app can start without Nessie/Google AI (some features will fail).

---

## Step 2: Backend Setup

```bash
cd backend
python3 -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

---

## Step 3: Seed Demo Data

```bash
# From project root, with backend venv activated:
cd backend
source venv/bin/activate   # or venv\Scripts\activate on Windows
python ../scripts/seed_demo_data.py
```

This creates users: `alice_saves`, `bob_budgets`, `carol_goals` (password: `demo123`).

---

## Step 4: Start Backend

```bash
cd backend
source venv/bin/activate
python app.py
```

You should see:
- `✓ Successfully connected to MongoDB!`
- Backend at http://localhost:5000

---

## Step 5: Frontend Setup & Start

Open a **new terminal**:

```bash
cd frontend
npm install
npm run dev
```

Frontend at http://localhost:5173

---

## Step 6: Quick Health Check

- Backend: http://localhost:5000/api/health → `{"status":"healthy"}`
- Frontend: http://localhost:5173 → Login screen

---

## What to Test

| Test | How |
|------|-----|
| **Login** | Username: `alice_saves`, Password: `demo123` |
| **Onboarding** | If no goals, create one (goal name, target amount) |
| **Dashboard** | Points, streak, rank, goal progress |
| **Goal** | Add contribution → level up → confetti |
| **Quests** | Quests tab → Accept quest → Complete quest |
| **AI Chat** | AI icon → Send message |
| **Profile** | Profile tab |
| **Social** | Social tab (mock feed) |

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Backend won't start | Check MONGODB_URI in `backend/.env` |
| "Cannot connect to MongoDB" | Add your IP in MongoDB Atlas → Network Access |
| Frontend blank / 404 | Ensure backend is running on port 5000 |
| Login fails | Run `seed_demo_data.py` again |
| AI chat fails | Add GOOGLE_AI_API_KEY to `.env` |
