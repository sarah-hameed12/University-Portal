# feed/views.py
from rest_framework import generics, permissions, status, viewsets
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.decorators import action
from django.shortcuts import get_object_or_404
from .models import Post, Comment, Like
from .serializers import PostSerializer, CommentSerializer
# from profiles.models import Profile # Needed if serializers fetch profile info
import uuid # <<<--- Add import
from profiles.models import Profile
from django.utils import timezone 

from .models import Post, Comment, Like, Community, CommunityMember, JoinRequest, JoinRequestStatus, NIL_UUID
from .serializers import PostSerializer, CommentSerializer, CommunitySerializer, JoinRequestSerializer
# IsOwnerOrReadOnly (Only works if you re-enable proper authentication)
class IsOwnerOrReadOnly(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        # Write permissions are only allowed to the owner of the post/comment.
        # This requires request.user to be set correctly by authentication.
        return obj.author_id == request.user.id # Compare UUIDs


# PostListView (Example allows anonymous posts, less secure)
class PostListView(generics.ListCreateAPIView):
    serializer_class = PostSerializer
    authentication_classes = []
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        # Only return posts that don't belong to any community
        return Post.objects.filter(community__isnull=True).order_by('-timestamp')

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context.update({"request": self.request})
        return context

    def perform_create(self, serializer):
        data = self.request.data
        print(f"--- Post Create [View]: Received data payload: {data}")

        # Get all necessary author details from request
        author_id_str = data.get('user_id') # EXPECTING 'user_id' from frontend
        author_name = data.get('author_name', 'Anonymous Poster')
        author_email = data.get('author_email') # <<< GET EMAIL

        print(f"--- Post Create [View]: Extracted user_id: '{author_id_str}'")
        print(f"--- Post Create [View]: Extracted author_name: '{author_name}'")
        print(f"--- Post Create [View]: Extracted author_email: '{author_email}'") # <<< LOG EMAIL

        # Prepare arguments for saving
        save_kwargs = {
            'author_name': author_name,
            'author_email': author_email # <<< ADD EMAIL TO KWARGS
        }

        # Process author_id (still important for ownership)
        if author_id_str:
            try:
                author_id_uuid = uuid.UUID(author_id_str)
                save_kwargs['author_id'] = author_id_uuid # Add author_id if valid
                print(f"--- Post Create [View]: Valid author_id found: {author_id_uuid}")
            except (ValueError, TypeError) as e:
                 print(f"--- Post Create [View]: WARNING - Invalid user_id format: {author_id_str}. Using model default for author_id.")
                 # Let default handle author_id if invalid
        else:
             print(f"--- Post Create [View]: No 'user_id' provided. Using model default for author_id.")
             # Let default handle author_id if missing

        print(f"--- Post Create [View]: Calling serializer.save with kwargs: {save_kwargs}")
        try:
            serializer.save(**save_kwargs) # Save with name, email, and potentially ID
            saved_post = serializer.instance
            print(f"--- Post Create [View] SUCCESS: Saved post '{saved_post.id}'. Author ID: {saved_post.author_id}, Email: {saved_post.author_email}")
        except Exception as e:
            print(f"--- Post Create [View] FAILED during save: {e}")
            raise e# Re-raise to let DRF handle the error response

# PostDetailView (Example allows anyone to view/delete, less secure for delete)
class PostDetailView(generics.RetrieveDestroyAPIView):
    queryset = Post.objects.all()
    serializer_class = PostSerializer
    # --- Allow Anyone --- (User Requirement, less secure for DELETE)
    authentication_classes = []
    permission_classes = [permissions.AllowAny]
    # --- End Allow Anyone ---
    lookup_field = 'pk' # pk here is the Post ID (UUID)

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context.update({"request": self.request})
        # Could pass user_id from query params here too if needed by serializer
        return context

    # Add perform_destroy logic if you want owner check without auth (complex/insecure)
    # Default allows anyone if permission_classes is AllowAny


# --- CORRECTED: Post Like/Unlike View (Reads user_id from body) ---
class PostLikeToggleView(APIView):
    authentication_classes = []
    permission_classes = [permissions.AllowAny]

    def post(self, request, pk): # pk is post ID (UUID)
        # --- Still check if Post exists ---
        post = get_object_or_404(Post, pk=pk)

        # --- >>> Get user_name directly from request BODY <<< ---
        user_name = request.data.get('user_name')

        # --- Validate received user_name ---
        if not user_name:
            # Handle missing username in request
            return Response({"detail": "user_name not provided in request body."}, status=status.HTTP_400_BAD_REQUEST)
        if isinstance(user_name, str) and not user_name.strip():
             # Handle blank username string if needed (optional, depends on requirements)
             return Response({"detail": "Username cannot be blank."}, status=status.HTTP_400_BAD_REQUEST)
        # Add any other validation for username format if desired

        print(f"--- Like Toggle Attempt directly by User Name: '{user_name}' for Post: {pk} ---")

        # --- Use the user_name directly for the Like model operation ---
        # NOTE: This bypasses checking if a profile actually exists for this user name
        like, created = Like.objects.get_or_create(
            post=post,
            user_name=user_name # Use the name from the request body
        )

        if created:
            print(f"--- User Name '{user_name}' liked Post {pk} ---")
            return Response({"status": "liked", "like_count": post.likes.count()}, status=status.HTTP_201_CREATED)
        else:
            print(f"--- User Name '{user_name}' unliked Post {pk} ---")
            like.delete()
            return Response({"status": "unliked", "like_count": post.likes.count()}, status=status.HTTP_200_OK)
    def destroy(self, request, *args, **kwargs):
        instance = self.get_object() # Handles 404 if post not found

        # --- >>> THIS IS THE CRITICAL PART <<< ---
        # It's trying to get 'user_id' from the REQUEST BODY (request.data)
        user_id_from_request_str = request.data.get('user_id')
        # --- >>> END CRITICAL PART <<< ---

        if not user_id_from_request_str:
            # --- >>> THIS IS WHY YOU GET 400 <<<---
            # Since the frontend isn't sending a body, this is None,
            # triggering the 400 Bad Request response.
            return Response(
                {"detail": "user_id not provided in request body for delete verification."},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            user_id_from_request = uuid.UUID(user_id_from_request_str)
        except ValueError:
            return Response(
                {"detail": "Invalid user_id format provided for delete verification."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # ... (rest of the permission check comparing instance.author_id and user_id_from_request) ...

        # --- Compare IDs ---
        if instance.author_id == user_id_from_request:
            # ... perform delete ...
            return Response(status=status.HTTP_204_NO_CONTENT)
        else:
            # ... return 403 Forbidden ...
            return Response(
                {"detail": "You do not have permission to delete this post."},
                status=status.HTTP_403_FORBIDDEN
            )

# CommentListCreateView (Example allows anonymous comments, less secure)
class CommentListCreateView(generics.ListCreateAPIView):
    serializer_class = CommentSerializer
    authentication_classes = []
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        post_pk = self.kwargs.get('post_pk')
        return Comment.objects.filter(post_id=post_pk).order_by('timestamp')

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context.update({"request": self.request})
        return context

    def perform_create(self, serializer):
        post_pk = self.kwargs.get('post_pk')
        post = get_object_or_404(Post, pk=post_pk)

        # Get Author Info
        author_id_str = self.request.data.get('user_id')
        author_name = self.request.data.get('author_name')
        author_email = self.request.data.get('author_email') # <<< GET EMAIL

        print(f"--- Comment Create [View]: Received user_id='{author_id_str}', name='{author_name}', email='{author_email}'")

        resolved_author_id = None
        resolved_author_name = author_name or "Anonymous" # Default name

        # Resolve Author ID
        if author_id_str:
            try: resolved_author_id = uuid.UUID(author_id_str)
            except (ValueError, TypeError): resolved_author_id = None

        # Resolve Name (optional fallback)
        if not author_name and resolved_author_id:
            try:
                profile = Profile.objects.get(user_id=resolved_author_id)
                resolved_author_name = profile.name or "Anonymous"
            except Profile.DoesNotExist: pass # Keep default name
        if resolved_author_name == "Anonymous" and author_email: resolved_author_name = author_email

        # --- >>> DETAILED LOGGING BEFORE SAVE <<< ---
        print(f"--- Comment Create [View]: Data to be passed to serializer.save:")
        print(f"---                            post: {post.pk}")
        print(f"---                            author_id: {resolved_author_id}")
        print(f"---                            author_name: {resolved_author_name}")
        print(f"---                            author_email: {author_email}") # <<< Value extracted from request
        print(f"---                            content (from validated_data): {serializer.validated_data.get('content')}")
        # --- >>> END LOGGING <<< ---

        try:
            # Save the comment - include author_email
            instance = serializer.save( # Capture the saved instance
                post=post,
                author_id=resolved_author_id,
                author_name=resolved_author_name,
                author_email=author_email # <<< Passing email to save
            )
            # --- >>> LOGGING AFTER SAVE <<< ---
            print(f"--- Comment Create [View]: Comment instance AFTER save:")
            print(f"---                            ID: {instance.pk}")
            print(f"---                            Author ID (in DB): {instance.author_id}")
            print(f"---                            Author Name (in DB): {instance.author_name}")
            print(f"---                            Author Email (in DB): {instance.author_email}") # <<< Check this!
            print(f"---                            Content (in DB): {instance.content}")
            # --- >>> END LOGGING <<< ---

        except Exception as e:
             print(f"--- Comment Create [View]: ERROR during save: {e}")
             # It's helpful to see the serializer errors if validation fails
             if hasattr(serializer, 'errors'):
                 print(f"---                            Serializer Errors: {serializer.errors}")
             raise e 
class PostDetailView(generics.RetrieveDestroyAPIView):
    queryset = Post.objects.all()
    serializer_class = PostSerializer
    lookup_field = 'pk'

    # --- Allow Any Request to reach the view method ---
    authentication_classes = []
    permission_classes = [permissions.AllowAny]

    def get_serializer_context(self): # Keep if serializer needs it
        context = super().get_serializer_context()
        context.update({"request": self.request})
        return context

    # --- Override destroy for manual authorization check ---
    def destroy(self, request, *args, **kwargs):
        instance = self.get_object() # Handles 404 if post not found

        user_id_from_request_str = request.data.get('user_id')

        if not user_id_from_request_str:
            return Response(
                {"detail": "user_id not provided in request body for delete verification."},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            user_id_from_request = uuid.UUID(user_id_from_request_str)
        except ValueError:
            return Response(
                {"detail": "Invalid user_id format provided for delete verification."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # --- Ensure author_id exists on the post model instance ---
        # --- Make sure Post.author_id is a UUIDField in models.py ---
        if not hasattr(instance, 'author_id') or instance.author_id is None:
             print(f"Error: Post {instance.pk} has no author_id to compare for deletion.")
             return Response({"detail": "Cannot verify post ownership."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        print(f"Delete Check: Request User ID = {user_id_from_request}, Post Author ID = {instance.author_id}")

        # --- Compare IDs ---
        if instance.author_id == user_id_from_request:
            print(f"User {user_id_from_request} authorized to delete post {instance.pk}. Deleting...")
            self.perform_destroy(instance)
            return Response(status=status.HTTP_204_NO_CONTENT)
        else:
            print(f"User {user_id_from_request} FORBIDDEN from deleting post {instance.pk} owned by {instance.author_id}.")
            return Response(
                {"detail": "You do not have permission to delete this post."},
                status=status.HTTP_403_FORBIDDEN
            )
        
class CommentMarkDeletedView(APIView):
    """
    Handles marking a comment as deleted instead of actually deleting it.
    Expects a POST request. Requires authentication.
    """
    # --- Apply Authentication ---
    # authentication_classes = [authentication.TokenAuthentication] # Choose your auth method
    authentication_classes = [] # Keep empty for testing ONLY
    permission_classes = [] # Ensure user is logged in AND authorized

    def post(self, request, pk, *args, **kwargs): # Use POST for the action
        comment = get_object_or_404(Comment, pk=pk)

        # --- Double-check permission (though decorator should handle it) ---
        # This check now relies on request.user being populated by authentication
        if not request.user or not request.user.is_authenticated:
             return Response({"detail": "Authentication required."}, status=status.HTTP_401_UNAUTHORIZED)

        is_comment_author = comment.author_id == request.user.id
        is_post_author = comment.post.author_id == request.user.id

        if not (is_comment_author or is_post_author):
            return Response({"detail": "You do not have permission to delete this comment."}, status=status.HTTP_403_FORBIDDEN)

        # --- Mark as deleted ---
        if not comment.is_deleted: # Only mark if not already deleted
            comment.is_deleted = True
            comment.deleted_at = timezone.now()
            comment.deleted_by = 'AUTHOR' if is_comment_author else 'POSTER'
            # Optionally clear content or keep it for moderation?
            # comment.content = "[Comment deleted]" # Option 1: Replace content
            comment.save(update_fields=['is_deleted', 'deleted_at', 'deleted_by']) # Option 2: Keep content, just flag

            print(f"Comment {comment.pk} marked as deleted by {'AUTHOR' if is_comment_author else 'POSTER'} (User: {request.user.id})")

            # Return the updated comment data (or just success status)
            serializer = CommentSerializer(comment, context={'request': request})
            return Response(serializer.data, status=status.HTTP_200_OK)
        else:
            # Already deleted, just return current state
             serializer = CommentSerializer(comment, context={'request': request})
             return Response(serializer.data, status=status.HTTP_200_OK)
class CommentDetailView(generics.DestroyAPIView):
    queryset = Comment.objects.all()
    serializer_class = CommentSerializer # Still technically required by DestroyAPIView
    lookup_field = 'pk' # comment ID

    # --- Keep AllowAny for this insecure method ---
    authentication_classes = []
    permission_classes = [permissions.AllowAny]
    # --- End AllowAny ---

    # --- Override destroy for manual user_id check ---
    def destroy(self, request, *args, **kwargs):
        instance = self.get_object() # Get the Comment instance (handles 404)

        # --- Expect user_id in the request BODY ---
        user_id_from_request_str = request.data.get('user_id')
        user_email_from_request = request.data.get('author_email')  # Get email too if available

        if not user_id_from_request_str:
            return Response(
                {"detail": "user_id not provided in request body for comment delete verification."},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            user_id_from_request = uuid.UUID(user_id_from_request_str)
        except (ValueError, TypeError):
            return Response(
                {"detail": "Invalid user_id format provided for comment delete verification."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # --- First, check using post author and community admin permissions ---
        if hasattr(instance.post, 'author_id') and instance.post.author_id and instance.post.author_id == user_id_from_request:
            print(f"User {user_id_from_request} authorized to delete comment as post author")
            self.perform_destroy(instance)
            return Response(status=status.HTTP_204_NO_CONTENT)
        
        # --- Check if post belongs to community and user is community admin ---
        if (hasattr(instance.post, 'community') and 
            instance.post.community and 
            instance.post.community.creator_id == user_id_from_request_str):
            print(f"User {user_id_from_request} authorized to delete comment as community admin")
            self.perform_destroy(instance)
            return Response(status=status.HTTP_204_NO_CONTENT)

        # --- If author_id is available on the comment, use that ---
        if hasattr(instance, 'author_id') and instance.author_id:
            is_comment_author = instance.author_id == user_id_from_request
            if is_comment_author:
                print(f"User {user_id_from_request} authorized to delete own comment")
                self.perform_destroy(instance)
                return Response(status=status.HTTP_204_NO_CONTENT)
        
        # --- As fallback, use author_email if available ---
        if hasattr(instance, 'author_email') and instance.author_email and user_email_from_request:
            is_same_email = instance.author_email.lower() == user_email_from_request.lower()
            if is_same_email:
                print(f"User authorized to delete comment using matching email")
                self.perform_destroy(instance)
                return Response(status=status.HTTP_204_NO_CONTENT)

        # No permission match found
        print(f"User {user_id_from_request} FORBIDDEN from deleting comment {instance.pk}")
        return Response(
            {"detail": "You do not have permission to delete this comment."},
            status=status.HTTP_403_FORBIDDEN
        )
            
            
#communitites
class CommunityListCreateView(generics.ListCreateAPIView):
    queryset = Community.objects.all()
    serializer_class = CommunitySerializer
    
    def list(self, request, *args, **kwargs):
        try:
            return super().list(request, *args, **kwargs)
        except Exception as e:
            print(f"Error listing communities: {str(e)}")
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def create(self, request, *args, **kwargs):
        try:
            print(f"Received request data: {request.data}")
            serializer = self.get_serializer(data=request.data)
            
            if serializer.is_valid():
                print("Serializer is valid, saving...")
                self.perform_create(serializer)
                headers = self.get_success_headers(serializer.data)
                return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)
            else:
                print(f"Serializer validation errors: {serializer.errors}")
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            import traceback
            print(f"Error creating community: {str(e)}")
            print(traceback.format_exc())
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def perform_create(self, serializer):
        try:
            community = serializer.save()
            # Auto-add creator as a member and admin
            CommunityMember.objects.create(
                community=community,
                user_id=community.creator_id,
                display_name=community.creator_name,
                member_type='admin'
            )
        except Exception as e:
            print(f"Community creation error: {str(e)}")
            raise

class CommunityDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Community.objects.all()
    serializer_class = CommunitySerializer

class CommunityPostsView(generics.ListCreateAPIView):
    serializer_class = PostSerializer
    
    def get_queryset(self):
        community_id = self.kwargs.get('pk')
        return Post.objects.filter(community_id=community_id).order_by('-timestamp')
    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        context.update({"request": self.request})
        return context
    
    def create(self, request, *args, **kwargs):
        try:
            print(f"Received community post create request data: {request.data}")
            
            # Make a mutable copy of the request data
            data = request.data.copy()
            
            # If content is blank but title exists, use title as content
            if (not data.get('content') or data.get('content') == '') and data.get('title'):
                data['content'] = data.get('title')
                print(f"Using title as content: {data['content']}")
            
            serializer = self.get_serializer(data=data)
            
            if serializer.is_valid():
                print("Serializer is valid, saving...")
                self.perform_create(serializer)
                headers = self.get_success_headers(serializer.data)
                return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)
            else:
                print(f"Serializer validation errors: {serializer.errors}")
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            import traceback
            print(f"Error creating community post: {str(e)}")
            print(traceback.format_exc())
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def list(self, request, *args, **kwargs):
        try:
            return super().list(request, *args, **kwargs)
        except Exception as e:
            print(f"Error in CommunityPostsView.list: {str(e)}")
            return Response(
                {"error": "An error occurred while retrieving community posts"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def perform_create(self, serializer):
        community_id = self.kwargs.get('pk')
        try:
            community = Community.objects.get(id=community_id)
            data = self.request.data
            print(f"Creating post for community {community_id}, data: {data}")
            
            # Get user details from request
            author_id_str = data.get('author_id')
            author_name = data.get('author_name', 'Anonymous')
            author_email = data.get('author_email')
            content = data.get('content', '')
            title = data.get('title', '')  # Get the title from the request
            
            # Convert author_id to UUID if provided
            author_id = NIL_UUID  # Default to NIL_UUID instead of None
            if author_id_str:
                try:
                    author_id = uuid.UUID(author_id_str)
                    print(f"Valid author_id: {author_id}")
                except (ValueError, TypeError):
                    print(f"Invalid author_id format, using default: {author_id}")
        
            # Save with all necessary fields including title
            serializer.save(
                community=community,
                author_id=author_id,
                author_name=author_name,
                author_email=author_email,
                content=content,
                title=title  # Add title to the save method
            )
            print(f"Post created successfully for community {community_id} with title: {title}")
        except Community.DoesNotExist:
            print(f"Community {community_id} does not exist")
            raise
        except Exception as e:
            print(f"Error creating community post: {str(e)}")
            raise

class CommunityMembershipView(APIView):
    def get(self, request, pk):
        community_id = pk
        user_id = request.query_params.get('user_id')
        
        if not user_id:
            return Response(
                {"error": "user_id parameter is required"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
            
        try:
            # Check if user is a member of the community
            member = CommunityMember.objects.filter(
                community_id=community_id,
                user_id=user_id
            ).first()
            
            if member:
                return Response({
                    "is_member": True,
                    "member_type": member.member_type,
                    "joined_at": member.joined_at
                })
            else:
                return Response({"is_member": False})
                
        except Exception as e:
            print(f"Error checking membership: {str(e)}")
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def post(self, request, pk):
        """Join or leave a community"""
        try:
            community = Community.objects.get(pk=pk)
        except Community.DoesNotExist:
            return Response({"error": "Community not found"}, status=status.HTTP_404_NOT_FOUND)
            
        user_id = request.data.get('user_id')
        user_name = request.data.get('user_name')
        action = request.data.get('action', 'join')  # 'join' or 'leave'
        
        if not user_id or not user_name:
            return Response({"error": "user_id and user_name are required"}, 
                           status=status.HTTP_400_BAD_REQUEST)
        
        # Handle join/leave logic
        if action == 'join':
            # Check if already a member
            if not CommunityMember.objects.filter(community=community, user_id=user_id).exists():
                CommunityMember.objects.create(
                    community=community,
                    user_id=user_id,
                    display_name=user_name  # Changed from user_name to display_name
                )
                community.member_count += 1
                community.save()
            return Response({"status": "joined", "member_count": community.member_count})
        elif action == 'leave':
            # Cannot leave if you're the creator
            if user_id == community.creator_id:
                return Response({"error": "Community creator cannot leave"}, 
                               status=status.HTTP_400_BAD_REQUEST)
                               
            membership = CommunityMember.objects.filter(community=community, user_id=user_id)
            if membership.exists():
                membership.delete()
                community.member_count = max(1, community.member_count - 1)  # Never below 1
                community.save()
            return Response({"status": "left", "member_count": community.member_count})
        else:
            return Response({"error": "Invalid action"}, status=status.HTTP_400_BAD_REQUEST)

class IsAuthorOrCommunityAdmin(permissions.BasePermission):
    """
    Custom permission to only allow authors or community admins to delete posts
    """
    def has_object_permission(self, request, view, obj):
        # Read permissions are allowed to any request
        if request.method in permissions.SAFE_METHODS:
            return True
            
        # Only allow delete if user is post author or community admin
        if request.method == 'DELETE':
            # Check if user is post author
            if obj.author_id == request.user.id:
                return True
                
            # Check if user is community admin
            if obj.community and obj.community.creator_id == request.user.id:
                return True
                
        return False
    
class JoinRequestViewSet(viewsets.ModelViewSet):
    serializer_class = JoinRequestSerializer
    
    def get_queryset(self):
        # Filter requests by community if specified
        community_id = self.request.query_params.get('community', None)
        if (community_id):
            return JoinRequest.objects.filter(community_id=community_id)
        return JoinRequest.objects.all()

    def create(self, request, *args, **kwargs):
        # Check if user already has a pending request
        existing = JoinRequest.objects.filter(
            community_id=request.data.get('community'),
            user_id=request.data.get('user_id'),
            status=JoinRequestStatus.PENDING
        )
        
        if existing:
            return Response(
                {"message": "You already have a pending join request"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
            
        return super().create(request, *args, **kwargs)
    
    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        join_request = self.get_object()
        
        # Check if user is community admin
        community = join_request.community
        if community.creator_id != request.data.get('admin_id'):
            return Response(
                {"message": "Only community administrators can approve requests"}, 
                status=status.HTTP_403_FORBIDDEN
            )
            
        # Update request status
        join_request.status = JoinRequestStatus.APPROVED
        join_request.save()
        
        # Create community membership
        CommunityMember.objects.create(
            community=community,
            user_id=join_request.user_id,
            display_name=join_request.user_name
        )
        
        # Update community member count
        join_request.community.member_count += 1
        join_request.community.save()
        
        return Response({"message": "Join request approved", "status": "approved"})
    
    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        join_request = self.get_object()
        
        # Check if user is community admin
        community = join_request.community
        if community.creator_id != request.data.get('admin_id'):
            return Response(
                {"message": "Only community administrators can reject requests"}, 
                status=status.HTTP_403_FORBIDDEN
            )
            
        # Update request status
        join_request.status = JoinRequestStatus.REJECTED
        join_request.save()
        
        return Response({"message": "Join request rejected", "status": "rejected"})