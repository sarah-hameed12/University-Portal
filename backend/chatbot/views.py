# chatbot/views.py

import os
import google.generativeai as genai
from django.conf import settings # To access the key from settings
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
import logging # For better error logging

# Configure logging
logger = logging.getLogger(__name__)

class ChatbotQueryView(APIView):
    """
    Handles chatbot queries from the frontend, interacts with Gemini API.
    """
    authentication_classes = [] # Add authentication if needed (e.g., TokenAuthentication)
    permission_classes = []     # Add permissions if needed (e.g., IsAuthenticated)

    def post(self, request, *args, **kwargs):
        # 1. Get API Key Safely
        api_key = settings.GOOGLE_API_KEY
        if not api_key:
            logger.error("Chatbot API Key missing in settings.")
            return Response(
                {"error": "Chatbot configuration error. Please contact support."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        # 2. Get History from Request Body
        history = request.data.get('history')
        if not history or not isinstance(history, list):
            return Response(
                {"error": "Invalid request: 'history' field is missing or not a list."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Optional: Basic validation of history format
        # You might want more robust validation depending on needs
        for item in history:
            if not isinstance(item, dict) or 'role' not in item or 'parts' not in item:
                 return Response(
                    {"error": "Invalid history format. Each item must have 'role' and 'parts'."},
                    status=status.HTTP_400_BAD_REQUEST
                )

        # 3. Configure Google AI
        try:
            genai.configure(api_key=api_key)
            # Choose the model (e.g., 'gemini-1.5-flash-latest' or 'gemini-1.5-pro-latest')
            model = genai.GenerativeModel('gemini-1.5-flash-latest')
        except Exception as e:
            logger.error(f"Error configuring Google AI: {e}")
            return Response(
                {"error": "Chatbot configuration error."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        # 4. Generate Content (using the history directly)
        try:
            # The history sent from frontend already includes the latest user message
            # generate_content works well with the full conversational history
            logger.debug(f"Sending to Gemini - History Length: {len(history)}")
            response = model.generate_content(
                history,
                # Optional: Add generation config (temperature, safety settings etc.)
                # generation_config=genai.types.GenerationConfig(...)
                # safety_settings=[...]
            )

            # Check if the response has text
            if response.parts:
                reply_text = response.text # Convenience accessor for simple text
                logger.debug(f"Received from Gemini: {reply_text[:100]}...") # Log snippet
                return Response({"reply": reply_text}, status=status.HTTP_200_OK)
            else:
                 # Handle cases where the model might have been blocked or returned no content
                 logger.warning(f"Gemini response finished but has no parts. Finish Reason: {response.prompt_feedback.block_reason if response.prompt_feedback else 'N/A'}")
                 return Response(
                    {"reply": "I couldn't generate a response for that. Please try rephrasing."},
                    status=status.HTTP_200_OK # Or maybe 500? Depends on how you want to handle blocks
                 )

        except Exception as e:
            # Handle potential API errors (rate limits, invalid requests, internal errors, etc.)
            logger.error(f"Error calling Google AI API: {e}", exc_info=True) # Log full traceback
            # Provide a generic error to the user
            return Response(
                {"error": "Sorry, I encountered an issue processing your request. Please try again later."},
                status=status.HTTP_503_SERVICE_UNAVAILABLE # Indicate temporary backend issue
            )