from django.contrib import admin
from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import CourseViewSet, SchemaView, SwaggerView

router = DefaultRouter()
router.register(r"courses", CourseViewSet)

urlpatterns = [
    path("admin/", admin.site.urls),
    path("", include(router.urls)),
    path("tasks/", include("tasks.urls")),
    path("users/", include("users.urls")),
    path("assessment/", include("assessment.urls")),
    path("core/", include("core.urls")),
    path("learning/", include("learning.urls")),
    path("api/schema/", SchemaView.as_view(), name="schema"),
    path("api/swagger/", SwaggerView.as_view(), name="swagger-ui"),
]
