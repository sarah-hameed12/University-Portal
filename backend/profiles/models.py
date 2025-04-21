# profiles/models.py
from django.db import models
from django.conf import settings
import uuid

# Helper function to define upload path based on user ID
def user_profile_pic_path(instance, filename):
    # file will be uploaded to MEDIA_ROOT/profile_pics/<user_id>/<filename>
    # Use the user's UUID (string representation) for the folder name
    return f'profile_pics/{instance.user_id}/{filename}'

class Profile(models.Model):
    # Link to the user. We'll use the Supabase UUID directly here.
    # If you were using Django Auth, this would be models.OneToOneField(settings.AUTH_USER_MODEL).
    user_id = models.UUIDField(primary_key=True, editable=False) # Use Supabase UUID as PK
    email = models.EmailField(unique=True, editable=False) # Store email for reference
    name = models.CharField(max_length=100, blank=True, default='')
    batch = models.CharField(max_length=10, blank=True, default='') # e.g., "2026"
    school = models.CharField(max_length=100, blank=True, default='') # e.g., "SDSB", "SAHSOL"
    major = models.CharField(max_length=100, blank=True, default='') # e.g., "Computer Science"
    courses = models.TextField(blank=True, default='', help_text="Optional: List courses separated by commas or new lines")
    interests = models.TextField(blank=True, default='', help_text="Optional: List interests separated by commas or new lines")
    profile_pic = models.ImageField(upload_to=user_profile_pic_path, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Profile for {self.email}"

    # Optional: Method to get profile pic URL safely
    @property
    def profile_pic_url(self):
        if self.profile_pic and hasattr(self.profile_pic, 'url'):
            return self.profile_pic.url
        return None # Or return a path to a default avatar