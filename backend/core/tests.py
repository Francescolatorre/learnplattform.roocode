import pytest
from rest_framework.test import APIClient
from django.urls import reverse

@pytest.mark.django_db
def test_health_check_endpoint():
    """Test the health check endpoint"""
    client = APIClient()
    url = reverse('health_check')
    
    response = client.get(url)
    
    assert response.status_code == 200
    assert 'status' in response.data
    assert response.data['status'] == 'healthy'
