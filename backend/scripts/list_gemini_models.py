#!/usr/bin/env python3
"""List Gemini models available for your API key. Run from backend: python scripts/list_gemini_models.py"""
import os
import sys

# Load env from backend/.env
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from dotenv import load_dotenv
load_dotenv(os.path.join(os.path.dirname(os.path.dirname(__file__)), ".env"))

import google.generativeai as genai
genai.configure(api_key=os.getenv("GOOGLE_AI_API_KEY"))

print("Models that support generateContent:\n")
for m in genai.list_models():
    if "generateContent" in (m.supported_generation_methods or []):
        print(" ", m.name)
print("\nUse the model name (e.g. models/gemini-2.0-flash) in your code.")
