# feed/models.py
from django.db import models
import uuid

# Default UUID function (keep as is for post/comment/like IDs)
def default_uuid():
    return uuid.UUID('00000000-0000-0000-0000-000000000000')
NIL_UUID = uuid.UUID('00000000-0000-0000-0000-000000000000')
class Post(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    author_id = models.UUIDField( editable=False, db_index=True,default=NIL_UUID)  # Changed from UUIDField
    author_name = models.CharField(max_length=100, blank=True)
    content = models.TextField()
    author_email = models.EmailField(max_length=254, null=True, blank=True, db_index=True)
    # user_id = models.UUIDField(db_index=True, default=NIL_UUID)
    image_url = models.URLField(blank=True, null=True)
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-timestamp']

    def __str__(self):
        author_display = self.author_name or str(self.author_id)
        return f"Post by {author_display} at {self.timestamp.strftime('%Y-%m-%d %H:%M')}"

class Comment(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    post = models.ForeignKey(Post, related_name='comments', on_delete=models.CASCADE)
    author_id = models.UUIDField(editable=False, db_index=True, null=True, blank=True)  # Changed from UUIDField
    author_name = models.CharField(max_length=100, blank=True)
    content = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)
    author_email = models.EmailField(max_length=254, null=True, blank=True, db_index=True) 
    is_deleted = models.BooleanField(default=False, db_index=True) # Track if deleted
    deleted_by = models.CharField(max_length=10, choices=[('AUTHOR', 'Author'), ('POSTER', 'Poster')], null=True, blank=True) # Who deleted it
    deleted_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['timestamp']

    def __str__(self):
        author_display = self.author_name or self.author_email or str(self.author_id)
        status = "[DELETED]" if self.is_deleted else ""
        return f'Comment by {author_display} on Post {self.post.id} {status}'

class Like(models.Model):
 
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    post = models.ForeignKey(Post, related_name='likes', on_delete=models.CASCADE)
    user_name = models.CharField(max_length=150, db_index=True,null=True)
    user_id = models.CharField(max_length=40, db_index=True,default=NIL_UUID)  # Changed from UUIDField
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        # unique_together = ('post', 'user_name')
        ordering = ['-timestamp']

    def __str__(self):
        return f'Like by {self.user_name} on {self.post.id}'
