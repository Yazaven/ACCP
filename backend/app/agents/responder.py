import os
import sys
from dotenv import load_dotenv
import google.generativeai as genai

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)
    SUPPORTED_MODELS = [
        "gemini-2.0-flash",
        "gemini-exp-1206",
        "gemini-2.0-flash-lite",
        "gemini-flash-latest",
        "gemini-pro-latest"
    ]
    def initialize_best_model():
        for m_name in SUPPORTED_MODELS:
            try:
                return genai.GenerativeModel(m_name)
            except:
                continue
        return genai.GenerativeModel("gemini-2.0-flash")
    model = initialize_best_model()
else:
    model = None

sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'Training_data'))
try:
    from training_data import RESPONSE_TEMPLATES
except ImportError:
    RESPONSE_TEMPLATES = {}

CATEGORY_RESPONSES = {
    "Billing": "Thank you for contacting us about your billing concern. Our billing team will review your account and reach out within 24-48 hours with a resolution.",
    "Technical": "We appreciate you reporting this technical issue. Our technical team is investigating with high priority and will provide a fix within 24 hours.",
    "Delivery": "We sincerely apologize for the delivery delay. We're tracking your order and will prioritize delivery. Expect an update within 12 hours.",
    "Service": "Thank you for bringing this to our attention. Our customer service team will personally reach out within 24 hours to resolve this.",
    "Security": "Your security is our top priority. Our security team is investigating immediately and you'll receive an update within 6 hours.",
    "Other": "Thank you for contacting us. Our support team is reviewing your case and will respond with a solution within 24 hours.",
}

async def generate_response(category: str, text: str, user_language: str = None) -> str:
    if not text or not text.strip():
        return "Thank you for reaching out. We are here to help."

    if model is not None:
        prompt = f"""You are an empathetic customer support specialist responding to a complaint.

COMPLAINT: "{text}"
CATEGORY: {category}

INSTRUCTIONS:
1. Respond in professional English only.
2. Be SPECIFIC to this exact complaint (not generic).
3. Keep it SHORT and CONCISE (3-6 sentences maximum).
4. Show EMPATHY and acknowledge their specific concern.
5. Mention next steps briefly.

WRITE YOUR RESPONSE:"""
        try:
            response = await model.generate_content_async(prompt)
            if response and response.text:
                return response.text.strip()
        except Exception as e:
            print(f"Gemini generation error: {e}")

    if RESPONSE_TEMPLATES and category in RESPONSE_TEMPLATES:
        template_response = RESPONSE_TEMPLATES.get(category, {}).get("Medium")
        if template_response:
            return template_response

    return CATEGORY_RESPONSES.get(category, CATEGORY_RESPONSES["Other"])
