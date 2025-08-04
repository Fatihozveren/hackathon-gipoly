"""
AdCreative AI agent with Gemini and Vertex AI integration.
"""

import os
import uuid
from typing import Dict, Any, Optional
from dotenv import load_dotenv
import google.generativeai as genai

import vertexai
from vertexai.preview.vision_models import ImageGenerationModel
from google.cloud import storage
from google.cloud import translate
from .prompts import AD_CREATIVE_PROMPT_EN, AD_CREATIVE_PROMPT_TR, IMAGE_GENERATION_PROMPT_EN, IMAGE_GENERATION_PROMPT_TR
from .schemas import AdCreativeRequest, AdCreativeResult, Headlines, Keyword, Performance, BudgetRecommendations
from .utils import parse_ai_response, validate_ad_creative_response

load_dotenv()

class AdCreativeAgent:
    """AI agent for generating advertising campaigns."""
    
    def __init__(self):
        self.gemini_api_key = os.getenv("GEMINI_API_KEY")
        if not self.gemini_api_key:
            raise ValueError("GEMINI_API_KEY environment variable is required")
        
        # Configure Gemini API
        genai.configure(api_key=self.gemini_api_key)
        self.model = genai.GenerativeModel('gemini-2.0-flash')
        

        
        # Initialize Vertex AI
        self._setup_vertex_ai()
    
    def _setup_vertex_ai(self):
        """Setup Vertex AI client."""
        try:
            # Set Google Cloud credentials from environment variable
            credentials_json = os.getenv("GOOGLE_APPLICATION_CREDENTIALS_JSON")
            credentials_path = os.getenv("GOOGLE_APPLICATION_CREDENTIALS")
            
            if credentials_json:
                # Use JSON content from environment variable
                import tempfile
                import json
                
                # Create temporary file with credentials
                with tempfile.NamedTemporaryFile(mode='w', suffix='.json', delete=False) as f:
                    json.dump(json.loads(credentials_json), f)
                    temp_credentials_path = f.name
                
                os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = temp_credentials_path
                
            elif credentials_path:
                # Use file path (for local development)
                os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = credentials_path
            
            # Initialize Vertex AI
            project_id = os.getenv("GOOGLE_CLOUD_PROJECT_ID")
            location = os.getenv("GOOGLE_CLOUD_LOCATION", "us-central1")
            
            if project_id:
                try:
                    vertexai.init(project=project_id, location=location)
                    self.vertex_ai_available = True
                except Exception as init_error:
                    print(f"Vertex AI initialization failed: {init_error}")
                    self.vertex_ai_available = False
            else:
                self.vertex_ai_available = False
                
        except Exception as e:
            self.vertex_ai_available = False
    
    async def generate_ad_campaign(self, request: AdCreativeRequest) -> AdCreativeResult:
        """
        Generate complete advertising campaign including text and image.
        """
        try:
            # Step 1: Generate text content with Gemini
            text_result = await self._generate_text_content(request)
            
            # Step 2: Generate image with Vertex AI
            image_url = await self._generate_ad_image(request)
            
            # Step 3: Combine results
            return AdCreativeResult(
                headlines=Headlines(
                    short=text_result["headlines"]["short"],
                    long=text_result["headlines"]["long"]
                ),
                ad_texts=text_result["ad_texts"],
                ctas=text_result["ctas"],
                keywords=[Keyword(**kw) for kw in text_result["keywords"]],
                performance=Performance(**text_result["performance"]),
                insights=text_result["insights"],
                platform_tips=text_result.get("platform_tips", []),
                ab_testing=text_result.get("ab_testing", []),
                budget_recommendations=BudgetRecommendations(**text_result.get("budget_recommendations", {})),
                campaign_timeline=text_result.get("campaign_timeline", []),
                next_steps=text_result.get("next_steps", []),
                image_url=image_url
            )
            
        except Exception as e:
            raise Exception(f"Ad campaign generation failed: {str(e)}")
    
    async def _generate_text_content(self, request: AdCreativeRequest) -> Dict[str, Any]:
        """Generate text content using Gemini."""
        try:
            # Select prompt based on language
            language = request.lang or "en"
            prompt_template = AD_CREATIVE_PROMPT_TR if language == "tr" else AD_CREATIVE_PROMPT_EN
            
            # Translate product info to English for better AI understanding
            english_product_name = await self._translate_to_english(request.product_name)
            english_product_description = await self._translate_to_english(request.product_description)
            
            # Format audience information
            audience_age = request.audience.age
            audience_interests = ", ".join(request.audience.interests)
            
            # Use English product info in prompt for better AI understanding
            prompt = prompt_template.format(
                product_name=english_product_name,
                product_description=english_product_description,
                platform=request.platform,
                goal=request.goal,
                audience_age=audience_age,
                audience_interests=audience_interests
            )
            
            response = await self.model.generate_content_async(prompt)
            response_data = parse_ai_response(response.text)
            
            if validate_ad_creative_response(response_data):
                return response_data
            else:
                raise Exception("Invalid response structure from AI")
                
        except Exception as e:
            raise e
    
    async def _translate_to_english(self, text: str) -> str:
        """Translate Turkish text to English using Google Translate API."""
        try:
            # Initialize Google Translate client
            translate_client = translate.TranslationServiceClient()
            
            # Project ID from environment
            project_id = os.getenv("GOOGLE_CLOUD_PROJECT_ID")
            if not project_id:
                return text
            
            # Location
            location = "global"
            
            # Parent resource
            parent = f"projects/{project_id}/locations/{location}"
            
            # Translate to English
            response = translate_client.translate_text(
                request={
                    "parent": parent,
                    "contents": [text],
                    "mime_type": "text/plain",
                    "source_language_code": "tr",
                    "target_language_code": "en",
                }
            )
            
            # Get translated text
            translated_text = response.translations[0].translated_text
            return translated_text
            
        except Exception as e:
            # Fallback: return original text
            return text

    async def _generate_ad_image(self, request: AdCreativeRequest) -> str:
        """Generate advertising image using Vertex AI."""
        if not self.vertex_ai_available:
            raise Exception("Vertex AI is not available. Please check Google Cloud credentials.")
        
        try:
            # Always use English prompt for better AI understanding
            prompt_template = IMAGE_GENERATION_PROMPT_EN
            
            # Translate Turkish product info to English
            english_product_name = await self._translate_to_english(request.product_name)
            english_product_description = await self._translate_to_english(request.product_description)
            
            # Format audience information
            audience_age = request.audience.age
            audience_interests = ", ".join(request.audience.interests)
            
            prompt = prompt_template.format(
                product_name=english_product_name,
                product_description=english_product_description,
                platform=request.platform,
                audience_age=audience_age,
                audience_interests=audience_interests
            )
            
            # Generate image using Vertex AI
            image = await self._generate_image_with_vertex_ai(prompt)
            
            if image:
                # Save image to Google Cloud Storage and return URL
                url = self._save_image_to_storage(image)
                return url
            else:
                raise Exception("Image generation failed. No image was created.")
                
        except Exception as e:
            raise Exception(f"Image generation failed: {str(e)}")
    
    async def _generate_image_with_vertex_ai(self, prompt: str) -> Optional[bytes]:
        """Generate image using Vertex AI Imagen model."""
        try:
            # Use Vertex AI Imagen model
            model = ImageGenerationModel.from_pretrained("imagen-3.0-generate-002")
            
            # Generate image with more parameters like Google docs
            response = model.generate_images(
                prompt=prompt,
                number_of_images=1,
                language="en",
                aspect_ratio="1:1",
                safety_filter_level="block_some",
                person_generation="allow_adult"
            )
            
            # Check if response has images
            if response and hasattr(response, 'images') and response.images:
                # Get the first image
                image = response.images[0]
                
                # Get image bytes directly from the image object
                image_bytes = image._image_bytes
                return image_bytes
            else:
                raise Exception("Vertex AI returned no images")
            
        except Exception as e:
            raise Exception(f"Vertex AI image generation failed: {str(e)}")
    
    def _save_image_to_storage(self, image_data: bytes) -> str:
        """Save image to Google Cloud Storage and return public URL."""
        try:
            # Initialize Google Cloud Storage client
            storage_client = storage.Client()
            
            # Get bucket (create if doesn't exist)
            bucket_name = "gipoly-adcreative-images"
            try:
                bucket = storage_client.get_bucket(bucket_name)
            except:
                bucket = storage_client.create_bucket(bucket_name, location="us-central1")
                # Make bucket publicly readable
                bucket.make_public()
            
            # Generate unique filename
            filename = f"adcreative_{uuid.uuid4()}.png"
            blob = bucket.blob(filename)
            
            # Upload image data
            blob.upload_from_string(image_data, content_type='image/png')
            
            # Make blob publicly readable
            blob.make_public()
            
            # Return public URL
            return blob.public_url
            
        except Exception as e:
            raise Exception(f"Failed to save image to Google Cloud Storage: {str(e)}") 