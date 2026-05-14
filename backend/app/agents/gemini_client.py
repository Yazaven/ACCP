import os
from dotenv import load_dotenv
import google.generativeai as genai
from typing import List, Optional

load_dotenv()

# Multi-API-Key Support with Automatic Rotation
API_KEYS_STRING = os.getenv("GEMINI_API_KEY", "")
if not API_KEYS_STRING:
    print("⚠️ GEMINI_API_KEY not set")
    API_KEYS = []
else:
    API_KEYS: List[str] = [key.strip() for key in API_KEYS_STRING.split(",") if key.strip()]
    print(f"✅ Loaded {len(API_KEYS)} Gemini API key(s)")

# Track current key index and failed keys
current_key_index = 0
failed_keys = set()

# ✅ List of supported Gemini models for fallback
SUPPORTED_MODELS = [
    "gemini-2.0-flash",
    "gemini-exp-1206",
    "gemini-2.0-flash-lite",
    "gemini-flash-latest",
    "gemini-pro-latest",
    "gemma-3-27b-it",
]

def get_next_available_key() -> Optional[str]:
    """Get the next available Gemini API key that hasn't failed."""
    global current_key_index
    
    if not API_KEYS:
        return None
    
    attempts = 0
    while attempts < len(API_KEYS):
        key = API_KEYS[current_key_index]
        
        if current_key_index not in failed_keys:
            print(f"🔑 Using Gemini API key #{current_key_index + 1}/{len(API_KEYS)}")
            return key
        
        current_key_index = (current_key_index + 1) % len(API_KEYS)
        attempts += 1
    
    print("⚠️ All Gemini API keys exhausted. Resetting...")
    failed_keys.clear()
    return API_KEYS[0] if API_KEYS else None

def mark_key_as_failed():
    """Mark the current Gemini API key as failed and rotate to next one."""
    global current_key_index
    
    failed_keys.add(current_key_index)
    print(f"❌ Gemini API key #{current_key_index + 1} failed")
    current_key_index = (current_key_index + 1) % len(API_KEYS) if API_KEYS else 0

def configure_current_key():
    """Configure genai with the current available Gemini API key."""
    key = get_next_available_key()
    if key:
        genai.configure(api_key=key)
        return True
    return False

def get_model():
    """Returns a Gemini generative model instance by trying multiple versions."""
    for model_name in SUPPORTED_MODELS:
        try:
            m = genai.GenerativeModel(model_name)
            return m
        except Exception:
            continue
    return genai.GenerativeModel("gemini-2.5-flash")  # Absolute fallback

# Initialize Gemini with first available key
if API_KEYS:
    configure_current_key()
    model = get_model()
else:
    model = None

async def async_ask_ai(prompt: str) -> str:
    """Send a prompt to Gemini with automatic key rotation on quota errors."""
    if not API_KEYS:
        raise Exception("No Gemini API keys configured")

    max_key_attempts = len(API_KEYS)

    for attempt in range(max_key_attempts):
        try:
            if not configure_current_key():
                raise Exception("All Gemini keys exhausted")

            current_model = get_model()
            response = await current_model.generate_content_async(prompt)

            if response and response.text:
                return response.text.strip()

            if attempt < max_key_attempts - 1:
                continue
            else:
                raise Exception("No valid response from Gemini")

        except Exception as e:
            error_msg = str(e).lower()

            if "quota" in error_msg or "rate limit" in error_msg or "resource exhausted" in error_msg or "429" in error_msg:
                print(f"⚠️ Gemini quota exceeded on key #{attempt + 1}, rotating...")
                mark_key_as_failed()
                if attempt < max_key_attempts - 1:
                    continue
            else:
                print(f"⚠️ Gemini error: {e}")
                try:
                    fallback_m = genai.GenerativeModel("gemini-1.5-flash")
                    res = await fallback_m.generate_content_async(prompt)
                    if res and res.text:
                        return res.text.strip()
                except:
                    pass

            if attempt == max_key_attempts - 1:
                raise Exception(f"Gemini unavailable: {e}")

    raise Exception("Gemini API exhausted")

# Backward compatibility alias
async_ask_gemini = async_ask_ai

# Test
if __name__ == "__main__":
    import asyncio
    print(asyncio.run(async_ask_ai("Hello, are you working?")))