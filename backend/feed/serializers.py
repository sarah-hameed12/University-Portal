# feed/serializers.py
from rest_framework import serializers
from .models import Post, Comment, Like, Community, CommunityMember, JoinRequest, VoiceChannel, VoiceChannelParticipant  # Add missing models
from profiles.models import Profile # Still needed for PFP lookup

# --- Add Comment Serializer ---
import uuid
class BasicProfilePicSerializer(serializers.ModelSerializer):
  
    profile_pic_url = serializers.SerializerMethodField()

    class Meta:
        model = Profile
        fields = ['profile_pic_url'] 

    def get_profile_pic_url(self, obj):
        request = self.context.get('request')
        if obj.profile_pic and hasattr(obj.profile_pic, 'url'):
            if request:
                return request.build_absolute_uri(obj.profile_pic.url)
            return obj.profile_pic.url 
        return None 

class CommentSerializer(serializers.ModelSerializer):
    author_profile_pic_url = serializers.SerializerMethodField()

    class Meta:
        model = Comment
        fields = [
            'id',
            'post',
            'author_id',
            'author_name',
            'author_email', 
            'content',
            'timestamp',
            'author_profile_pic_url',
            'is_deleted', 
            'deleted_by',  
            'deleted_at', 
        ]
    
        read_only_fields = ['id', 'post', 'author_id', 'author_name', 'timestamp', 'author_profile_pic_url']


    def get_author_profile_pic_url(self, obj):
     
        print(f"[CommentSerializer] Getting profile pic for comment {obj.id}. Author Email on comment: {obj.author_email}")

        if not obj.author_email:
            print(f"[CommentSerializer] Comment {obj.id} has no author_email stored.")
    
            return None 
        try:
            profile = Profile.objects.filter(email=obj.author_email).first()
            print(f"[CommentSerializer] Profile lookup by email '{obj.author_email}' result: {'Found' if profile else 'Not Found'}")

            if profile and profile.profile_pic and hasattr(profile.profile_pic, 'url'):
                print(f"[CommentSerializer] Profile Pic found: {profile.profile_pic.url}")
                request = self.context.get('request')
                if request:
                    return request.build_absolute_uri(profile.profile_pic.url)
                return profile.profile_pic.url # Fallback

            elif profile:
                 print(f"[CommentSerializer] Profile found for email {obj.author_email}, but no profile_pic file or URL.")
                 return None
            else:
              
                 print(f"[CommentSerializer] Profile not found in DB for email: {obj.author_email}")
                 return None

        except Exception as e:
            print(f"[CommentSerializer] ERROR getting profile pic URL for email {obj.author_email} (Comment {obj.id}): {e}")
            return None


from rest_framework import serializers
from .models import Post, Comment, Like
from profiles.models import Profile 
from django.conf import settings 


class PostSerializer(serializers.ModelSerializer):
    author_profile_pic_url = serializers.SerializerMethodField()
    like_count = serializers.SerializerMethodField()
    is_liked_by_user = serializers.SerializerMethodField()
    latest_comment = serializers.SerializerMethodField()
    comment_count = serializers.SerializerMethodField() 
   

    class Meta:
        model = Post
        fields = [
            'id', 'author_id', 'author_name',
            'author_email', # Keep in fields
            'content', 'image_url',
            'timestamp', 'author_profile_pic_url',
            'like_count', 'is_liked_by_user', 'latest_comment',
            'title',
            'comment_count'  
        ]
       
        read_only_fields = ['author_id', 'timestamp']
     


 
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

   
    def get_like_count(self, obj):
        return obj.likes.count()

    def get_is_liked_by_user(self, obj):
   
        requesting_user_name = self.context.get('requesting_user_name', None)


        if requesting_user_name:
        
            has_liked = obj.likes.filter(user_name=requesting_user_name).exists()

            return has_liked
        else:
         
            return False 

    def get_latest_comment(self, obj):
        latest = obj.comments.order_by('-timestamp').first()
        if latest:
           
            return CommentSerializer(latest, context=self.context).data
        return None
    def get_comment_count(self, obj):
      
        count = obj.comments.filter(is_deleted=False).count()
        print(f"[PostSerializer] Calculated comment_count for Post {obj.id}: {count}") # Keep log
        return count
    
#Communitites
class CommunityMemberSerializer(serializers.ModelSerializer):
     class Meta:
        model = CommunityMember
        fields = '__all__'

class CommunitySerializer(serializers.ModelSerializer):
    # Remove the redundant source parameter
    members = CommunityMemberSerializer(many=True, read_only=True)
    
    class Meta:
        model = Community
        fields = ['id', 'name', 'description', 'creator_id', 'creator_name', 
                 'banner_image', 'icon_image', 'created_at', 'member_count', 'members']
        
class JoinRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = JoinRequest
        fields = '__all__'

class VoiceChannelSerializer(serializers.ModelSerializer):
    participant_count = serializers.SerializerMethodField()
    
    class Meta:
        model = VoiceChannel
        fields = ['id', 'name', 'community', 'created_at', 'is_active', 'participant_count']
        read_only_fields = ['id', 'created_at', 'community', 'participant_count']

    def get_participant_count(self, obj):
        return obj.participants.count()

class VoiceChannelParticipantSerializer(serializers.ModelSerializer):
    class Meta:
        model = VoiceChannelParticipant
        fields = ['id', 'user_id', 'display_name', 'joined_at', 'is_muted']

class VoiceChannelDetailSerializer(serializers.ModelSerializer):
    participants = VoiceChannelParticipantSerializer(many=True, read_only=True)
    
    class Meta:
        model = VoiceChannel
        fields = ['id', 'name', 'community', 'created_at', 'is_active', 'participants']
