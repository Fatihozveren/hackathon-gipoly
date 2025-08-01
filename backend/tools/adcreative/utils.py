"""
Utility functions for AdCreative tool.
"""

import json
import re
from typing import Dict, Any


def clean_json_codeblock(text: str) -> str:
    """Clean JSON code block from AI response."""
    # Remove markdown code blocks
    text = re.sub(r'```json\s*', '', text)
    text = re.sub(r'```\s*$', '', text)
    
    # Remove any leading/trailing whitespace
    text = text.strip()
    
    return text


def parse_ai_response(response: str) -> Dict[str, Any]:
    """Parse AI response and extract JSON."""
    try:
        # First try with clean_json_codeblock
        cleaned_text = clean_json_codeblock(response)
        return json.loads(cleaned_text)
    except json.JSONDecodeError:
        # Fallback: try to find JSON in the response
        start_idx = response.find('{')
        end_idx = response.rfind('}') + 1
        if start_idx != -1 and end_idx != 0:
            json_str = response[start_idx:end_idx]
            return json.loads(json_str)
        else:
            raise ValueError("No valid JSON found in response")


def validate_ad_creative_response(response_data: Dict[str, Any]) -> bool:
    """Validate AdCreative response data."""
    required_fields = [
        "headlines", "ad_texts", "ctas", "keywords", 
        "performance", "insights"
    ]
    
    for field in required_fields:
        if field not in response_data:
            return False
    
    # Validate headlines
    if not isinstance(response_data["headlines"], dict):
        return False
    if "short" not in response_data["headlines"] or "long" not in response_data["headlines"]:
        return False
    
    # Validate lists
    list_fields = ["ad_texts", "ctas", "keywords", "insights"]
    for field in list_fields:
        if not isinstance(response_data[field], list):
            return False
    
    # Validate performance
    if not isinstance(response_data["performance"], dict):
        return False
    required_performance_fields = ["ctr_estimate", "ad_score", "conversion_potential"]
    for field in required_performance_fields:
        if field not in response_data["performance"]:
            return False
    
    return True


 