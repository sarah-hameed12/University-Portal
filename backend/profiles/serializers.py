# profiles/serializers.py
from rest_framework import serializers
from .models import Profile

class ProfileSerializer(serializers.ModelSerializer):
    # Make profile_pic read-only initially in the main serializer if handled separately
    # Or include it for easier updates if needed (requires careful view handling)
    profile_pic_url = serializers.ImageField(source='profile_pic', read_only=True) # Send URL on GET

    class Meta:
        model = Profile
        # Exclude user_id and email from direct updates via serializer maybe?
        # Or make them read_only if you handle creation/linking in the view
        fields = [
            'user_id', 'email', 'name', 'batch', 'school',
            'major', 'courses', 'interests', 'profile_pic_url', # Read URL
            'profile_pic', # Add this field to *accept* uploads on PUT/PATCH
            'updated_at'
        ]
        read_only_fields = ['user_id', 'email', 'updated_at', 'profile_pic_url']
        # Make profile_pic write_only so it doesn't show up in GET response, only for upload
        extra_kwargs = {
            'profile_pic': {'write_only': True, 'required': False}
        }
    def get_author_profile_pic_url(self, obj): # obj is the Post instance
        profile_pic_url = None # Default to None
        try:
            if obj.author_id:
                # Use filter().first() for safer lookup
                profile = Profile.objects.filter(user_id=obj.author_id).first()

                # Check if profile exists AND profile_pic field has a file associated
                if profile and profile.profile_pic and hasattr(profile.profile_pic, 'url'):
                    relative_url = profile.profile_pic.url
                    request = self.context.get('request')
                    if request:
                        # Build absolute URL using request context
                        profile_pic_url = request.build_absolute_uri(relative_url)
                        print(f"Built absolute URL for author {obj.author_id}: {profile_pic_url}") # Debug log
                    else:
                        # Fallback (might not work depending on frontend/deployment)
                        # Construct manually if MEDIA_URL is reliable
                        # profile_pic_url = f"{settings.MEDIA_URL}{profile.profile_pic.name}" # Example construction
                        profile_pic_url = relative_url # Or just return relative
                        print(f"Warning: No request context for author {obj.author_id}. Returning relative URL: {profile_pic_url}") # Debug log

        except Exception as e:
            # Log unexpected errors during lookup/URL generation
            print(f"ERROR getting profile pic URL for author {obj.author_id}: {e}")

        return profile_pic_url 