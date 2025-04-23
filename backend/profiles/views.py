# profiles/views.py
from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.exceptions import NotFound, PermissionDenied, APIException # Added APIException
from rest_framework.permissions import AllowAny
from rest_framework.parsers import MultiPartParser, FormParser
from .models import Profile
from .serializers import ProfileSerializer
import uuid
from rest_framework import generics, status, permissions 

# View to Retrieve and Update Profile BY EMAIL (INSECURE)
class UserProfileViewByEmail(generics.RetrieveUpdateAPIView):
    serializer_class = ProfileSerializer
    parser_classes = [MultiPartParser, FormParser]
    authentication_classes = []
    permission_classes = [AllowAny]

    def get_queryset(self):
        return Profile.objects.all()

    def get_object(self):
        user_email = self.request.query_params.get('email', None)
        if not user_email and self.request.method != 'GET':
             user_email = self.request.data.get('email', None)

        print(f"--- Attempting to get/create profile by email: {user_email} ---")

        if not user_email:
             print("--- Email identifier not provided in request ---")
             raise PermissionDenied("Email identifier required.")

        try:
            # --- >>> Use get_or_create <<< ---
            # This will find the profile OR create a new one if it doesn't exist
            # We NEED a user_id (PK) to create. We have to generate one based on email
            # which is VERY BAD PRACTICE normally, but necessary for this insecure flow.
            # A better insecure way might be to make email the PK, but that requires model changes.
            # Let's generate a UUID based on the email for consistency (still bad)
            # IMPORTANT: This assumes the corresponding Supabase user *also* uses this email.

            # Generate a predictable UUID based on the email (Namespace DNS method)
            # This ensures the same email always maps to the same UUID *within this app*
            # but it's NOT the actual Supabase user ID unless email is guaranteed unique globally
            # and you used this same method everywhere.
            generated_user_id = uuid.uuid5(uuid.NAMESPACE_DNS, user_email)

            profile, created = Profile.objects.get_or_create(
                email=user_email,
                defaults={'user_id': generated_user_id} # Provide the required PK
            )
            # --- >>> End get_or_create <<< ---

            if created:
                print(f"--- Created new profile for email {user_email} with generated ID {generated_user_id} ---")
            else:
                print(f"--- Found existing profile for email {user_email} ---")

            # Security Note: We are NOT verifying ownership here.
            return profile

        except Exception as e:
            # Catch unexpected errors during get_or_create
            print(f"--- Unexpected error during get_or_create for email {user_email}: {e} ---")
            # Raise a generic 500 error
            raise APIException("Error accessing or creating profile.", code=status.HTTP_500_INTERNAL_SERVER_ERROR)


    # retrieve and update methods can remain largely the same
    # as get_object now either finds or creates (or raises exception)
    def retrieve(self, request, *args, **kwargs):
        # ... (keep previous retrieve logic with try/except) ...
        try:
            instance = self.get_object()
            serializer = self.get_serializer(instance)
            return Response(serializer.data)
        except (PermissionDenied, NotFound, APIException) as e: # Catch APIException too
             status_code = status.HTTP_403_FORBIDDEN if isinstance(e, PermissionDenied) else \
                           status.HTTP_404_NOT_FOUND if isinstance(e, NotFound) else \
                           status.HTTP_500_INTERNAL_SERVER_ERROR
             return Response({"detail": str(e)}, status=status_code)
        except Exception as e:
             print(f"--- Unexpected error during retrieve: {e} ---")
             return Response({"detail": "An internal server error occurred."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


    def update(self, request, *args, **kwargs):
        # ... (keep previous update logic with try/except around get_object) ...
        partial = kwargs.pop('partial', False)
        try:
            instance = self.get_object()
        except (PermissionDenied, NotFound, APIException) as e:
             status_code = status.HTTP_403_FORBIDDEN if isinstance(e, PermissionDenied) else \
                           status.HTTP_404_NOT_FOUND if isinstance(e, NotFound) else \
                           status.HTTP_500_INTERNAL_SERVER_ERROR
             return Response({"detail": str(e)}, status=status_code)
        except Exception as e:
             print(f"--- Unexpected error during update's get_object: {e} ---")
             return Response({"detail": "An internal server error occurred."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        # ... (rest of update logic for mutable_data, serializer validation, save) ...
        mutable_data = request.data.copy()
        mutable_data.pop('user_id', None)
        mutable_data.pop('email', None)
        if 'profile_pic' not in mutable_data and partial:
            mutable_data.pop('profile_pic', None)
        serializer = self.get_serializer(instance, data=mutable_data, partial=partial)
        try:
            serializer.is_valid(raise_exception=True)
        except serializers.ValidationError as e:
            return Response(e.detail, status=status.HTTP_400_BAD_REQUEST)
        self.perform_update(serializer)
        if getattr(instance, '_prefetched_objects_cache', None): instance._prefetched_objects_cache = {}
        read_serializer = self.get_serializer(instance)
        return Response(read_serializer.data)
class PublicProfileDetailView(generics.RetrieveAPIView):
    """
    Provides read-only access to a user profile based on their user_id (UUID pk).
    """
    queryset = Profile.objects.all()
    serializer_class = ProfileSerializer
    lookup_field = 'pk' # DRF defaults to 'pk', which matches our user_id primary key
    authentication_classes = [] # Allow anyone to view public profiles
    permission_classes = [permissions.AllowAny] # Allow anyone to view public profiles

    # Override retrieve to handle not found gracefully if needed,
    # but RetrieveAPIView handles 404 by default.
    def retrieve(self, request, *args, **kwargs):
        try:
            instance = self.get_object()
            serializer = self.get_serializer(instance)
            return Response(serializer.data)
        except NotFound:
            return Response({"detail": "Profile not found."}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            print(f"Error retrieving profile {kwargs.get('pk')}: {e}") # Log unexpected errors
            return Response({"detail": "Error retrieving profile."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)