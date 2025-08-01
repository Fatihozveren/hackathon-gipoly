"""
SEO Strategist AI agent with Gemini integration.
"""

import json
import os
from datetime import datetime
from typing import Dict, Any, Optional
from dotenv import load_dotenv
import google.generativeai as genai
from langchain_google_genai import ChatGoogleGenerativeAI
from .prompts import MANUAL_SEO_PROMPT_EN, MANUAL_SEO_PROMPT_TR, URL_ANALYSIS_PROMPT_EN, URL_ANALYSIS_PROMPT_TR
from .schemas import ManualSEORequest, URLSEORequest, SEOAnalysisResult, URLAnalysisResult
from .utils import extract_content_from_url, clean_json_codeblock

load_dotenv()

class SEOStrategist:
    """AI agent for SEO analysis and optimization."""
    
    def __init__(self):
        self.api_key = os.getenv("GEMINI_API_KEY")
        if not self.api_key:
            raise ValueError("GEMINI_API_KEY environment variable is required")
        
        # Configure Gemini API
        genai.configure(api_key=self.api_key)
        self.model = genai.GenerativeModel('gemini-2.0-flash')
        
        # Initialize LangChain LLM
        self.llm = ChatGoogleGenerativeAI(
            model="gemini-2.0-flash",
            google_api_key=self.api_key,
            temperature=0.7,
            max_tokens=2000
        )
    
    async def analyze_manual_seo(self, request: ManualSEORequest) -> SEOAnalysisResult:
        """
        Analyze manual SEO input and provide optimization suggestions.
        """
        try:
            # Prompt language selection
            language = request.language or "tr"
            prompt_template = MANUAL_SEO_PROMPT_TR if language == "tr" else MANUAL_SEO_PROMPT_EN
            
            prompt = prompt_template.format(
                product_name=request.product_name,
                product_description=request.product_description,
                target_keywords=request.target_keywords or "Not specified"
            )
            
            response = await self.llm.ainvoke(prompt)
            
            try:
                response_data = self._parse_ai_response(response.content)
                if self._validate_manual_response(response_data):
                    return SEOAnalysisResult(
                        title=response_data.get("title", ""),
                        meta_description=response_data.get("meta_description", ""),
                        keywords=response_data.get("keywords", []),
                        seo_description=response_data.get("seo_description", ""),
                        recommendations=response_data.get("recommendations", []),
                        score=response_data.get("score", 0)
                    )
                else:
                    raise Exception("Invalid response structure from AI")
            except Exception as e:
                raise e
                
        except Exception as e:
            raise e
    
    async def analyze_url_seo(self, request: URLSEORequest) -> URLAnalysisResult:
        """
        Analyze URL and provide comprehensive SEO and AIO analysis.
        """
        try:
            # Step 1: Extract content from URL
            content_data = extract_content_from_url(request.url)
            
            if 'error' in content_data:
                return URLAnalysisResult(
                    url=request.url,
                    content_info={"error": content_data['error']},
                    product_analysis={},
                    seo_optimization={},
                    user_experience={},
                    technical_seo={},
                    competitive_analysis={},
                    impact_analysis={},
                    segment_scores={},
                    action_items={},
                    seo_score=0
                )
            
            # Step 2: Analyze with Gemini
            analysis_result = await self._analyze_with_gemini(content_data, request.language)
            
            if not analysis_result['success']:
                raise Exception(analysis_result.get('error', 'AI analizi başarısız oldu'))
            
            # Step 3: Return comprehensive result
            return URLAnalysisResult(
                url=request.url,
                content_info={
                    'title': content_data.get('title', ''),
                    'description': content_data.get('description', ''),
                    'content_length': len(content_data.get('content', ''))
                },
                product_analysis=analysis_result['analysis'].get('product_analysis', {}),
                seo_optimization=analysis_result['analysis'].get('seo_optimization', {}),
                user_experience=analysis_result['analysis'].get('user_experience', {}),
                technical_seo=analysis_result['analysis'].get('technical_seo', {}),
                competitive_analysis=analysis_result['analysis'].get('competitive_analysis', {}),
                impact_analysis=analysis_result['analysis'].get('impact_analysis', {}),
                segment_scores=analysis_result['analysis'].get('segment_scores', {}),
                action_items=analysis_result['analysis'].get('action_items', {}),
                seo_score=analysis_result['analysis'].get('seo_score', 0)
            )
            
        except Exception as e:
            return URLAnalysisResult(
                url=request.url,
                content_info={"error": str(e)},
                product_analysis={},
                seo_optimization={},
                user_experience={},
                technical_seo={},
                competitive_analysis={},
                impact_analysis={},
                segment_scores={},
                action_items={},
                seo_score=0
            )
    
    async def _analyze_with_gemini(self, content_data: Dict[str, Any], language: str = "tr") -> Dict[str, Any]:
        """
        Analyze content with Gemini AI.
        """
        # Try different model names
        model_names = ['gemini-1.5-flash', 'gemini-1.5-flash-latest']
        
        for model_name in model_names:
            try:
                model = genai.GenerativeModel(model_name)
                
                # Prompt selection
                prompt_template = URL_ANALYSIS_PROMPT_TR if language == "tr" else URL_ANALYSIS_PROMPT_EN
                prompt = prompt_template.format(url=content_data.get('url', 'N/A'))
                
                response = model.generate_content(prompt)
                
                try:
                    # First try with clean_json_codeblock
                    cleaned_text = clean_json_codeblock(response.text)
                    result = json.loads(cleaned_text)
                    return {
                        'success': True,
                        'analysis': result
                    }
                except json.JSONDecodeError as e:
                    try:
                        # Try with _parse_ai_response as fallback
                        result = self._parse_ai_response(response.text)
                        return {
                            'success': True,
                            'analysis': result
                        }
                    except Exception as e2:
                        continue
                    
            except Exception as e:
                # Check if it's a quota exceeded error
                if "quota" in str(e).lower() or "429" in str(e):
                    return {
                        'success': False,
                        'error': 'API kotası aşıldı. Lütfen daha sonra tekrar deneyin veya API limitlerini kontrol edin.'
                    }
                continue
        
        # All AI models failed
        return {
            'success': False,
            'error': 'AI analizi başarısız oldu. Lütfen daha sonra tekrar deneyin.'
        }
    
    def _parse_ai_response(self, response: str) -> Dict[str, Any]:
        """Parse AI response and extract JSON."""
        try:
            start_idx = response.find('{')
            end_idx = response.rfind('}') + 1
            if start_idx != -1 and end_idx != 0:
                json_str = response[start_idx:end_idx]
                return json.loads(json_str)
            else:
                raise ValueError("No JSON found in response")
        except Exception as e:
            raise ValueError(f"Invalid JSON in AI response: {e}")
    
    def _validate_manual_response(self, response_data: Dict[str, Any]) -> bool:
        """Validate manual SEO response data."""
        required_fields = ["title", "meta_description", "keywords", "seo_description", "recommendations", "score"]
        for field in required_fields:
            if field not in response_data:
                return False
        if not isinstance(response_data["keywords"], list):
            return False
        if not isinstance(response_data["recommendations"], list):
            return False
        return True
    
 