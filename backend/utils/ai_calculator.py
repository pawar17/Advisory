import google.generativeai as genai
import os
import json
from dotenv import load_dotenv
from datetime import datetime, timedelta

load_dotenv()

_api_key = os.getenv('GOOGLE_AI_API_KEY')
if _api_key and _api_key.strip() and _api_key.strip() not in ('your_google_ai_api_key', 'your_google_ai_key'):
    genai.configure(api_key=_api_key.strip())

# Current Gemini model IDs (see https://ai.google.dev/gemini-api/docs/models)
GEMINI_CHAT_MODEL = "gemini-2.0-flash"
GEMINI_CHAT_FALLBACK = "gemini-2.5-flash"
GEMINI_GOAL_MODEL = "gemini-2.0-flash"

def calculate_levels_with_ai(goal_data, user_data=None):
    """
    Calculate optimal savings levels using AI
    Falls back to basic calculation if AI fails
    """
    if user_data is None:
        user_data = {}

    # Basic fallback calculation
    remaining = goal_data['target_amount'] - goal_data.get('current_amount', 0)
    current = goal_data.get('current_amount', 0)

    # Calculate days to goal
    days_to_goal = 180
    if goal_data.get('target_date'):
        target_date = goal_data['target_date']
        if isinstance(target_date, str):
            target_date = datetime.fromisoformat(target_date.replace('Z', '+00:00'))
        days_to_goal = max((target_date - datetime.utcnow()).days, 30)

    monthly_income = user_data.get('monthly_income') or 3000
    avg_expenses = user_data.get('avg_expenses') or 2200
    from_statement = user_data.get('from_bank_statement', False)

    # Default level count by remaining amount
    if remaining < 500:
        total_levels = 10
    elif remaining < 2000:
        total_levels = 20
    elif remaining < 5000:
        total_levels = 30
    else:
        total_levels = 50

    amount_per_level = remaining / total_levels
    level_thresholds = [
        current + (amount_per_level * i)
        for i in range(1, total_levels + 1)
    ]
    daily_target = round(remaining / days_to_goal, 2)

    # Try AI enhancement (Gemini): suggest levels and daily target from income/expenses
    try:
        prompt = f"""
You are a financial coach. Using the user's goal and (when available) their bank statement income and expenses, suggest a realistic level plan and messages.

Goal:
- Target amount: ${goal_data['target_amount']}
- Current amount: ${current}
- Remaining: ${remaining}
- Category: {goal_data.get('category', 'general')}
- Days to goal: {days_to_goal}

User finances (from bank statement when available):
- Monthly income (earnings): ${monthly_income}
- Monthly expenses: ${avg_expenses}
- From bank statement data: {from_statement}
- Current streak: {user_data.get('current_streak', 0)} days

Suggest a realistic plan:
1. suggested_total_levels: number between 10 and 50 (more levels = smaller steps; consider income minus expenses to keep each level achievable).
2. suggested_daily_target: daily savings amount that is realistic given their income and expenses (number, e.g. 15.50).
3. daily_savings_tip: One specific, actionable tip (max 80 chars).
4. milestone_message_25, milestone_message_50, milestone_message_75: Short motivational messages (max 50 chars each).
5. completion_message: Celebratory message for 100% (max 50 chars).

Return valid JSON only, no markdown. Example:
{{"suggested_total_levels": 25, "suggested_daily_target": 12.50, "daily_savings_tip": "Skip one takeout per week", "milestone_message_25": "Quarter way there!", "milestone_message_50": "Halfway!", "milestone_message_75": "Almost there!", "completion_message": "Goal achieved!"}}
"""

        model = genai.GenerativeModel(GEMINI_GOAL_MODEL)
        response = model.generate_content(prompt)

        ai_text = response.text.strip()
        if '```json' in ai_text:
            ai_text = ai_text.split('```json')[1].split('```')[0].strip()
        elif '```' in ai_text:
            ai_text = ai_text.split('```')[1].split('```')[0].strip()

        ai_data = json.loads(ai_text)

        # Use AI-suggested levels if valid
        sug_levels = ai_data.get('suggested_total_levels')
        if isinstance(sug_levels, (int, float)) and 10 <= int(sug_levels) <= 50:
            total_levels = int(sug_levels)
            amount_per_level = remaining / total_levels
            level_thresholds = [current + (amount_per_level * i) for i in range(1, total_levels + 1)]

        sug_daily = ai_data.get('suggested_daily_target')
        if isinstance(sug_daily, (int, float)) and float(sug_daily) >= 0:
            daily_target = round(float(sug_daily), 2)

        return {
            'total_levels': total_levels,
            'level_thresholds': level_thresholds,
            'daily_target': daily_target,
            'ai_suggestions': {k: v for k, v in ai_data.items() if k not in ('suggested_total_levels', 'suggested_daily_target')}
        }

    except Exception as e:
        print(f"AI calculation failed: {e}, using fallback")
        return {
            'total_levels': total_levels,
            'level_thresholds': level_thresholds,
            'daily_target': daily_target,
            'ai_suggestions': {
                'daily_savings_tip': f"Save ${daily_target} per day to reach your goal",
                'milestone_message_25': "Quarter way there! Keep going!",
                'milestone_message_50': "Halfway done! You're crushing it!",
                'milestone_message_75': "Almost there! Sprint to the finish!",
                'completion_message': "Goal achieved! Time to celebrate!"
            }
        }

def _is_google_ai_configured():
    key = os.getenv('GOOGLE_AI_API_KEY') or ''
    key = key.strip()
    return key and key not in ('your_google_ai_api_key', 'your_google_ai_key')


def ai_chat_assistant(user_message, user_context):
    """
    AI chatbot that teaches finance concepts (down payments, emergency fund, APR, etc.)
    for the SavePop savings app.
    """
    if not _is_google_ai_configured():
        return (
            "To use the finance coach, add your Google AI (Gemini) API key in the backend .env file as GOOGLE_AI_API_KEY. "
            "Until then, here’s a quick tip: a down payment is the upfront cash you pay when buying something big (like a car or house); "
            "the rest you borrow. Saving for it first helps you pay less interest and get better terms."
        )

    try:
        prompt = f"""
You are SavePop's friendly finance coach. Your main job is to teach personal finance concepts in simple, short ways so users can learn while they save.

You love explaining things like:
- Down payment (what it is, why it matters, typical ranges like 10–20% for cars, 10–20% for homes)
- Emergency fund (3–6 months of expenses, why it’s first)
- APR and interest (how borrowing costs work in plain language)
- Budgeting, saving goals, and good money habits

User context (use only to personalize, not required for teaching):
- Name: {user_context.get('name', 'there')}
- Current goal: {user_context.get('goal_name', 'No active goal')}
- Progress: ${user_context.get('current_amount', 0)} / ${user_context.get('target_amount', 0)} ({user_context.get('progress_percent', 0)}%)
- Streak: {user_context.get('current_streak', 0)} days

User asked: "{user_message}"

Rules:
- Do not start with greetings (no Hi, Hey there, or the user's name)—go straight to the answer.
- Answer in 2–4 short sentences. Be clear and encouraging.
- Use simple words. If you use a term (e.g. APR), briefly define it.
- You may use 1–2 emojis if it fits. Stay focused on teaching the concept.
- If they ask something off-topic, gently steer to a related finance idea or say you’re here for finance and savings.
"""

        for model_name in (GEMINI_CHAT_MODEL, GEMINI_CHAT_FALLBACK):
            try:
                model = genai.GenerativeModel(model_name)
                response = model.generate_content(prompt)
                text = (response.text or "").strip()
                if text:
                    return text
            except Exception as fallback_e:
                print(f"AI chat failed with {model_name}: {fallback_e}")
                continue
        return "Ask me about down payments, emergency funds, APR, or saving tips!"

    except Exception as e:
        err = str(e).lower()
        print(f"AI chat failed: {e}")
        if 'api_key' in err or 'invalid' in err or '403' in err or '401' in err:
            return (
                "Google AI rejected the request. Check that GOOGLE_AI_API_KEY in backend/.env "
                "is a valid key from https://aistudio.google.com and restart the backend."
            )
        return "I'm having trouble connecting right now. Try again in a bit—and remember: a down payment is the chunk you pay upfront so you borrow less and pay less interest!"
