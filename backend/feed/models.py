# feed/models.py
from django.db import models
import uuid

# Default UUID function (keep as is for post/comment/like IDs)
def default_uuid():
    return uuid.UUID('00000000-0000-0000-0000-000000000000')
NIL_UUID = uuid.UUID('00000000-0000-0000-0000-000000000000')
class Post(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    author_id = models.UUIDField(editable=False, db_index=True, default=NIL_UUID)
    author_name = models.CharField(max_length=100, blank=True)
    content = models.TextField()
    author_email = models.EmailField(max_length=254, null=True, blank=True, db_index=True)
    image_url = models.URLField(blank=True, null=True)
    timestamp = models.DateTimeField(auto_now_add=True)
    # Add title field
    title = models.CharField(max_length=255, blank=True)
    # Existing field for communities
    community = models.ForeignKey('Community', related_name='posts', on_delete=models.CASCADE, null=True, blank=True)
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
    
#Communitites
class JoinRequestStatus(models.TextChoices):
    PENDING = 'pending', 'Pending'
    APPROVED = 'approved', 'Approved'
    REJECTED = 'rejected', 'Rejected'

# Add enum for community membership status
class MembershipType(models.TextChoices):
    ADMIN = 'admin', 'Admin'
    MEMBER = 'member', 'Member'

# Add community privacy setting
class CommunityPrivacy(models.TextChoices):
    PUBLIC = 'public', 'Public'
    RESTRICTED = 'restricted', 'Restricted'
    PRIVATE = 'private', 'Private'

# Update Community model with privacy setting
class Community(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100)  # This field is missing in the database
    description = models.TextField(blank=True, null=True)
    creator_id = models.CharField(max_length=100)
    creator_name = models.CharField(max_length=100)
    banner_image = models.URLField(blank=True, null=True)
    icon_image = models.URLField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    privacy_type = models.CharField(
        max_length=20,
        choices=CommunityPrivacy.choices,
        default=CommunityPrivacy.PUBLIC
    )
    
    @property
    def member_count(self):
        try:
            return self.members.count()
        except:
            return 0

# Add CommunityMember model
class CommunityMember(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    community = models.ForeignKey(Community, related_name='members', on_delete=models.CASCADE)  # Make sure related_name is 'members'
    user_id = models.CharField(max_length=100)
    display_name = models.CharField(max_length=100)  # Make sure you're using display_name consistently
    member_type = models.CharField(
        max_length=20, 
        choices=MembershipType.choices,
        default=MembershipType.MEMBER
    )
    joined_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ('community', 'user_id')

class JoinRequest(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    community = models.ForeignKey('Community', related_name='join_requests', on_delete=models.CASCADE)
    user_id = models.CharField(max_length=100)  # Supabase User ID
    user_name = models.CharField(max_length=100)
    message = models.TextField(blank=True, null=True)
    status = models.CharField(max_length=20, choices=JoinRequestStatus.choices, default=JoinRequestStatus.PENDING)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ('community', 'user_id', 'status')

class VoiceChannel(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100)
    community = models.ForeignKey(Community, on_delete=models.CASCADE, related_name='voice_channels')
    created_at = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)
    
    def __str__(self):
        return f"{self.name} ({self.community.name})"

class VoiceChannelParticipant(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    channel = models.ForeignKey(VoiceChannel, on_delete=models.CASCADE, related_name='participants')
    user_id = models.CharField(max_length=100)
    display_name = models.CharField(max_length=255)
    joined_at = models.DateTimeField(auto_now_add=True)
    is_muted = models.BooleanField(default=False)
    
    class Meta:
        unique_together = ['channel', 'user_id']
        
    def __str__(self):
        return f"{self.display_name} in {self.channel.name}"



