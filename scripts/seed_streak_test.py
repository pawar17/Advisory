"""
Seed streak calculation test data.

3 users: suhanimathur, annasopena, aadyapawar
Daily flow data for Feb 1, Feb 2, Feb 3.
Streak rule: if (income - expenses) < 0, streak resets.

Expected results after calculation:
  Aadya: streak = 3  (all 3 days positive)
  Suhani: streak = 1 (only Feb 3 positive)
  Anna: streak = 2   (Feb 2 and 3 positive, Feb 1 negative)

Run: python scripts/seed_streak_test.py
"""

import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "backend"))

from config.database import db_instance
from models.user import User
from models.daily_flow import DailyFlow
from utils.auth import hash_password
from datetime import datetime

# Feb 1, 2, 3 2025 (parsed as dates)
FEB_1 = datetime(2025, 2, 1)
FEB_2 = datetime(2025, 2, 2)
FEB_3 = datetime(2025, 2, 3)

# Users: firstname+lastname (no space)
USERS = [
    {"username": "suhanimathur", "email": "suhani@test.com", "name": "Suhani Mathur"},
    {"username": "annasopena", "email": "anna@test.com", "name": "Anna Sopena"},
    {"username": "aadyapawar", "email": "aadya@test.com", "name": "Aadya Pawar"},
]

# Daily flow: (income, expenses) per user per day
# (income - expenses) < 0 → streak breaks
# Aadya: all positive → streak 3
# Anna: Feb 1 negative, Feb 2–3 positive → streak 2
# Suhani: Feb 1–2 negative, Feb 3 positive → streak 1
DAILY_FLOW = {
    "aadyapawar": [
        (FEB_1, 3000, 2500),   # net +500
        (FEB_2, 3000, 2400),   # net +600
        (FEB_3, 3000, 2200),   # net +800
    ],
    "annasopena": [
        (FEB_1, 2500, 2700),   # net -200 → breaks
        (FEB_2, 2800, 2600),   # net +200
        (FEB_3, 3000, 2500),   # net +500
    ],
    "suhanimathur": [
        (FEB_1, 2000, 2200),   # net -200 → breaks
        (FEB_2, 2100, 2300),   # net -200 → breaks
        (FEB_3, 2500, 2000),   # net +500
    ],
}


def seed_users(db):
    user_model = User(db)
    user_ids = {}
    for u in USERS:
        existing = user_model.find_by_username(u["username"])
        if existing:
            user_ids[u["username"]] = existing["_id"]
            print(f"  User exists: {u['username']}")
            continue
        pw_hash = hash_password("test123")
        uid = user_model.create_user(
            username=u["username"],
            email=u["email"],
            password_hash=pw_hash,
            name=u["name"],
        )
        user_ids[u["username"]] = uid
        print(f"  Created user: {u['username']}")
    return user_ids


def seed_daily_flow(db, user_ids):
    flow_model = DailyFlow(db)
    for username, entries in DAILY_FLOW.items():
        uid = user_ids.get(username)
        if not uid:
            continue
        for dt, income, expenses in entries:
            flow_model.add_entry(uid, dt, income, expenses)
            net = income - expenses
            status = "✓" if net >= 0 else "✗ (streak break)"
            print(f"  {username} {dt.date()}: income={income}, expenses={expenses}, net={net} {status}")
    print("  Daily flow seeded.")


def update_streaks(db, user_ids):
    flow_model = DailyFlow(db)
    user_model = User(db)
    for username, uid in user_ids.items():
        streak = flow_model.calculate_streak(uid)
        user_model.update_game_stats(uid, streak=streak)
        print(f"  {username}: current_streak = {streak}")


def main():
    print("\n=== Streak Test Data Seed ===\n")
    db = db_instance.connect()
    user_model = User(db)
    flow_model = DailyFlow(db)

    print("1. Seeding users...")
    user_ids = seed_users(db)

    print("\n2. Seeding daily flow (Feb 1, 2, 3)...")
    seed_daily_flow(db, user_ids)

    print("\n3. Calculating streaks and updating users...")
    update_streaks(db, user_ids)

    print("\n4. Verification (query users):")
    for u in USERS:
        doc = user_model.find_by_username(u["username"])
        if doc:
            print(f"  {doc['username']}: current_streak = {doc.get('current_streak', 0)}")

    print("\n✓ Streak test data ready. Expected: Aadya=3, Suhani=1, Anna=2")
    db_instance.close()


if __name__ == "__main__":
    main()
