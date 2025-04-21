# feed/serializers.py
from rest_framework import serializers
from .models import Post, Comment, Like # Import new models
from profiles.models import Profile # Still needed for PFP lookup

# --- Add Comment Serializer ---
class BasicProfileSerializer(serializers.ModelSerializer):
    """Serializer for embedding basic profile info."""
    profile_pic_url = serializers.ImageField(source='profile_pic', read_only=True)
    class Meta:
        model = Profile
        fields = ['user_id', 'name', 'profile_pic_url'] # Only basic needed info

class CommentSerializer(serializers.ModelSerializer):
    # Optionally fetch related profile info for the author
    author_profile = serializers.SerializerMethodField()

    class Meta:
        model = Comment
        fields = [
            'id', 'post', 'author_id', 'author_name', # Keep name stored at comment time
            'content', 'timestamp', 'author_profile' # Include profile
        ]
        read_only_fields = ['post', 'author_id', 'timestamp', 'author_profile']

    def get_author_profile(self, obj):
        # Fetch basic profile info for the comment author
        try:
            profile = Profile.objects.filter(user_id=obj.author_id).first()
            if profile:
                # Use a simpler serializer to avoid nesting loops if CommentSerializer used elsewhere
                return BasicProfileSerializer(profile).data
        except Exception as e:
            print(f"Error fetching profile for comment author {obj.author_id}: {e}")
        return None # Return null if profile not found

# --- Modified Post Serializer ---
# feed/serializers.py
from rest_framework import serializers
from .models import Post, Comment, Like
from profiles.models import Profile # Make sure this is imported
from django.conf import settings # Needed for fallback URL construction

# --- BasicProfileSerializer and CommentSerializer (Assume they are okay) ---
# ...

# --- Modified Post Serializer ---
class PostSerializer(serializers.ModelSerializer):
    author_profile_pic_url = serializers.SerializerMethodField()
    like_count = serializers.SerializerMethodField()
    is_liked_by_user = serializers.SerializerMethodField()
    latest_comment = serializers.SerializerMethodField()
    # author_email = serializers.EmailField(read_only=True) # Can remove this explicit definition now

    class Meta:
        model = Post
        fields = [
            'id', 'author_id', 'author_name',
            'author_email', # Keep in fields
            'content', 'image_url',
            'timestamp', 'author_profile_pic_url',
            'like_count', 'is_liked_by_user', 'latest_comment'
        ]
        # --- CORRECTED read_only_fields ---
        # author_id might be set manually, so keep it read_only here if desired
        # timestamp is auto-set
        read_only_fields = ['author_id', 'timestamp']
        # --- END CORRECTION ---


    # --- get_author_profile_pic_url method remains the same ---
    def get_author_profile_pic_url(self, obj):
        print(f"[Serializer] Getting profile pic for Post {obj.id}, Author Email: {obj.author_email}")
        if not obj.author_email:
            print(f"[Serializer] Post {obj.id} has no author_email stored.")
            return None
        try:
            profile = Profile.objects.filter(email=obj.author_email).first()
            if profile:
                print(f"[Serializer] Found profile for email {obj.author_email}. Profile Pic Field: {profile.profile_pic}")
                if profile.profile_pic and hasattr(profile.profile_pic, 'url'):
                    relative_url = profile.profile_pic.url
                    request = self.context.get('request')
                    if request:
                        absolute_url = request.build_absolute_uri(relative_url)
                        print(f"[Serializer] Built absolute URL: {absolute_url}")
                        return absolute_url
                    else:
                         print(f"[Serializer] Warning: No request context for post {obj.id}. Returning relative URL: {relative_url}")
                         return relative_url # Or construct manually: return settings.MEDIA_URL + relative_url
                else:
                    print(f"[Serializer] Profile found for {obj.author_email}, but no profile_pic file or URL.")
                    return None
            else:
                print(f"[Serializer] Profile not found in DB for email: {obj.author_email}")
                return None
        except Exception as e:
            print(f"[Serializer] ERROR getting profile pic URL for email {obj.author_email}: {e}")
            return None

    # --- Other get_ methods (like_count, etc.) remain the same ---
    def get_like_count(self, obj):
        return obj.likes.count()

    def get_is_liked_by_user(self, obj):
        # This still requires context about the *requesting* user
        # You might need to adjust how this works based on how you identify the liker
        request = self.context.get('request')
        user_identifier = None # Placeholder - determine how to get the current user's ID or name

        # Example if using the user_name sent for liking:
        # Get user_name from request if available (e.g., for detail view?)
        # Or if session auth was used: user_identifier = request.user.profile.name? request.user.profile.user_id?
        # This part is tricky without full authentication context.

        if user_identifier: # If you can determine the current user
             return obj.likes.filter(user_name=user_identifier).exists() # Or filter by user_id if you store that on Like
        return False # Default if user can't be determined

    def get_latest_comment(self, obj):
        latest = obj.comments.order_by('-timestamp').first()
        if latest:
            # Pass context down to CommentSerializer if it needs the request
            return CommentSerializer(latest, context=self.context).data
        return None
 