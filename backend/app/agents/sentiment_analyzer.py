import sys
import os
from textblob import TextBlob
from app.agents.gemini_client import async_ask_gemini

# Import training data
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'Training_data'))
try:
    from training_data import SENTIMENT_KEYWORDS, SENTIMENT_EXAMPLES
except ImportError:
    SENTIMENT_KEYWORDS = {}
    SENTIMENT_EXAMPLES = ""

async def analyze_sentiment(text: str) -> str:
    if not text or not text.strip():
        return "Neutral"

    text_lower = text.lower()
    
    # Layer 1: Heuristic check (Deterministic - 0ms)
    for sentiment, keywords in SENTIMENT_KEYWORDS.items():
        if any(word in text_lower for word in keywords):
            return sentiment

    # Layer 2: TextBlob (Statistical fallback)
    try:
        blob = TextBlob(text)
        polarity = blob.sentiment.polarity
        if polarity > 0.5: return "Positive"
        if polarity < -0.6: return "Angry"
        if polarity < -0.1: return "Negative"
    except:
        pass

    # Layer 4: AI check (LLM - Contextual, only if needed)
    prompt = f"""
{SENTIMENT_EXAMPLES}

Analyze the emotional sentiment of this text in ONE word only:
Positive, Neutral, Negative, or Angry

Text: {text}

Return only ONE word.
"""
    try:
        result = await async_ask_gemini(prompt)
        allowed = {"Positive", "Neutral", "Negative", "Angry"}
        filtered_res = result.strip().split('\n')[0].replace('.', '').strip()
        return filtered_res if filtered_res in allowed else "Neutral"
    except:
        return "Neutral"
