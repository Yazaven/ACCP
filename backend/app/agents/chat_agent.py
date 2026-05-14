from app.agents.gemini_client import async_ask_gemini
from app.services.rag_engine import rag_engine
from app.agents.orchestrator import run_agent_pipeline
import sys
import os
import asyncio

sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'Training_data'))
try:
    from training_data import RESPONSE_TEMPLATES
except ImportError:
    RESPONSE_TEMPLATES = {}

_chat_cache = {}
CACHE_MAX_SIZE = 1000

FAQ_KB = {
    "features": "This platform offers AI categorization, priority detection, sentiment analysis, real-time response generation, and 24/7 automated support tracking.",
    "how_it_works": "Just type your complaint! Our AI agents analyze it, assign priority, and suggest a resolution in seconds.",
    "agents": "We use specialized agents including Orchestrator, Classifier, Sentiment Analyzer, Priority Agent, and Responder.",
    "safe": "Yes, we use enterprise-grade encryption and Google OAuth 2.0 for secure access.",
}

def get_fast_faq_response(msg: str) -> str:
    m = msg.lower()
    if any(k in m for k in ["website features", "service highlights", "app features"]):
        return FAQ_KB["features"]
    if any(k in m for k in ["how to complain", "quickfix work", "process of"]):
        return FAQ_KB["how_it_works"]
    if any(k in m for k in ["which agents", "which models", "ai technology", "backend ai"]):
        return FAQ_KB["agents"]
    if any(k in m for k in ["data secure", "is it safe", "privacy policy"]):
        return FAQ_KB["safe"]
    return None

async def handle_chat_message(message: str) -> dict:
    clean_msg = message.strip()
    msg_key = clean_msg.lower()

    if msg_key in _chat_cache:
        return _chat_cache[msg_key]

    if not clean_msg:
        return {"role": "agent", "type": "info", "response": "How can I help you today?"}

    # Fast path: greetings
    greetings_keywords = ["hi", "hello", "hey", "halo", "namaste", "test", "ok", "hmm", "yo", "morning", "sup"]
    if clean_msg.lower() in greetings_keywords or (len(clean_msg) < 4 and clean_msg.lower() in greetings_keywords):
        res = {"role": "agent", "type": "info", "response": "Hello! How can I assist you today? Feel free to file a complaint or ask about our services."}
        _chat_cache[msg_key] = res
        return res

    # Fast path: local FAQ
    faq_res = get_fast_faq_response(clean_msg)
    if faq_res:
        res = {"role": "agent", "type": "info", "response": faq_res}
        _chat_cache[msg_key] = res
        return res

    # Intent detection: complaint markers
    complaint_markers = ["wrong", "issue", "bug", "broken", "failed", "error", "delay", "not working", "problem", "refund", "not received"]
    if any(marker in clean_msg.lower() for marker in complaint_markers):
        intent = "COMPLAINT"
    else:
        question_words = ["how", "what", "where", "who", "when", "why", "can", "is", "does", "provide"]
        contains_question = any(word in clean_msg.lower() for word in question_words) or "?" in clean_msg
        intent = "QUESTION"
        if not contains_question or len(clean_msg) > 60:
            try:
                intent_prompt = f"Categorize as ONE word: COMPLAINT or QUESTION. Message: {clean_msg}"
                intent_res = await asyncio.wait_for(async_ask_gemini(intent_prompt), timeout=3.0)
                intent = intent_res.upper()
            except:
                intent = "QUESTION"

    if "QUESTION" in intent:
        policy_context = rag_engine.retrieve(clean_msg)
        answer_prompt = f"""You are a professional AI support agent.

COMPANY POLICY CONTEXT (use if relevant):
{policy_context}

USER QUESTION: {clean_msg}

Respond in professional English. Be detailed, helpful, and specific to the question."""
        try:
            answer = await asyncio.wait_for(async_ask_gemini(answer_prompt), timeout=8.0)
            res = {"role": "agent", "type": "info", "response": answer}
            _chat_cache[msg_key] = res
            return res
        except Exception as e:
            print(f"AI Chat Error: {e}")
            return {"role": "agent", "type": "info", "response": "Apologies, I'm currently unavailable. Please try again shortly."}

    # Complaint pipeline
    try:
        result = await asyncio.wait_for(run_agent_pipeline(clean_msg), timeout=15.0)

        category = result["category"]
        priority = result["priority"]
        templated_response = RESPONSE_TEMPLATES.get(category, {}).get(priority)
        final_response = templated_response if (templated_response and len(clean_msg) < 50) else result["response"]

        final_res = {
            "role": "agent",
            "type": "complaint",
            "category": result["category"],
            "priority": result["priority"],
            "response": final_response,
            "action": result["action"],
            "sentiment": result.get("sentiment", "Neutral"),
            "solution": result.get("solution", ""),
            "satisfaction": result.get("satisfaction", "Medium"),
            "similar_issues": result.get("similar_issues", ""),
            "steps": result.get("steps", []),
        }

        if len(_chat_cache) > CACHE_MAX_SIZE:
            _chat_cache.pop(next(iter(_chat_cache)))
        _chat_cache[msg_key] = final_res
        return final_res
    except Exception as e:
        print(f"Chat Pipeline Error: {e}")
        return {"role": "agent", "type": "info", "response": "Something went wrong. Please try again."}
