# XPense — Gamified Savings App

A gamified personal finance app: set goals, level up as you save, get AI-driven daily amounts and levels, and use social features (feed, nudges, veto requests).

## Tech Stack

| Layer    | Stack |
|----------|--------|
| Frontend | React (Vite), Tailwind CSS, Framer Motion |
| Backend  | Python, Flask, PyMongo |
| Database | MongoDB Atlas |
| AI       | Google AI (Gemini) for goals and chat |

## How to Run

### 1. Backend

```bash
cd backend
python -m venv venv
```

- **Windows (PowerShell):** `.\venv\Scripts\Activate.ps1`  
- **Windows (cmd):** `venv\Scripts\activate.bat`  
- **macOS/Linux:** `source venv/bin/activate`

```bash
pip install -r requirements.txt
```

Copy env and add your keys:

```bash
copy .env.example .env   # Windows
# or: cp .env.example .env   # macOS/Linux
```

Edit `backend/.env` (see [Environment variables](#environment-variables) below).

Start the server:

```bash
python app.py
```

Backend runs at **http://localhost:5000** (or the port shown in the terminal).

### 2. Frontend

In a **new terminal**:

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at **http://localhost:5173**. Use this URL in the browser; Vite proxies `/api` to the backend.

### 3. Use the app

1. Open **http://localhost:5173**
2. Register or log in
3. Create a goal (Profile → Goals) or complete onboarding
4. Add contributions on the home screen; levels and daily amount update from your goal and (if you upload a statement) from statement data

## Environment Variables

### Backend (`backend/.env`)

| Variable           | Required | Description |
|--------------------|----------|-------------|
| `MONGODB_URI`      | Yes      | MongoDB Atlas connection string |
| `JWT_SECRET`       | Yes      | Secret for signing JWT tokens |
| `GOOGLE_AI_API_KEY`| Yes      | Google AI (Gemini) API key for goals and chat |
| `NESSIE_API_KEY`  | No       | Optional; for banking API |

Get a Gemini key: [Google AI Studio](https://aistudio.google.com/apikey).

### Frontend

In development, the frontend talks to the backend via Vite’s proxy (no `.env` needed). For production, set `VITE_API_BASE_URL` to your backend API base URL.

## Project Structure

```
XPense/
├── backend/
│   ├── app.py              # Flask app and API routes
│   ├── requirements.txt
│   ├── .env                # Your keys (create from .env.example)
│   ├── config/             # DB connection
│   ├── models/              # MongoDB models (user, goal, post, etc.)
│   ├── utils/               # Auth, AI calculator, statement helpers
│   └── data/                # Mock statement data (used when no PDF parsing)
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── components/      # Screens and UI
│   │   ├── context/         # Auth, game state
│   │   └── services/        # API client
│   ├── package.json
│   └── vite.config.js      # Proxy /api → backend
└── README.md
```

## Features

- **Auth** — Register, login, JWT
- **Goals** — Create goals, target amount/date, AI-calculated levels and daily amount
- **Contributions** — Add money to goals; level up and complete goals (auto-archived)
- **Bank statement** — Upload a PDF; if parsing isn’t available, app uses built-in sample data and still updates daily amount and levels
- **Gamification** — Points, coins, streaks, leaderboard, quests
- **Social** — Feed (post, like, comment), nudges, veto requests
- **AI** — Goal suggestions and chat (Gemini)

## Bank statement / PDF upload

- Upload is supported without installing any PDF library.
- If the server has **pdfplumber** installed, PDFs are parsed and transactions are extracted.
- If not (default), uploads still succeed and the app uses **built-in sample transaction data** so spending analysis, daily amount, and levels all update as if a statement was processed.

## Team

- **Anna** — Backend (Flask, MongoDB, APIs)  
- **Aadya** — Frontend (React, UI/UX)  
- **Suhani** — Integration and features  
