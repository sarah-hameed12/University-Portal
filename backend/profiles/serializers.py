# profiles/serializers.py
from rest_framework import serializers
from .models import Profile

class ProfileSerializer(serializers.ModelSerializer):
    # Use SerializerMethodField to generate the full URL
    profile_pic_url = serializers.SerializerMethodField()

    class Meta:
        model = Profile
        fields = [
            'user_id', 'email', 'name', 'batch', 'school',
            'major', 'courses', 'interests',
            'profile_pic_url', # The result of get_profile_pic_url will go here
            'updated_at'
            # We DO NOT list 'profile_pic' here for GET requests
        ]
        # user_id and email are likely read-only from the model definition
        read_only_fields = ['user_id', 'email', 'updated_at']

        # Keep extra_kwargs if UserProfileViewByEmail uses this for updates
        # This allows sending 'profile_pic' data in PUT/PATCH requests
        extra_kwargs = {
            'profile_pic': {'write_only': True, 'required': False}
        }

    def get_profile_pic_url(self, obj): # obj is the Profile instance
        # Get the request from the serializer's context
        # This context needs to be passed from the view (RetrieveAPIView does this automatically)
        request = self.context.get('request')
        if obj.profile_pic and hasattr(obj.profile_pic, 'url'):
            # If we have a request object, build the full absolute URL
            if request:
                return request.build_absolute_uri(obj.profile_pic.url)
            # Otherwise (e.g., in tests or different context), return relative URL
            # You might want to configure settings.MEDIA_URL for a better fallback
            else:
                 print(f"Warning: No request context in ProfileSerializer for user {obj.user_id}. Returning relative URL.")
                 return obj.profile_pic.url
        # Return None if there's no profile picture file
        return None