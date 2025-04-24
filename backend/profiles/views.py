# profiles/views.py
from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework.exceptions import NotFound, PermissionDenied, APIException, ValidationError # Added ValidationError
from rest_framework.parsers import MultiPartParser, FormParser
from .models import Profile
from .serializers import ProfileSerializer # Ensure correct serializer import
import uuid
import logging # Use logging for better practice

logger = logging.getLogger(__name__) # Get a logger instance

# View to Retrieve and Update Profile BY EMAIL (Still needs proper security)
class UserProfileViewByEmail(generics.RetrieveUpdateAPIView):
    serializer_class = ProfileSerializer
    parser_classes = [MultiPartParser, FormParser] # Correct parsers for file uploads
    authentication_classes = [] # Keep empty if testing without auth
    permission_classes = [permissions.AllowAny] # Should be IsAuthenticated in production

    def get_queryset(self):
        # Not strictly needed for RetrieveUpdateAPIView if get_object is overridden well
        return Profile.objects.all()

    def get_object(self):
        # Using email from query param for GET or body for PUT/PATCH
        # This remains insecure as it doesn't verify ownership via auth
        user_email = self.request.query_params.get('email', None)
        request_method = self.request.method
        if request_method != 'GET' and not user_email:
             user_email = self.request.data.get('email', None) # Check body for update methods

        logger.info(f"Attempting get_object for email: {user_email} (Method: {request_method})")

        if not user_email:
             logger.warning("Email identifier missing in request for profile.")
             # Don't use PermissionDenied here, BadRequest or clearer error is better
             raise APIException("Email identifier required.", code=status.HTTP_400_BAD_REQUEST)

        try:
            # --- Use get() ONLY - Rely on profile existing ---
            # Profile creation should happen via a separate, secure mechanism (e.g., on signup)
            profile = Profile.objects.get(email=user_email)
            logger.info(f"Found profile for email {user_email}")
            # Optional Ownership Check (Requires Authentication to be enabled)
            # if self.request.user and self.request.user.is_authenticated and profile.user_id != self.request.user.id:
            #     logger.warning(f"Ownership check failed: User {self.request.user.id} accessing profile for {user_email}")
            #     raise PermissionDenied("You do not have permission to access/modify this profile.")
            return profile
        except Profile.DoesNotExist:
            logger.warning(f"Profile not found for email: {user_email}")
            raise NotFound(f"Profile not found for email: {user_email}") # Raise DRF NotFound
        except Exception as e:
            logger.error(f"Unexpected error in get_object for email {user_email}: {e}", exc_info=True)
            raise APIException("Error accessing profile data.")


    # Retrieve method is handled by the parent class using get_object

    # --- Update Method with Debugging ---
    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False) # Check if it's a PATCH request
        logger.info(f"--- UserProfileViewByEmail UPDATE (Partial={partial}) ---")
        try:
            instance = self.get_object() # Get the profile instance
        except (NotFound, PermissionDenied, APIException) as e:
             raise e # Re-raise DRF exceptions directly
        except Exception as e:
             logger.error(f"Unexpected error during get_object in update: {e}", exc_info=True)
             raise APIException("Internal server error retrieving profile for update.")

        # --- >>> DEBUGGING: Inspect request data <<< ---
        print(f"Request Content-Type: {request.content_type}")
        # Use request.data for parsed form data (including text fields)
        print(f"Request Data (request.data): {request.data}")
        # Use request.FILES specifically for uploaded files
        print(f"Request Files (request.FILES): {request.FILES}")
        # --- >>> END DEBUGGING <<< ---

        # Pass request.data and potentially request.FILES to the serializer
        # Note: The serializer's 'profile_pic' field (if defined correctly)
        # should automatically pick up the file from request.FILES when request.data is passed.
        serializer = self.get_serializer(instance, data=request.data, partial=partial)

        try:
            serializer.is_valid(raise_exception=True)
            print("--- Serializer is valid. Calling perform_update... ---")
            # perform_update calls serializer.save() which triggers serializer.update()
            self.perform_update(serializer)
            print(f"--- perform_update completed for {instance.email} ---")

            # Refresh instance data if needed before sending response
            if getattr(instance, '_prefetched_objects_cache', None):
                instance._prefetched_objects_cache = {}

            return Response(serializer.data) # Return the updated data

        except ValidationError as e:
            logger.warning(f"Profile update validation failed for {instance.email}: {e.detail}")
            return Response(e.detail, status=status.HTTP_400_BAD_REQUEST)
        # Catch the specific TypeError if it still occurs during save/update
        except TypeError as e:
            logger.error(f"TypeError during profile update for {instance.email}: {e}", exc_info=True)
            # Check specifically if it's the pickle error
            if "cannot pickle 'BufferedRandom'" in str(e):
                 error_detail = "Internal server error: Failed processing file upload data."
            else:
                 error_detail = "Internal server error during update (TypeError)."
            return Response({"detail": error_detail}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        except Exception as e:
             logger.error(f"Unexpected error during profile update/save for {instance.email}: {e}", exc_info=True)
             # Use APIException for generic server errors during processing
             raise APIException("Failed to update profile due to an internal error.")

# --- PublicProfileDetailView --- (Keep as is, uses RetrieveAPIView)
class PublicProfileDetailView(generics.RetrieveAPIView):
    queryset = Profile.objects.all()
    serializer_class = ProfileSerializer
    lookup_field = 'pk'
    authentication_classes = []
    permission_classes = [permissions.AllowAny]

    # Optional: Refined retrieve to ensure context is passed for absolute URLs
    def retrieve(self, request, *args, **kwargs):
        try:
            instance = self.get_object()
            # Pass context to serializer
            serializer = self.get_serializer(instance, context={'request': request})
            return Response(serializer.data)
        except NotFound:
            logger.warning(f"Public profile not found for ID: {kwargs.get('pk')}")
            return Response({"detail": "Profile not found."}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            logger.error(f"Error retrieving public profile {kwargs.get('pk')}: {e}", exc_info=True)
            return Response({"detail": "Error retrieving profile."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)