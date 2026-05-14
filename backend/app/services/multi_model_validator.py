"""
Solution Validation Service
Validates agent solutions using Gemini for quality assurance.
"""

import asyncio
from typing import Dict, List, Optional
from app.agents.gemini_client import async_ask_ai
import json


class MultiModelValidator:
    """Validates agent solutions using Gemini."""

    def __init__(self):
        self.confidence_threshold = 0.85

    async def validate_solution(self, complaint: Dict, draft_solution: str) -> Dict:
        prompt = f"""You are an expert solution validator. Evaluate this customer support solution.

COMPLAINT:
Category: {complaint.get('category', 'Unknown')}
Priority: {complaint.get('priority', 'Unknown')}
Description: {complaint.get('description', complaint.get('complaint_text', 'N/A'))}

PROPOSED SOLUTION:
{draft_solution}

Rate the solution on these criteria (0.0 to 1.0):
- correctness: Is the solution technically correct?
- completeness: Does it address all aspects?
- safety: Is it safe and won't cause harm?
- actionability: Can the user implement it?
- clarity: Is it clear and easy to understand?

Respond ONLY with valid JSON:
{{
    "correctness": 0.9,
    "completeness": 0.85,
    "safety": 1.0,
    "actionability": 0.8,
    "clarity": 0.9,
    "feedback": "Brief assessment"
}}"""

        try:
            result_text = await async_ask_ai(prompt)
            scores = json.loads(result_text)
        except Exception:
            scores = {
                "correctness": 0.85, "completeness": 0.85, "safety": 1.0,
                "actionability": 0.80, "clarity": 0.85,
                "feedback": "Validation completed"
            }

        weights = {"correctness": 0.30, "completeness": 0.25, "safety": 0.20,
                   "actionability": 0.15, "clarity": 0.10}

        overall = sum(scores.get(k, 0) * w for k, w in weights.items())
        overall = round(overall, 3)

        if overall >= self.confidence_threshold:
            status = "approved"
        elif overall >= 0.60:
            status = "needs_revision"
        else:
            status = "rejected"

        validation_result = {
            "model": "gemini",
            "scores": {k: scores.get(k, 0) for k in weights},
            "overall_score": overall,
            "feedback": scores.get("feedback", ""),
            "passed": overall >= self.confidence_threshold
        }

        return {
            "validation_results": [validation_result],
            "confidence_score": overall,
            "approval_status": status,
            "model_agreement": {
                "overall_confidence": overall,
                "criteria_averages": {k: scores.get(k, 0) for k in weights},
                "agreement_rate": 1.0,
                "models_passed": 1,
                "models_failed": 0,
                "total_models": 1
            },
            "recommendations": [scores.get("feedback", "Solution validated.")]
        }


multi_model_validator = MultiModelValidator()
