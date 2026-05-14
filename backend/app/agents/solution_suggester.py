import sys
import os
from app.agents.gemini_client import async_ask_gemini

CATEGORY_SOLUTIONS = {
    "Billing": "We'll review your billing and process any refund within 24-48 hours. Our billing team will contact you.",
    "Technical": "Our technical team will investigate and provide a fix within 24 hours. We'll keep you updated.",
    "Delivery": "We apologize for the delay. We're tracking your order and will ensure priority delivery within 12 hours.",
    "Service": "We're sorry for the inconvenience. Our service team will reach out within 24 hours to resolve this personally.",
    "Security": "Your security is our priority. Our team is investigating immediately and will contact you within 6 hours.",
    "Other": "Thank you for reaching out. Our support team will review your case and respond within 24 hours.",
}

async def suggest_solution(category: str, text: str, user_language: str = None) -> str:
    if not text or not text.strip():
        return "Please contact our support team for assistance."

    prompt = f"""You are a helpful customer support agent. Analyze this complaint and provide an appropriate solution.

COMPLAINT: "{text}"
CATEGORY: {category}

RULES:
1. Understand the complaint severity and complexity.
2. For SIMPLE issues: Give a brief, direct solution (2-3 sentences).
3. For COMPLEX issues: Provide detailed steps with timelines.
4. Write in plain English — no markdown, no bullet points, no bold text.
5. Be specific to this exact complaint.
6. Include realistic timelines (hours/days).

PROVIDE THE SOLUTION:"""

    try:
        result = await async_ask_gemini(prompt)
        if result and result.strip():
            cleaned = result.strip()
            cleaned = cleaned.replace('**', '').replace('##', '').replace('###', '').replace('####', '')
            lines = cleaned.split('\n')
            cleaned_lines = []
            for line in lines:
                line = line.strip()
                if line.startswith(('•', '-', '*')):
                    line = line[1:].strip()
                if line.startswith('Step ') and ':' in line:
                    parts = line.split(':', 1)
                    if len(parts) == 2:
                        line = parts[1].strip()
                cleaned_lines.append(line)
            return ' '.join(cleaned_lines)
    except Exception as e:
        print(f"Gemini solution failed: {e}")

    return CATEGORY_SOLUTIONS.get(category, CATEGORY_SOLUTIONS["Other"])
