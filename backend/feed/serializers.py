from rest_framework import serializers
from .models import Post

class PostSerializer(serializers.ModelSerializer):
    class Meta:
        model = Post
        # List the fields you want to include in the API response
        fields = ['id', 'author_name', 'content', 'image_url', 'timestamp']