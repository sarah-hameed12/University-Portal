from django.urls import path
from .views import PostListView

urlpatterns = [
    # Map the URL 'posts/' to the PostListView
    path('posts/', PostListView.as_view(), name='post-list'),
    # Add more URLs later for creating, updating, deleting posts
]