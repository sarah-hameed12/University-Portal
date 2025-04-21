from django.urls import path
from .views import UserProfileViewByEmail # Make sure view name matches

urlpatterns = [
    # Use an empty path '' because the project URL includes /api/profile/
    # This view now expects email as a query parameter
    path('', UserProfileViewByEmail.as_view(), name='user-profile-by-email'),
]