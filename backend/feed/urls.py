# feed/urls.py
from django.urls import path
from .views import (
    PostListView,
    PostDetailView,         # Import new view
    PostLikeToggleView,     # Import new view
    CommentListCreateView , 
    CommentDetailView # Import new view
)

urlpatterns = [
    path('posts/', PostListView.as_view(), name='post-list-create'),
    # Detail view for GET/DELETE specific post
    path('posts/<uuid:pk>/', PostDetailView.as_view(), name='post-detail-delete'),
    # Like/Unlike toggle view
    path('posts/<uuid:pk>/like/', PostLikeToggleView.as_view(), name='post-like-toggle'),
    # Comments for a specific post (List/Create)
    path('posts/<uuid:post_pk>/comments/', CommentListCreateView.as_view(), name='comment-list-create'),
    path('comments/<uuid:pk>/', CommentDetailView.as_view(), name='comment-detail-delete'),
]