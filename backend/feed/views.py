from django.shortcuts import render

# Create your views here.

from rest_framework import generics
from .models import Post
from .serializers import PostSerializer

# Using a generic view for simplicity to list all posts
# from .serializers import PostSerializer

# --- इंश्योर this says ListCreateAPIView ---
class PostListView(generics.ListCreateAPIView):
# --- इंश्योर this says ListCreateAPIView ---
    queryset = Post.objects.all()
    serializer_class = PostSerializer
