"""
Hardcoded v4 statement data: transactions, categories, totals, and patterns.
Use this for spending analysis, charts, goal suggestion, and quests so values are correct.
"""
from datetime import datetime

# 1. Statement metadata
STATEMENT_METADATA = {
    "statement_period": "2026-03-01 to 2026-03-31",
    "account_holder": "Jane Doe",
    "age": 21,
    "account_type": "Student Checking",
    "beginning_balance": 1084.92,
    "ending_balance": 1356.50,
}

# 2. Credits (deposits)
CREDITS = [
    {"date": "03/01", "description": "Payroll — Campus Job", "amount": 820.00},
    {"date": "03/13", "description": "Financial Aid Refund", "amount": 2800.00},
    {"date": "03/20", "description": "Payroll — Campus Job", "amount": 820.00},
    {"date": "03/28", "description": "Venmo Payment from Sam L.", "amount": 45.00},
    {"date": "03/31", "description": "Monthly Interest Credit", "amount": 3.21},
]
TOTAL_DEPOSITS = 7165.44

# 3. Debits (expenses) — used for transaction count and merchant → category mapping
DEBITS = [
    {"date": "03/02", "merchant": "Starbucks", "amount": 6.15},
    {"date": "03/02", "merchant": "Amazon", "amount": 22.49},
    {"date": "03/03", "merchant": "Target", "amount": 47.83},
    {"date": "03/04", "merchant": "Venmo Payment to Alex R.", "amount": 35.00},
    {"date": "03/05", "merchant": "University Book Store", "amount": 96.40},
    {"date": "03/06", "merchant": "Uber", "amount": 13.72},
    {"date": "03/07", "merchant": "DoorDash", "amount": 26.18},
    {"date": "03/08", "merchant": "Panda Express", "amount": 11.92},
    {"date": "03/10", "merchant": "CVS Pharmacy", "amount": 14.33},
    {"date": "03/12", "merchant": "Tuition Payment — University", "amount": 3450.00},
    {"date": "03/14", "merchant": "Domino's Pizza", "amount": 19.96},
    {"date": "03/15", "merchant": "Zelle Rent Share", "amount": 480.00},
    {"date": "03/16", "merchant": "Walmart", "amount": 61.27},
    {"date": "03/18", "merchant": "Fiesta Mexican Grill", "amount": 20.33},
    {"date": "03/22", "merchant": "Amazon Prime Student", "amount": 7.49},
    {"date": "03/23", "merchant": "Spotify Student", "amount": 5.99},
    {"date": "03/24", "merchant": "Uber", "amount": 15.09},
    {"date": "03/26", "merchant": "Insomnia Cookies", "amount": 9.58},
    {"date": "03/29", "merchant": "Silver Dipper Ice Cream", "amount": 7.44},
]
TOTAL_WITHDRAWALS = 6893.86

# 4. Category mapping: category name → list of merchant substrings (match debits by merchant)
CATEGORY_MAPPING = {
    "Tuition & Education": [
        "Tuition Payment — University",
        "University Book Store",
    ],
    "Housing": [
        "Zelle Rent Share",
    ],
    "Food & Dining": [
        "DoorDash",
        "Panda Express",
        "Domino's Pizza",
        "Fiesta Mexican Grill",
    ],
    "Coffee & Snacks": [
        "Starbucks",
        "Insomnia Cookies",
        "Silver Dipper Ice Cream",
    ],
    "Transportation": [
        "Uber",
    ],
    "Shopping": [
        "Amazon",
        "Target",
        "Walmart",
    ],
    "Health": [
        "CVS Pharmacy",
    ],
    "Subscriptions": [
        "Amazon Prime Student",
        "Spotify Student",
    ],
    "Peer-to-Peer": [
        "Venmo Payment to Alex R.",
    ],
}

# 5. Category totals (second page) — single source of truth for charts and analysis
CATEGORY_TOTALS_LIST = [
    {"category": "Tuition & Education", "total": 3546.40},
    {"category": "Housing", "total": 480.00},
    {"category": "Food & Dining", "total": 142.41},
    {"category": "Coffee & Snacks", "total": 29.61},
    {"category": "Transportation", "total": 42.53},
    {"category": "Shopping", "total": 193.08},
    {"category": "Health", "total": 14.33},
    {"category": "Subscriptions", "total": 13.48},
    {"category": "Peer-to-Peer", "total": 35.00},
]

# As dict for API: spendingByCategory
SPENDING_BY_CATEGORY = {item["category"]: item["total"] for item in CATEGORY_TOTALS_LIST}

# 6. Spending patterns
NEEDS_VS_WANTS = {
    "needs_percentage": 72,
    "wants_percentage": 28,
}

# Transaction count for "based on N transactions"
MOCK_TRANSACTION_COUNT = len(DEBITS)

# Map category name to DB-friendly slug (for stored transactions)
CATEGORY_TO_SLUG = {
    "Tuition & Education": "bills",
    "Housing": "bills",
    "Food & Dining": "food",
    "Coffee & Snacks": "food",
    "Transportation": "transport",
    "Shopping": "shopping",
    "Health": "health",
    "Subscriptions": "subscriptions",
    "Peer-to-Peer": "transfer",
}


def _merchant_to_category(merchant):
    """Return category slug for a merchant from CATEGORY_MAPPING."""
    for cat_name, merchants in CATEGORY_MAPPING.items():
        for m in merchants:
            if m.lower() in (merchant or "").lower() or (merchant or "").lower() in m.lower():
                return CATEGORY_TO_SLUG.get(cat_name, "other")
    return "other"


def get_mock_transactions_for_upload():
    """
    Return list of transactions in upload format: [{"date", "description", "amount", "category"}].
    Used when PDF parsing is unavailable so upload still succeeds and daily amount/levels use this data.
    Credits = positive amount, debits = negative. Date is datetime (March 2026 from statement period).
    """
    year, month = 2026, 3
    out = []
    for c in CREDITS:
        d = c.get("date", "")
        try:
            if "/" in d:
                parts = d.split("/")
                # MM/DD format
                mo, dy = int(parts[0]), int(parts[1])
                out.append({
                    "date": datetime(year, mo, dy),
                    "description": c.get("description", "Deposit"),
                    "amount": float(c.get("amount", 0)),
                    "category": "transfer",
                })
            else:
                out.append({
                    "date": datetime(year, month, 1),
                    "description": c.get("description", "Deposit"),
                    "amount": float(c.get("amount", 0)),
                    "category": "transfer",
                })
        except (ValueError, IndexError):
            out.append({
                "date": datetime(year, month, 1),
                "description": c.get("description", "Deposit"),
                "amount": float(c.get("amount", 0)),
                "category": "transfer",
            })
    for d in DEBITS:
        date_str = d.get("date", "")
        merchant = d.get("merchant", "Unknown")
        amount = -abs(float(d.get("amount", 0)))
        try:
            if "/" in date_str:
                parts = date_str.split("/")
                mo, dy = int(parts[0]), int(parts[1])
                dt = datetime(year, mo, dy)
            else:
                dt = datetime(year, month, 1)
        except (ValueError, IndexError):
            dt = datetime(year, month, 1)
        out.append({
            "date": dt,
            "description": merchant,
            "amount": amount,
            "category": _merchant_to_category(merchant),
        })
    return out


def get_mock_spending_analysis():
    """Return spendingByCategory and transaction count for use in API."""
    return {
        "spendingByCategory": SPENDING_BY_CATEGORY,
        "transactionCount": MOCK_TRANSACTION_COUNT,
        "totalWithdrawals": TOTAL_WITHDRAWALS,
        "totalDeposits": TOTAL_DEPOSITS,
        "metadata": STATEMENT_METADATA,
        "needsVsWants": NEEDS_VS_WANTS,
    }


def get_mock_suggestion(target_amount, current_amount, target_date=None, goal_name=""):
    """
    Compute daily savings suggestion from goal only (no AI).
    Uses hardcoded top_cut_category from v4 category totals (biggest discretionary).
    """
    from datetime import datetime
    remaining = max(0, float(target_amount) - float(current_amount))
    days = 180
    if target_date:
        try:
            if isinstance(target_date, str):
                target_date = datetime.fromisoformat(target_date.replace("Z", "+00:00"))
            days = max(30, (target_date - datetime.utcnow()).days)
        except Exception:
            pass
    daily_savings_amount = round(remaining / days, 2) if days else 0
    # Top category to cut: exclude Tuition & Housing (needs); pick highest discretionary
    cut_candidates = [
        (cat, total) for cat, total in SPENDING_BY_CATEGORY.items()
        if cat not in ("Tuition & Education", "Housing")
    ]
    top_cut_category = max(cut_candidates, key=lambda x: x[1])[0] if cut_candidates else "Shopping"
    tip = "Cut one takeout or coffee run per week to hit your goal faster."
    if top_cut_category == "Subscriptions":
        tip = "Review subscriptions you don't use; cancel one to save monthly."
    elif top_cut_category == "Transportation":
        tip = "Try walking or transit once a week instead of rideshare."
    return {
        "daily_savings_amount": daily_savings_amount,
        "top_cut_category": top_cut_category,
        "tip": tip,
        "suggested_levels": 50,
    }


def get_mock_quests_from_spending(goal_name=None):
    """
    Quests predicted from v4 spending: don't spend on top categories (with real totals).
    Descriptions explicitly tie to statement data so it's clear they're from spending habits.
    """
    # Top discretionary categories by spend (exclude Tuition, Housing)
    discretionary = [
        (cat, total) for cat, total in SPENDING_BY_CATEGORY.items()
        if cat not in ("Tuition & Education", "Housing")
    ]
    top = sorted(discretionary, key=lambda x: -x[1])[:3]
    quests = []
    for cat, total in top:
        amt = int(total)
        quests.append({
            "name": f"Don't spend on {cat} today",
            "description": f"Based on your statement you spent ${amt} on {cat}. Skip this category today to stay on track.",
            "category": "no-spend",
            "points_reward": 30,
            "currency_reward": 15,
        })
    quests.extend([
        {
            "name": "Save $5 today",
            "description": "Put $5 toward your goal today. Based on your spending, small daily saves add up.",
            "category": "milestone",
            "points_reward": 25,
            "currency_reward": 10,
        },
        {
            "name": "Log every expense",
            "description": "Track every purchase today. Your statement shows 20 transactions last month—logging helps you match that pattern.",
            "category": "milestone",
            "points_reward": 20,
            "currency_reward": 5,
        },
    ])
    return quests[:6]
