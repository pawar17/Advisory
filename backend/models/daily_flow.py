"""
Daily flow model – income and expenses per day per user.
Used for streak calculation: if (income - expenses) < 0, streak resets.
"""

from datetime import datetime, date
from bson import ObjectId


def parse_date(d):
    """Parse date to datetime at midnight UTC."""
    if isinstance(d, datetime):
        return d.replace(hour=0, minute=0, second=0, microsecond=0)
    if isinstance(d, date):
        return datetime.combine(d, datetime.min.time())
    if isinstance(d, str):
        return datetime.strptime(d[:10], "%Y-%m-%d")
    return d


class DailyFlow:
    def __init__(self, db):
        self.collection = db.daily_flow
        self._create_indexes()

    def _create_indexes(self):
        self.collection.create_index([("user_id", 1), ("date", 1)], unique=True)

    def add_entry(self, user_id, date_val, income, expenses):
        """Add or update daily flow entry."""
        if isinstance(user_id, str):
            user_id = ObjectId(user_id)
        dt = parse_date(date_val)
        doc = {
            "user_id": user_id,
            "date": dt,
            "income": float(income),
            "expenses": float(expenses),
            "net": float(income) - float(expenses),
            "updated_at": datetime.utcnow(),
        }
        self.collection.update_one(
            {"user_id": user_id, "date": dt},
            {"$set": doc},
            upsert=True
        )

    def get_user_entries(self, user_id, start_date=None, end_date=None):
        """Get daily flow entries for a user, optionally filtered by date range."""
        if isinstance(user_id, str):
            user_id = ObjectId(user_id)
        query = {"user_id": user_id}
        if start_date:
            query["date"] = {"$gte": parse_date(start_date)}
        if end_date:
            query.setdefault("date", {})["$lte"] = parse_date(end_date)
        return list(self.collection.find(query).sort("date", 1))

    def _net_for_entry(self, e):
        """Net for one entry; supports 'net', 'expenses', or 'expense' (insertdb_flow)."""
        if e.get("net") is not None:
            return float(e["net"])
        inc = float(e.get("income") or 0)
        exp = float(e.get("expenses") if e.get("expenses") is not None else e.get("expense") or 0)
        return inc - exp

    def calculate_streak(self, user_id, as_of_date=None):
        """
        Calculate current streak from daily flow data.
        Streak = consecutive days (ending at most recent) where (income - expenses) >= 0.
        If (income - expenses) < 0 on a day, streak resets.
        Works with both 'expense' (insertdb_flow) and 'expenses'/'net' (DailyFlow) schemas.
        """
        if isinstance(user_id, str):
            user_id = ObjectId(user_id)
        entries = self.get_user_entries(user_id)
        if not entries:
            return 0
        entries.sort(key=lambda e: e["date"])
        as_of = parse_date(as_of_date) if as_of_date else entries[-1]["date"]
        entries = [e for e in entries if e["date"] <= as_of]
        streak = 0
        for e in reversed(entries):
            if self._net_for_entry(e) >= 0:
                streak += 1
            else:
                break
        return streak
