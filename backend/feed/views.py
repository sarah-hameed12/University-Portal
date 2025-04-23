# feed/views.py
from rest_framework import generics, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import Post, Comment, Like
from .serializers import PostSerializer, CommentSerializer
# from profiles.models import Profile # Needed if serializers fetch profile info
import uuid # <<<--- Add import
from profiles.models import Profile
from django.utils import timezone 
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
    queryset = Post.objects.all()
    serializer_class = PostSerializer
    authentication_classes = []
    permission_classes = [permissions.AllowAny]

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

        # --- Ensure author_id exists on the comment ---
        if not hasattr(instance, 'author_id') or instance.author_id is None:
             print(f"Error: Comment {instance.pk} has no author_id to compare for deletion.")
             # Use 403 Forbidden here maybe? Or 500 if it's unexpected data inconsistency.
             return Response({"detail": "Cannot verify comment ownership (missing author)."}, status=status.HTTP_403_FORBIDDEN)

        # --- Ensure post author_id exists (needed for the check) ---
        if not hasattr(instance.post, 'author_id') or instance.post.author_id is None:
            print(f"Error: Post {instance.post.pk} linked to comment {instance.pk} has no author_id.")
            return Response({"detail": "Cannot verify post ownership for comment deletion."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


        print(f"Comment Delete Check: Request User ID = {user_id_from_request}, Comment Author ID = {instance.author_id}, Post Author ID = {instance.post.author_id}")

        # --- Perform the ownership check ---
        is_comment_author = instance.author_id == user_id_from_request
        is_post_author = instance.post.author_id == user_id_from_request

        if is_comment_author or is_post_author:
            print(f"User {user_id_from_request} authorized to delete comment {instance.pk}. Deleting...")
            self.perform_destroy(instance) # Call the standard DRF deletion logic
            return Response(status=status.HTTP_204_NO_CONTENT)
        else:
            print(f"User {user_id_from_request} FORBIDDEN from deleting comment {instance.pk}.")
            return Response(
                {"detail": "You do not have permission to delete this comment."},
                status=status.HTTP_403_FORBIDDEN
            )