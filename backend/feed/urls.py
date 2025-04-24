# feed/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    PostListView,
    PostDetailView,         # Import new view
    PostLikeToggleView,     # Import new view
    CommentListCreateView , 
    CommentDetailView,
    CommentMarkDeletedView , # Import new view
    CommunityListCreateView, 
    CommunityDetailView, 
    CommunityPostsView, 
    CommunityMembershipView, 
    JoinRequestViewSet,
    VoiceChannelListView,    # Import new view
    VoiceChannelDetailView,  # Import new view
    VoiceChannelParticipantView,  # Import new view
    VoiceChannelParticipantDetailView  # Import new view
)

# Create a router and register the viewset
router = DefaultRouter()
router.register(r'join-requests', JoinRequestViewSet, basename='join-request')

urlpatterns = [
    path('posts/', PostListView.as_view(), name='post-list-create'),
    # Detail view for GET/DELETE specific post
    path('posts/<uuid:pk>/', PostDetailView.as_view(), name='post-detail-delete'),
    # Like/Unlike toggle view
    path('posts/<uuid:pk>/like/', PostLikeToggleView.as_view(), name='post-like-toggle'),
    # Comments for a specific post (List/Create)
    path('posts/<uuid:post_pk>/comments/', CommentListCreateView.as_view(), name='comment-list-create'),
    path('comments/<uuid:pk>/', CommentDetailView.as_view(), name='comment-detail-delete'),
    path('comments/<uuid:pk>/mark-deleted/', CommentMarkDeletedView.as_view(), name='comment-mark-deleted'),
    path('communities/', CommunityListCreateView.as_view(), name='community-list-create'),
    path('communities/<uuid:pk>/', CommunityDetailView.as_view(), name='community-detail'),
    path('communities/<uuid:pk>/posts/', CommunityPostsView.as_view(), name='community-posts'),
    path('communities/<uuid:pk>/membership/', CommunityMembershipView.as_view(), name='community-membership'),
    # Add these to urlpatterns
    path('communities/<uuid:community_pk>/voice-channels/', VoiceChannelListView.as_view(), name='voice-channel-list'),
    path('voice-channels/<uuid:pk>/', VoiceChannelDetailView.as_view(), name='voice-channel-detail'),
    path('voice-channels/<uuid:channel_pk>/participants/', VoiceChannelParticipantView.as_view(), name='voice-channel-participants'),
    path('voice-channels/<uuid:channel_pk>/participants/<str:user_id>/', VoiceChannelParticipantDetailView.as_view(), name='voice-channel-participant-detail'),
    # Add this to include the router URLs
    path('', include(router.urls)),
]