import json
import re
import os
import logging
from typing import Dict, Any, Optional, List
from app.config import settings

logger = logging.getLogger("gemini_service")

class GeminiService:
    def __init__(self):
        self.api_key = settings.GEMINI_API_KEY or os.environ.get("GEMINI_API_KEY", "")
        self.client = None
        self._init_client()

    def _init_client(self):
        if not self.api_key:
            logger.warning("GEMINI_API_KEY is not set. Offline/fallback engine active.")
            return
        
        # Try google.genai first (latest SDK)
        try:
            from google import genai
            self.client = genai.Client(api_key=self.api_key)
            self.sdk_type = "google_genai"
            logger.info("Initialized Google GenAI client successfully.")
            return
        except Exception as e:
            logger.debug(f"google.genai init exception: {e}")

        # Fallback to google.generativeai
        try:
            import google.generativeai as gai
            gai.configure(api_key=self.api_key)
            self.legacy_model = gai.GenerativeModel("gemini-2.5-flash")
            self.sdk_type = "google_generativeai"
            logger.info("Initialized legacy google.generativeai client.")
            return
        except Exception as e:
            logger.warning(f"google.generativeai init exception: {e}")

        self.sdk_type = "mock"

    def _clean_json_string(self, text: str) -> str:
        # Strip markdown code blocks `json ... `
        cleaned = text.strip()
        cleaned = re.sub(r"^`(?:json)?\s*", "", cleaned, flags=re.MULTILINE)
        cleaned = re.sub(r"\s*`$", "", cleaned, flags=re.MULTILINE)
        return cleaned.strip()

    async def generate_json(self, prompt: str, fallback_generator: Optional[callable] = None) -> Dict[str, Any]:
        """
        Generate structured JSON response using Gemini, with intelligent fallback.
        """
        if self.api_key and self.client and getattr(self, "sdk_type", "") == "google_genai":
            try:
                response = self.client.models.generate_content(
                    model="gemini-2.5-flash",
                    contents=prompt,
                    config={"response_mime_type": "application/json"}
                )
                raw_text = response.text or ""
                cleaned = self._clean_json_string(raw_text)
                return json.loads(cleaned)
            except Exception as e:
                logger.error(f"Gemini API error: {e}. Attempting fallback parser.")

        elif self.api_key and getattr(self, "legacy_model", None):
            try:
                response = self.legacy_model.generate_content(
                    prompt,
                    generation_config={"response_mime_type": "application/json"}
                )
                raw_text = response.text or ""
                cleaned = self._clean_json_string(raw_text)
                return json.loads(cleaned)
            except Exception as e:
                logger.error(f"Legacy Gemini API error: {e}. Attempting fallback parser.")

        # Deterministic / offline fallback generator
        if fallback_generator:
            return fallback_generator()
        return {}

gemini_service = GeminiService()
