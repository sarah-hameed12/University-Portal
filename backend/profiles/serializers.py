# profiles/serializers.py
from rest_framework import serializers
from .models import Profile

class ProfileSerializer(serializers.ModelSerializer):
    # --- For Reading ---
    # Use SerializerMethodField to generate the full URL for GET requests
    profile_pic_url = serializers.SerializerMethodField(read_only=True)

    # --- For Writing (Upload/Update) ---
    # Define the actual model field to accept file uploads.
    # Mark as write_only so it's not included in GET responses.
    # Mark as required=False and allow_null=True for optional PATCH updates.
    profile_pic = serializers.ImageField(required=False, write_only=True, allow_null=True)

    class Meta:
        model = Profile
        fields = [
            'user_id', 'email', 'name', 'batch', 'school',
            'major', 'courses', 'interests',
            'profile_pic_url', # Read-only URL for GET response
            'profile_pic',     # Write-only field for handling file upload on PUT/PATCH
            'updated_at'
        ]
        # Fields that are never set by the client directly
        read_only_fields = ['user_id', 'email', 'updated_at', 'profile_pic_url']

        # extra_kwargs is redundant now since we defined profile_pic explicitly above
        # extra_kwargs = {
        #     'profile_pic': {'write_only': True, 'required': False, 'allow_null': True}
        # }

    def get_profile_pic_url(self, obj): # obj is the Profile instance
        request = self.context.get('request')
        if obj.profile_pic and hasattr(obj.profile_pic, 'url'):
            if request:
                return request.build_absolute_uri(obj.profile_pic.url)
            else:
                # Fallback if no request context (e.g., during testing)
                 print(f"Warning: No request context in ProfileSerializer for user {obj.user_id}. Returning relative URL.")
                 # Consider using settings.MEDIA_URL if configured
                 # return settings.MEDIA_URL + obj.profile_pic.url
                 return obj.profile_pic.url
        return None # No picture associated with the profile
    # def update(self, instance, validated_data):
    #     # Debugging: See what data the serializer considers valid after is_valid()
    #     print(f"[ProfileSerializer update] Validated data: {validated_data}")

    #     # Pop profile_pic from validated_data if it exists, handle it separately
    #     profile_pic_file = validated_data.pop('profile_pic', None)

    #     # Update other fields using the default ModelSerializer update logic
    #     instance = super().update(instance, validated_data)

    #     # If a new profile_pic file was provided in the request, update it
    #     if profile_pic_file is not None:
    #          # If profile_pic_file is False or empty string, it means remove the image
    #          if not profile_pic_file:
    #              print(f"[ProfileSerializer update] Removing profile picture for {instance.email}")
    #              instance.profile_pic.delete(save=False) # Delete file from storage, don't save model yet
    #          else:
    #              # Otherwise, assign the new file
    #              print(f"[ProfileSerializer update] Updating profile picture for {instance.email} with file: {profile_pic_file.name}")
    #              instance.profile_pic = profile_pic_file

    #         # Save the instance again *after* potentially modifying profile_pic
    #          instance.save()

    #     return instance