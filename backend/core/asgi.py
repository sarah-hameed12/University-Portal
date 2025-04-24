"""
ASGI config for core project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/5.2/howto/deployment/asgi/
"""

import os
import django

# Set up Django settings first
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()  # Initialize Django before importing other modules

# Then import the rest
from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
import feed.routing  # Import routing after Django setup

application = ProtocolTypeRouter({
    "http": get_asgi_application(),
    "websocket": AuthMiddlewareStack(
        URLRouter(
            feed.routing.websocket_urlpatterns
        )
    ),
})
