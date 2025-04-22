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