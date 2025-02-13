from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

# Explicitly import views
from rest_framework_simplejwt.views import (
    TokenObtainPairView, 
    TokenRefreshView
)
from drf_spectacular.views import (
    SpectacularAPIView, 
    SpectacularSwaggerView
)

urlpatterns = [
    # Admin
    path('admin/', admin.site.urls),

    # Authentication
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    # API Documentation
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),

    # API Routes
    path('api/users/', include('users.urls')),
    path('api/courses/', include('courses.urls')),
    path('api/assessment/', include('assessment.urls')),
    path('api/core/', include('core.urls')),
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
