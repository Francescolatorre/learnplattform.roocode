from django.contrib import admin
from django.urls import path, include
from rest_framework import permissions
from drf_yasg.views import get_schema_view
from drf_yasg import openapi
from rest_framework_simplejwt.views import TokenRefreshView
from .views import CustomTokenObtainPairView, LearningTaskViewSet

from rest_framework.routers import DefaultRouter

from core.views import CourseViewSet
from django.conf import settings
from django.conf.urls.static import static

router = DefaultRouter()
router.register(r"courses", CourseViewSet, basename="course")
router.register(r"learning-tasks", LearningTaskViewSet, basename="learning-task")

schema_view = get_schema_view(
    openapi.Info(
        title="API Documentation",
        default_version="v1",
        description="API documentation for the backend",
    ),
    public=True,
    permission_classes=(permissions.AllowAny,),
    authentication_classes=[],  # Explicitly disable session authentication
)

urlpatterns = [
    path("admin/", admin.site.urls),
    path(
        "swagger/",
        schema_view.with_ui("swagger", cache_timeout=0),
        name="schema-swagger-ui",
    ),
    path("openapi.json", schema_view.without_ui(cache_timeout=0), name="schema-json"),
    path(
        "api/v1/auth/token/",
        CustomTokenObtainPairView.as_view(),
        name="token_obtain_pair",
    ),
    path(
        "api/v1/auth/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"
    ),
    path("api/v1/", include(router.urls)),
    path("api/v1/", include("learning_tasks.urls")),
]

if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
