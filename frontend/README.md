# SavePop Frontend

React + Vite app for the SavePop gamified savings game. All app code lives under `frontend/`.

## Run locally

1. **Backend** (from repo root):  
   `cd backend && pip install -r requirements.txt && python app.py`  
   Backend should be at `http://localhost:5000`.

2. **Frontend**:  
   `npm install && npm run dev`  
   In dev, `/api` is proxied to the backend so login and API calls work without CORS.

3. **Create account**: Open the app → “Create account” → fill name, username, email, password → Create account. You’re logged in after that. Use the same username/password to log in later.

## Optional env

- `VITE_API_BASE_URL` – Override API base (e.g. for production). Default in dev: `/api` (proxied to backend).
