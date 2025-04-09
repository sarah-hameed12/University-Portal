

from django.db import models
import uuid

class Post(models.Model):
    # Using UUID for a unique ID independent of user system
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    # Placeholder author info (adapt if linking to users later)
    author_name = models.CharField(max_length=100, default="Anonymous User")
    content = models.TextField()
    image_url = models.URLField(blank=True, null=True) # Optional image URL
    timestamp = models.DateTimeField(auto_now_add=True) # Automatically set on creation

    class Meta:
        ordering = ['-timestamp'] # Show newest posts first

    def __str__(self):
        return f"Post by {self.author_name} at {self.timestamp.strftime('%Y-%m-%d %H:%M')}"
# Create your models here.
