from pymongo import MongoClient
from pymongo.errors import ServerSelectionTimeoutError, ConnectionFailure
from datetime import datetime, timedelta
import sys

URI = "mongodb+srv://advisory:InnovateHer@cluster0.pcin0xa.mongodb.net/"

def parse_date_to_date(d):
    """Return a date object for a value `d` which may be a datetime or string.
    Returns None if parsing fails.
    """
    if d is None:
        return None
    if isinstance(d, datetime):
        return d.date()
    if isinstance(d, str):
        s = d.strip()
        # try ISO first
        try:
            return datetime.fromisoformat(s).date()
        except Exception:
            pass
        # common fallback formats
        for fmt in ("%Y-%m-%d", "%m/%d/%Y", "%d/%m/%Y", "%b %d %Y", "%B %d %Y"):
            try:
                return datetime.strptime(s, fmt).date()
            except Exception:
                continue
    return None


def to_float(v):
    try:
        return float(v)
    except Exception:
        return 0.0


def compute_streaks(docs):
    # Group net by date
    nets = {}
    for doc in docs:
        date_val = doc.get("date")
        day = parse_date_to_date(date_val)
        if day is None:
            # skip entries without parsable date
            continue
        income = to_float(doc.get("income", 0))
        expense = to_float(doc.get("expense", 0))
        nets[day] = nets.get(day, 0.0) + (income - expense)

    if not nets:
        return 0, 0

    # compute current consecutive streak ending at latest day
    days = sorted(nets.keys())
    latest = days[-1]
    streak = 0
    cur = latest
    while True:
        net = nets.get(cur, None)
        if net is None or net <= 0:
            break
        streak += 1
        cur = cur - timedelta(days=1)

    return streak


def main():
    username = None
    if len(sys.argv) > 1:
        username = sys.argv[1]
    else:
        username = input("Enter your username: ").strip()
    if not username:
        print("Username required")
        raise SystemExit(1)

    try:
        client = MongoClient(URI, serverSelectionTimeoutMS=10000, connectTimeoutMS=10000, tlsInsecure=True)
        client.admin.command("ping")
    except ServerSelectionTimeoutError:
        print("TIMEOUT: Could not connect to MongoDB")
        raise
    except ConnectionFailure as e:
        print(f"CONNECTION FAILED: {e}")
        raise

    db = client.get_database("samplebudgeting")
    users = db.get_collection("users")
    daily = db.get_collection("daily_flow")

    user_doc = users.find_one({"username": username}, {"_id": 1})
    query = {"username": username}
    if user_doc:
        query = {"user_id": user_doc["_id"]}

    docs = list(daily.find(query, {"date": 1, "income": 1, "expense": 1}))

    streak = compute_streaks(docs)
    print(f"Current consecutive positive-day streak (ending at latest entry): {streak}")


if __name__ == "__main__":
    main()
