# Start SavePop – Frontend + Backend

## 1. MongoDB credentials in backend/.env

Create `backend/.env` (copy from `backend/.env.example`). Put your **MongoDB Atlas** credentials there:

```env
MONGODB_URI=mongodb+srv://YOUR_USER:YOUR_PASSWORD@YOUR_CLUSTER.xxxxx.mongodb.net/?retryWrites=true&w=majority
```

- Get the URI from [MongoDB Atlas](https://cloud.mongodb.com) → your cluster → **Connect** → **Drivers** → copy.
- Replace `YOUR_USER`, `YOUR_PASSWORD`, and the cluster host. The app uses the database name `savings_app` automatically.
- **Do not commit `.env`** — it’s in `.gitignore`. Share the template (`.env.example`) with the team instead.

---

## 2. Start backend

```bash
cd backend
python3 -m venv venv
source venv/bin/activate    # Windows: venv\Scripts\activate
pip install -r requirements.txt
python app.py
```

Wait for: `✓ Successfully connected to MongoDB!`  
Backend: http://localhost:5001

---

## 3. Seed demo data (first time)

In a new terminal:

```bash
cd backend
source venv/bin/activate
python ../scripts/seed_demo_data.py
```

Demo login: `alice_saves` / `demo123`

---

## 4. Start frontend

In a new terminal:

```bash
cd frontend
npm install
npm run dev
```

Frontend: http://localhost:5173

---

## 5. Test

- **Backend health:** http://localhost:5001/api/health
- **Test login from terminal** (backend must be running):
  ```bash
  curl -X POST http://localhost:5001/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"username":"alice_saves","password":"demo123"}'
  ```
  You should see `"message":"Login successful"` and a `token`.
- **Frontend:** http://localhost:5173 → Login with `alice_saves` / `demo123`

**If login still fails in the browser:** Open DevTools (F12) → Console and Network. Check the login request: status (401 = wrong credentials, 0 or failed = backend not reached). Ensure the **backend is running** in a separate terminal while you use the frontend.
