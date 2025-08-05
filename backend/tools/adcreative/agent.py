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
        """Setup Vertex AI client with Google Drive credentials."""
        try:
            # Try to download credentials from Google Drive
            credentials_path = self._download_credentials_from_drive()
            
            if credentials_path:
                os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = credentials_path
                print(f"Using Google Drive credentials: {credentials_path}")
            else:
                # Fallback to environment variable
                credentials_json = os.getenv("GOOGLE_APPLICATION_CREDENTIALS_JSON")
                if credentials_json:
                    import tempfile
                    import json
                    
                    with tempfile.NamedTemporaryFile(mode='w', suffix='.json', delete=False) as f:
                        json.dump(json.loads(credentials_json), f)
                        temp_credentials_path = f.name
                    
                    os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = temp_credentials_path

            # Initialize Vertex AI
            project_id = os.getenv("GOOGLE_CLOUD_PROJECT_ID")
            location = os.getenv("GOOGLE_CLOUD_LOCATION", "us-central1")
            
            print(f"Project ID: {project_id}")
            print(f"Location: {location}")
            
            if project_id:
                try:
                    print("Initializing Vertex AI...")
                    vertexai.init(project=project_id, location=location)
                    self.vertex_ai_available = True
                    print("Vertex AI initialized successfully!")
                except Exception as init_error:
                    print(f"Vertex AI initialization failed: {init_error}")
                    self.vertex_ai_available = False
            else:
                self.vertex_ai_available = False
                print("GOOGLE_CLOUD_PROJECT_ID not found - Vertex AI disabled")

        except Exception as e:
            self.vertex_ai_available = False
    
    def _download_credentials_from_drive(self) -> Optional[str]:
        """Download Google credentials from Google Drive using direct link."""
        try:
            import requests
            
            # Google Drive direct link
            drive_link = os.getenv("GOOGLE_DRIVE_CREDENTIALS_URL")
            if not drive_link:
                print("GOOGLE_DRIVE_CREDENTIALS_URL not found")
                return None
            
            print(f"Downloading credentials from: {drive_link}")
            
            # Convert Google Drive view link to direct download link
            if "drive.google.com/file/d/" in drive_link:
                file_id = drive_link.split("/file/d/")[1].split("/")[0]
                download_url = f"https://drive.google.com/uc?export=download&id={file_id}"
            else:
                download_url = drive_link
            
            print(f"Using download URL: {download_url}")
            
            # Download the file
            response = requests.get(download_url, timeout=30)
            response.raise_for_status()
            
            # Save to temporary file
            import tempfile
            with tempfile.NamedTemporaryFile(mode='w', suffix='.json', delete=False) as f:
                f.write(response.text)
                temp_path = f.name
            
            print(f"Credentials downloaded successfully: {temp_path}")
            return temp_path
            
        except Exception as e:
            print(f"Failed to download credentials from Drive: {e}")
            return None
    
    async def generate_ad_campaign(self, request: AdCreativeRequest) -> AdCreativeResult:
        """
        Generate complete advertising campaign including text and image.
        """
        try:
            print("Starting ad campaign generation...")
            
            # Step 1: Generate text content with Gemini
            print("Generating text content...")
            text_result = await self._generate_text_content(request)
            print("Text content generated successfully")
            
            # Step 2: Generate image with Vertex AI
            print("Generating image...")
            image_url = await self._generate_ad_image(request)
            print(f"Image generated: {image_url}")
            
            # Step 3: Combine results
            print("Combining results...")
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
            print(f"Ad campaign generation failed with error: {str(e)}")
            import traceback
            print(f"Full traceback: {traceback.format_exc()}")
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
            
            # Generate image with parameters (try-catch for compatibility)
            try:
                response = model.generate_images(
                    prompt=prompt,
                    number_of_images=1,
                    language="en",
                    aspect_ratio="1:1",
                    safety_filter_level="block_some",
                    person_generation="allow_adult"
                )
                print(f"Response with advanced parameters: {response}")
            except TypeError as e:
                # Fallback to basic parameters if advanced parameters not supported
                print(f"Advanced parameters not supported, using basic: {e}")
                response = model.generate_images(
                    prompt=prompt,
                    number_of_images=1
                )
                print(f"Response with basic parameters: {response}")
            
            print(f"Response type: {type(response)}")
            print(f"Response attributes: {dir(response)}")
            
            # Check if response has images
            if response and hasattr(response, 'images') and response.images:
                print(f"Number of images: {len(response.images)}")
                # Get the first image
                image = response.images[0]
                print(f"Image type: {type(image)}")
                print(f"Image attributes: {dir(image)}")
                
                # Get image bytes directly from the image object
                image_bytes = image._image_bytes
                print(f"Image bytes length: {len(image_bytes)}")
                return image_bytes
            else:
                print(f"Response has no images. Response: {response}")
                raise Exception("Vertex AI returned no images")
            
        except Exception as e:
            raise Exception(f"Vertex AI image generation failed: {str(e)}")
    
    def _save_image_to_storage(self, image_data: bytes) -> str:
        """Save image to Google Cloud Storage and return public URL."""
        try:
            # Initialize Google Cloud Storage client
            storage_client = storage.Client()
            
            # Get bucket name from environment variable
            bucket_name = os.getenv("GOOGLE_CLOUD_STORAGE_BUCKET", "gipoly-adcreative-images")
            try:
                bucket = storage_client.get_bucket(bucket_name)
            except Exception as e:
                # If bucket doesn't exist, create it
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