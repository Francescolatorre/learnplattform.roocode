from django.urls import path
from . import views

urlpatterns = [
    path('api/', views.api_endpoint, name='api_endpoint'),
]
