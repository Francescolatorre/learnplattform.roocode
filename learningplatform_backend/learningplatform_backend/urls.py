"""
URL configuration for learningplatform_backend project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""

from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from core import views

# API router
router = DefaultRouter()
router.register(r'users', views.UserViewSet)
router.register(r'courses', views.CourseViewSet)
router.register(r'course-versions', views.CourseVersionViewSet)
router.register(r'learning-tasks', views.LearningTaskViewSet)
router.register(r'quiz-tasks', views.QuizTaskViewSet)
router.register(r'quiz-questions', views.QuizQuestionViewSet)
router.register(r'quiz-options', views.QuizOptionViewSet)

# JWT auth URLs
auth_urls = [
    path('login/', views.CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('register/', views.RegisterView.as_view(), name='register'),
    path('logout/', views.LogoutView.as_view(), name='logout'),
]

urlpatterns = [
    path("admin/", admin.site.urls),
    path('api/v1/', include(router.urls)),
    path('auth/', include(auth_urls)),
    path('api-auth/', include('rest_framework.urls')),  # DRF browsable API login
    path('health/', views.health_check, name='health_check'),
]