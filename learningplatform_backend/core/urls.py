from django.urls import path
from rest_framework.routers import DefaultRouter

from .views import LearningTaskViewSet, TaskProgressViewSet

router = DefaultRouter()
router.register(r"learning-tasks", LearningTaskViewSet, basename="learningtask")
router.register(r"task-progress", TaskProgressViewSet, basename="taskprogress")

urlpatterns = router.urls
