"""
Parse bank statement PDFs: extract ALL transactions using multiple strategies,
merge and dedupe, then categorize with Gemini. Improves completeness when PDFs
have complex layout or multiple tables.
"""
import os
import re
import json
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

try:
    import pdfplumber
    HAS_PDF = True
except ImportError:
    HAS_PDF = False

import google.generativeai as genai
_api_key = os.getenv('GOOGLE_AI_API_KEY')
if _api_key and _api_key.strip() and _api_key.strip() not in ('your_google_ai_api_key', 'your_google_ai_key'):
    genai.configure(api_key=_api_key.strip())

EXPENSE_CATEGORIES = [
    "food", "transport", "shopping", "entertainment", "bills", "health",
    "travel", "subscriptions", "transfer", "other"
]

# Keyword-based category hints (description lowercased); applied to avoid everything becoming "other"
CATEGORY_KEYWORDS = {
    "food": ["restaurant", "cafe", "coffee", "starbucks", "mcdonald", "uber eats", "doordash", "grubhub", "grocer", "supermarket", "food", "dining", "pizza", "delivery", "eat ", "kitchen"],
    "transport": ["uber", "lyft", "gas", "fuel", "shell", "chevron", "exxon", "parking", "transit", "metro", "bus ", "train", "toll", "car ", "auto", "taxi", "parking"],
    "shopping": ["amazon", "walmart", "target", "costco", "ebay", "shop", "store", "retail", "mall", "purchase"],
    "entertainment": ["movie", "cinema", "netflix", "hulu", "disney", "game", "steam", "playstation", "xbox", "concert", "ticket", "entertainment"],
    "bills": ["electric", "utility", "water", "internet", "phone", "mobile", "bill", "insurance", "rent", "mortgage", "at&t", "verizon", "comcast"],
    "health": ["pharmacy", "cvs", "walgreens", "hospital", "doctor", "medical", "health", "dental", "clinic", "prescription"],
    "travel": ["airline", "hotel", "booking", "expedia", "airbnb", "flight", "travel", "vacation"],
    "subscriptions": ["subscription", "monthly", "spotify", "apple music", "youtube premium", "membership", "recurring"],
    "transfer": ["transfer", "zelle", "venmo", "paypal", "ach ", "wire", "payment to"],
}

AMOUNT_PATTERN = re.compile(r"[-]?\$?\s*([\d,]+\.?\d*)")
DATE_PATTERNS = [
    re.compile(r"(\d{1,2})[/\-](\d{1,2})[/\-](\d{2,4})"),
    re.compile(r"(\d{4})[/\-](\d{1,2})[/\-](\d{1,2})"),
    re.compile(r"(\d{1,2})\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+(\d{2,4})", re.I),
]
MONTHS = {"jan": 1, "feb": 2, "mar": 3, "apr": 4, "may": 5, "jun": 6,
          "jul": 7, "aug": 8, "sep": 9, "oct": 10, "nov": 11, "dec": 12}

# Minimum transactions to trust table-only result; below this we also run text + Gemini
MIN_TRANSACTIONS_TO_SKIP_FALLBACK = 15


def _parse_date_from_match(match, pattern_index=0):
    try:
        if pattern_index == 0:
            a, b, c = match.groups()
            y = int(c) if len(c) == 4 else 2000 + int(c)
            if int(a) > 12:
                day, month = int(a), int(b)
            else:
                month, day = int(a), int(b)
            return datetime(y, month, day)
        if pattern_index == 1:
            y, m, d = map(int, match.groups())
            return datetime(y, m, d)
        if pattern_index == 2:
            d, mon, y = match.groups()
            m = MONTHS.get(mon[:3].lower(), 1)
            return datetime(int(y), m, int(d))
    except (ValueError, IndexError):
        pass
    return None


def extract_text_from_pdf(file_path, use_layout=True):
    """Extract all text from every page. Try with layout first for better ordering."""
    if not HAS_PDF:
        raise ImportError("Install pdfplumber: pip install pdfplumber")
    text_parts = []
    with pdfplumber.open(file_path) as pdf:
        for page in pdf.pages:
            try:
                if use_layout:
                    t = page.extract_text(layout=True)
                else:
                    t = page.extract_text()
            except Exception:
                t = page.extract_text()
            if t:
                text_parts.append(t)
            # Also try extracting by words and grouping by line (y) for messy PDFs
            if not t or len(t.strip()) < 100:
                words = page.extract_words()
                if words:
                    by_y = {}
                    for w in words:
                        y = int(w.get("top", 0) // 5) * 5
                        by_y.setdefault(y, []).append(w.get("text", ""))
                    lines = [" ".join(by_y[k]) for k in sorted(by_y.keys())]
                    text_parts.append("\n".join(lines))
    return "\n".join(text_parts)


def extract_tables_from_pdf(file_path):
    """Extract tables with multiple strategies to get more rows."""
    if not HAS_PDF:
        return []
    all_tables = []
    with pdfplumber.open(file_path) as pdf:
        for page in pdf.pages:
            # Default extraction
            tables = page.extract_tables()
            if tables:
                all_tables.extend(tables)
            # Try with explicit table detection (find_tables then extract)
            try:
                found = page.find_tables()
                for t in found:
                    extracted = t.extract()
                    if extracted and len(extracted) > 1:
                        all_tables.append(extracted)
            except Exception:
                pass
            # Try vertical_strategy="text" for lines that look like text
            try:
                tables2 = page.extract_tables(table_settings={"vertical_strategy": "text", "horizontal_strategy": "text"})
                for tb in (tables2 or []):
                    if tb and len(tb) > 1 and tb not in all_tables:
                        all_tables.append(tb)
            except Exception:
                pass
    return all_tables


def _parse_amount_cell(cell):
    if cell is None:
        return None, False
    s = str(cell).strip().replace(",", "").replace("$", "").replace(" ", "")
    if not s:
        return None, False
    is_debit = "(" in str(cell) or ")" in str(cell) or str(cell).strip().startswith("-")
    try:
        val = float(re.sub(r"[^\d.\-]", "", s))
        if "(" in str(cell):
            val = abs(val)
        return abs(val), is_debit
    except ValueError:
        return None, False


def _find_amount_column_index(row):
    for idx in range(len(row) - 1, -1, -1):
        cell = row[idx]
        if cell is None:
            continue
        val, _ = _parse_amount_cell(cell)
        if val is not None and val > 0:
            return idx
    return -1


def _parse_date_cell(cell):
    if cell is None:
        return None
    s = str(cell).strip()
    for i, pat in enumerate(DATE_PATTERNS):
        m = pat.search(s)
        if m:
            return _parse_date_from_match(m, i)
    return None


def transactions_from_tables(tables):
    transactions = []
    for table in tables:
        if not table or len(table) < 2:
            continue
        header = [str(c).lower() if c else "" for c in table[0]]
        amt_col = -1
        date_col = -1
        desc_col = -1
        for i, h in enumerate(header):
            if "date" in h:
                date_col = i
            if "desc" in h or "description" in h or "particular" in h or "detail" in h or "memo" in h or "narration" in h:
                desc_col = i
            if "amount" in h or "debit" in h or "credit" in h or "withdrawal" in h or "deposit" in h:
                amt_col = i
        if amt_col < 0:
            amt_col = _find_amount_column_index(table[0])
        if amt_col < 0 and len(table[0]) > 0:
            amt_col = len(table[0]) - 1
        for row in table[1:]:
            if not row:
                continue
            amount_val, is_debit = _parse_amount_cell(row[amt_col] if amt_col < len(row) else None)
            if amount_val is None or amount_val == 0:
                continue
            if is_debit:
                amount_val = -amount_val
            date_val = None
            if date_col >= 0 and date_col < len(row):
                date_val = _parse_date_cell(row[date_col])
            desc = ""
            if desc_col >= 0 and desc_col < len(row):
                desc = str(row[desc_col] or "").strip()[:200]
            else:
                parts = [str(c) for i, c in enumerate(row) if c and i != amt_col and i != date_col]
                desc = " ".join(parts)[:200]
            transactions.append({"date": date_val, "description": desc or "Transaction", "amount": amount_val})
    return transactions


def parse_transactions_from_text(text):
    """Parse every line that looks like it has a date and an amount."""
    transactions = []
    lines = [l.strip() for l in text.splitlines() if l.strip()]
    for line in lines:
        amounts = AMOUNT_PATTERN.findall(line)
        if not amounts:
            continue
        amount_str = amounts[-1].replace(",", "")
        try:
            amount_val = float(amount_str)
        except ValueError:
            continue
        if amount_val == 0:
            continue
        lower = line.lower()
        if "debit" in lower or "withdrawal" in lower or "payment" in lower or "dr" in lower or "(" in line or "pos" in lower:
            amount_val = -abs(amount_val)
        elif "credit" in lower or "deposit" in lower or "cr" in lower:
            amount_val = abs(amount_val)
        else:
            amount_val = -abs(amount_val)
        date_val = None
        for i, pat in enumerate(DATE_PATTERNS):
            m = pat.search(line)
            if m:
                date_val = _parse_date_from_match(m, i)
                break
        desc = line
        for am in amounts:
            desc = re.sub(re.escape(am), "", desc)
        desc = re.sub(r"\d{1,2}[/\-]\d{1,2}[/\-]\d{2,4}", "", desc)
        desc = re.sub(r"\d{4}[/\-]\d{1,2}[/\-]\d{1,2}", "", desc)
        desc = re.sub(r"\s+", " ", desc).strip()[:200]
        transactions.append({"date": date_val, "description": desc or "Transaction", "amount": amount_val})
    return transactions


def _transaction_key(t):
    """Key for deduplication."""
    return (
        (t.get("date").isoformat() if hasattr(t.get("date"), "isoformat") else str(t.get("date"))),
        round(float(t.get("amount", 0)), 2),
        (t.get("description") or "")[:80],
    )


def merge_and_dedupe(transaction_lists):
    """Merge multiple lists and dedupe by (date, amount, description). Prefer longer descriptions."""
    seen = {}
    for lst in transaction_lists:
        for t in lst:
            k = _transaction_key(t)
            if k not in seen or len((t.get("description") or "")) > len((seen[k].get("description") or "")):
                seen[k] = t
    return list(seen.values())


def extract_transactions_with_gemini(raw_text):
    """Use Gemini to extract ALL transactions from full statement text."""
    if not raw_text or len(raw_text) < 50:
        return []
    # Use more of the document (up to 80k chars) and ask for completeness
    text_slice = raw_text[:80000]
    try:
        model = genai.GenerativeModel('gemini-pro')
        prompt = """You are extracting every single transaction from a bank statement. Do not skip any.
For each transaction return: date (YYYY-MM-DD if visible, else null), description (short, what the transaction is), amount (number: negative for withdrawals/debits/payments/outgoing, positive for deposits/credits/incoming).
Include every transaction you can find in the text. Return ONLY a valid JSON array of objects with keys: date, description, amount. No markdown, no code block wrapper.
Example: [{"date":"2024-01-15","description":"AMAZON","amount":-45.99},{"date":"2024-01-16","description":"SALARY","amount":3000}]"""
        prompt += "\n\nBank statement text:\n" + text_slice
        response = model.generate_content(prompt)
        text = response.text.strip()
        # Strip markdown/code blocks
        for start in ["```json", "```"]:
            if start in text:
                text = text.split(start)[1].split("```")[0].strip()
        arr = json.loads(text)
        out = []
        for o in arr:
            amt = o.get("amount", 0)
            if not isinstance(amt, (int, float)):
                try:
                    amt = float(str(amt).replace(",", "").replace("$", "").replace(" ", ""))
                except ValueError:
                    continue
            date_val = None
            d = o.get("date")
            if d:
                try:
                    if isinstance(d, str) and len(d) >= 10:
                        date_val = datetime.strptime(d[:10], "%Y-%m-%d")
                    elif isinstance(d, str) and re.match(r"\d{1,2}/\d{1,2}/\d{2,4}", d):
                        parts = re.findall(r"\d+", d)
                        if len(parts) >= 3:
                            day, month, year = int(parts[0]), int(parts[1]), int(parts[2])
                            if year < 100:
                                year += 2000
                            date_val = datetime(year, month, day)
                except Exception:
                    pass
            out.append({
                "date": date_val,
                "description": str(o.get("description", ""))[:200],
                "amount": amt,
            })
        return out
    except Exception:
        return []


def parse_and_extract_transactions(file_path):
    """
    Extract transactions using ALL methods, then merge and dedupe to get the most complete list.
    """
    # 1) Get full text (layout + word-fallback for sparse pages)
    full_text = extract_text_from_pdf(file_path, use_layout=True)
    if len(full_text.strip()) < 50:
        full_text = extract_text_from_pdf(file_path, use_layout=False)

    # 2) Tables
    tables = extract_tables_from_pdf(file_path)
    from_tables = transactions_from_tables(tables)

    # 3) Line-by-line from text
    from_text = parse_transactions_from_text(full_text)

    # 4) Gemini on full text (always run if we have text, to catch what tables/lines missed)
    from_gemini = []
    if full_text.strip():
        from_gemini = extract_transactions_with_gemini(full_text)

    # 5) Merge and dedupe; take the largest / merged set
    merged = merge_and_dedupe([from_tables, from_text, from_gemini])

    # If we still have very few, prefer Gemini if it found more (often best for messy PDFs)
    if len(from_gemini) > len(merged):
        merged = from_gemini
    elif len(merged) < len(from_tables) and len(from_tables) > len(from_text) and len(from_tables) > len(from_gemini):
        merged = from_tables
    elif len(merged) < len(from_text) and len(from_text) > len(from_tables) and len(from_text) > len(from_gemini):
        merged = from_text

    return merged


def _category_from_description(description):
    """Apply keyword rules so we don't lump everything into 'other'."""
    if not description:
        return "other"
    d = description.lower()
    for category, keywords in CATEGORY_KEYWORDS.items():
        for kw in keywords:
            if kw in d:
                return category
    return "other"


def categorize_transactions_with_ai(transactions):
    if not transactions:
        return []
    # Keyword-based first so we never end up with everything as "other"
    for t in transactions:
        t["category"] = _category_from_description(t.get("description", ""))
    # Optionally refine with Gemini: only override when Gemini returns a non-other category
    try:
        model = genai.GenerativeModel('gemini-pro')
        batch_size = 60
        for start in range(0, len(transactions), batch_size):
            batch = transactions[start:start + batch_size]
            lines = [f"{i+1}. {t.get('description', '')} | {t.get('amount', 0)}" for i, t in enumerate(batch)]
            prompt = f"""Assign each line to one category. Categories: {', '.join(EXPENSE_CATEGORIES)}.
Return a JSON array of category strings in the same order. Be specific (use food, transport, shopping, bills, etc.), avoid "other" when possible.
Lines:
""" + "\n".join(lines)
            response = model.generate_content(prompt)
            text = response.text.strip()
            if "```" in text:
                text = text.split("```")[1].replace("json", "").strip()
            arr = json.loads(text)
            for i, t in enumerate(batch):
                if i < len(arr) and isinstance(arr[i], str):
                    gemini_cat = arr[i].lower()
                    if gemini_cat in EXPENSE_CATEGORIES and gemini_cat != "other":
                        t["category"] = gemini_cat
    except Exception:
        pass
    return transactions


def analyze_spending_and_suggest_daily(transactions, target_amount, target_date=None, current_amount=0):
    remaining = max(0, float(target_amount) - float(current_amount))
    days = 180
    if target_date:
        try:
            if isinstance(target_date, str):
                target_date = datetime.fromisoformat(target_date.replace("Z", "+00:00"))
            if hasattr(target_date, "timestamp"):
                days = max(30, (target_date - datetime.utcnow()).days)
        except Exception:
            pass

    by_cat = {}
    for t in transactions:
        amt = t.get("amount") or 0
        if isinstance(amt, (int, float)) and amt < 0:
            cat = t.get("category", "other")
            by_cat[cat] = by_cat.get(cat, 0) + abs(float(amt))

    if not by_cat:
        return _fallback_suggestions(target_amount, current_amount, days, remaining)

    try:
        model = genai.GenerativeModel('gemini-pro')
        prompt = f"""Spending by category (expenses, in dollars): {json.dumps(by_cat)}
Savings goal: ${target_amount}, current savings: ${current_amount}, remaining: ${remaining}. Days to goal: {days}.
Return JSON only:
1. daily_savings_amount: number (how much to save per day)
2. top_cut_category: string (which category to reduce first)
3. tip: one short actionable tip (max 80 chars)
4. suggested_levels: number (10-50)
Example: {{"daily_savings_amount": 25.5, "top_cut_category": "food", "tip": "Cut one takeout per week", "suggested_levels": 20}}"""
        response = model.generate_content(prompt)
        text = response.text.strip()
        if "```" in text:
            text = re.sub(r"```\w*\n?", "", text).strip()
        data = json.loads(text)
        data.setdefault("daily_savings_amount", round(remaining / days, 2) if days else 0)
        data.setdefault("suggested_levels", 20)
        data["daily_savings_amount"] = round(float(data.get("daily_savings_amount", 0)), 2)
        return data
    except Exception:
        return _fallback_suggestions(target_amount, current_amount, days, remaining)


def _fallback_suggestions(target_amount, current_amount, days=180, remaining=None):
    if remaining is None:
        remaining = max(0, float(target_amount) - float(current_amount))
    return {
        "daily_savings_amount": round(remaining / days, 2) if days else 0,
        "top_cut_category": "other",
        "tip": "Upload a bank statement to get personalized tips based on your spending.",
        "suggested_levels": 20,
    }


def generate_quests_from_spending(spending_by_category, goal_name=None):
    # Build "don't spend on X" quests from top categories
    quests = []
    if spending_by_category:
        sorted_cats = sorted(spending_by_category.items(), key=lambda x: -abs(x[1]))[:3]
        for cat, amount in sorted_cats:
            if cat and str(cat).lower() != "other" and abs(amount) > 0:
                quests.append({
                    "name": f"No {cat} spend today",
                    "description": f"Don't spend on {cat} today (you usually spend ${abs(int(amount))} here).",
                    "category": "no-spend",
                    "points_reward": 30,
                    "currency_reward": 15,
                })
    try:
        model = genai.GenerativeModel('gemini-pro')
        prompt = f"""User's spending by category (dollars): {json.dumps(spending_by_category)}
Goal: {goal_name or 'savings'}
Generate 2–3 more short, actionable daily quest ideas (e.g. save a specific amount, log expenses). Return a JSON array of objects: {{"name": "...", "description": "...", "category": "no-spend|milestone|social", "points_reward": 25, "currency_reward": 10}}.
Only valid JSON array, no markdown."""
        response = model.generate_content(prompt)
        text = response.text.strip()
        if "```" in text:
            text = re.sub(r"```\w*\n?", "", text).strip()
        arr = json.loads(text)
        quests.extend(arr[:3])
    except Exception:
        pass
    if not quests:
        quests = [
            {"name": "Daily no-spend", "description": "Skip one non-essential purchase today", "category": "no-spend", "points_reward": 25, "currency_reward": 10},
            {"name": "Track spending", "description": "Log every expense today", "category": "milestone", "points_reward": 20, "currency_reward": 5},
        ]
    return quests[:6]
