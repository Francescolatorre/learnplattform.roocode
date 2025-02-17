"""
Comprehensive test suite for authentication API endpoints.
"""
import pytest
from django.urls import reverse
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken
from datetime import timedelta
from django.utils import timezone
from django.core import mail

User = get_user_model()

@pytest.mark.django_db
class TestAuthenticationAPI:
    """Test suite for authentication endpoints."""

    def setup_method(self):
        """Set up test environment before each test method."""
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='testuser',
            email='testuser@example.com',
            password='testpassword123',
            is_active=True,
            role='user'
        )
        self.lead_instructor = User.objects.create_user(
            username='lead_instructor',
            email='lead@example.com',
            password='testpassword123',
            is_active=True,
            role='instructor'
        )
        self.admin_user = User.objects.create_user(
            username='admin',
            email='admin@example.com',
            password='testpassword123',
            is_active=True,
            role='admin'
        )
        self.inactive_user = User.objects.create_user(
            username='inactiveuser',
            email='inactive@example.com',
            password='testpassword123',
            is_active=False,
            role='user'
        )

    def test_user_registration_success(self):
        """Test successful user registration with valid data and role."""
        registration_data = {
            'username': 'newuser',
            'email': 'newuser@example.com',
            'password': 'NewPass123!',
            'password2': 'NewPass123!',
            'display_name': 'New User',
            'role': 'user'
        }
        
        response = self.client.post('/api/v1/auth/register/', registration_data)
        
        assert response.status_code == 201
        assert 'user' in response.data
        assert response.data['user']['username'] == 'newuser'
        assert 'role' in response.data['user']
        assert response.data['user']['role'] == 'user'
        assert 'access' in response.data
        assert 'refresh' in response.data

        
        # Verify user was created with correct role
        user = User.objects.get(username='newuser')
        assert user.email == 'newuser@example.com'
        assert user.display_name == 'New User'
        assert user.role == 'user'

    def test_user_registration_validation(self):
        """Test registration validation for required fields, constraints, and role."""
        # Test missing required fields
        response = self.client.post('/api/v1/auth/register/', {})
        assert response.status_code == 400
        assert 'username' in response.data
        assert 'email' in response.data
        assert 'password' in response.data
        
        # Test password mismatch
        data = {
            'username': 'newuser',
            'email': 'new@example.com',
            'password': 'Pass123!',
            'password2': 'DifferentPass123!',
            'role': 'user'
        }
        response = self.client.post('/api/v1/auth/register/', data)
        assert response.status_code == 400
        assert 'password' in response.data
        
        # Test duplicate username
        data = {
            'username': 'testuser',  # Existing username
            'email': 'new@example.com',
            'password': 'Pass123!',
            'password2': 'Pass123!',
            'role': 'instructor'
        }
        response = self.client.post('/api/v1/auth/register/', data)
        assert response.status_code == 400
        assert 'username' in response.data

        # Test invalid role
        data = {
            'username': 'roletest',
            'email': 'roletest@example.com',
            'password': 'Pass123!',
            'password2': 'Pass123!',
            'role': 'invalid_role'
        }
        response = self.client.post('/api/v1/auth/register/', data)
        assert response.status_code == 400
        assert 'role' in response.data

    def test_user_login_success(self):
        """Test successful login with username, email, and role verification."""
        test_users = [
            {
                'username_or_email': 'lead_instructor', 
                'password': 'testpassword123',
                'expected_role': 'instructor'
            },
            {
                'username_or_email': 'admin', 
                'password': 'testpassword123',
                'expected_role': 'admin'
            },
            {
                'username_or_email': 'testuser', 
                'password': 'testpassword123',
                'expected_role': 'user'
            }
        ]

        for user_data in test_users:
            # Login with username or email
            login_data = {
                'username_or_email': user_data['username_or_email'],
                'password': user_data['password']
            }
            response = self.client.post('/api/v1/auth/login/', login_data)
            
            assert response.status_code == 200
            assert 'access' in response.data
            assert 'refresh' in response.data
            assert 'user' in response.data
            
            # Verify user role
            assert 'role' in response.data['user'], f"Role missing for {user_data['username_or_email']}"
            assert response.data['user']['role'] == user_data['expected_role'], \
                f"Role mismatch for {user_data['username_or_email']}"

    def test_user_login_failure(self):
        """Test login failures with invalid credentials."""
        # Test invalid password
        login_data = {
            'username_or_email': 'testuser',
            'password': 'wrongpassword'
        }
        response = self.client.post('/api/v1/auth/login/', login_data)
        assert response.status_code == 401
        
        # Test non-existent user
        login_data = {
            'username_or_email': 'nonexistent',
            'password': 'testpassword123'
        }
        response = self.client.post('/api/v1/auth/login/', login_data)
        assert response.status_code == 401
        
        # Test inactive user
        login_data = {
            'username_or_email': 'inactiveuser',
            'password': 'testpassword123'
        }
        response = self.client.post('/api/v1/auth/login/', login_data)
        assert response.status_code == 401

    def test_user_logout(self):
        """Test user logout and token blacklisting."""
        # Get refresh token
        refresh = RefreshToken.for_user(self.user)
        
        # Test successful logout
        response = self.client.post(
            '/api/v1/auth/logout/',
            {'refresh_token': str(refresh)}
        )
        assert response.status_code == 205
        
        # Test logout with invalid token
        response = self.client.post(
            '/api/v1/auth/logout/',
            {'refresh_token': 'invalid-token'}
        )
        assert response.status_code == 400
        
        # Test logout without token
        response = self.client.post('/api/v1/auth/logout/', {})
        assert response.status_code == 400

    def test_password_reset_request(self):
        """Test password reset request process."""
        # Test with valid email
        response = self.client.post(
            '/api/v1/auth/password-reset/',
            {'email': 'testuser@example.com'}
        )
        assert response.status_code == 200
        assert len(mail.outbox) > 0  # Verify email would be sent
        
        # Test with invalid email
        response = self.client.post(
            '/api/v1/auth/password-reset/',
            {'email': 'nonexistent@example.com'}
        )
        assert response.status_code == 400

    def test_user_profile(self):
        """Test user profile retrieval and updates with role verification."""
        # Authenticate user
        self.client.force_authenticate(user=self.user)
        
        # Test profile retrieval
        response = self.client.get('/api/v1/auth/profile/')
        assert response.status_code == 200
        assert response.data['username'] == 'testuser'
        assert response.data['email'] == 'testuser@example.com'
        assert response.data['role'] == 'user'  # Verify role in profile
        
        # Test profile update
        update_data = {
            'display_name': 'Updated Name'
        }
        response = self.client.patch('/api/v1/auth/profile/', update_data)
        assert response.status_code == 200
        assert response.data['display_name'] == 'Updated Name'
        assert response.data['role'] == 'user'  # Ensure role remains unchanged
        
        # Verify read-only fields can't be updated
        update_data = {
            'username': 'newusername',
            'email': 'newemail@example.com',
            'role': 'admin'  # Attempt to change role
        }
        response = self.client.patch('/api/v1/auth/profile/', update_data)
        assert response.status_code == 200
        assert response.data['username'] == 'testuser'  # Unchanged
        assert response.data['email'] == 'testuser@example.com'  # Unchanged
        assert response.data['role'] == 'user'  # Role remains unchanged

    def test_token_refresh(self):
        """Test JWT token refresh functionality."""
        # Get initial tokens
        refresh = RefreshToken.for_user(self.user)
        
        # Test successful token refresh
        response = self.client.post(
            '/api/v1/auth/token/refresh/',
            {'refresh': str(refresh)}
        )
        assert response.status_code == 200
        assert 'access' in response.data
        
        # Test with invalid refresh token
        response = self.client.post(
            '/api/v1/auth/token/refresh/',
            {'refresh': 'invalid-token'}
        )
        assert response.status_code == 401

    def test_authentication_required(self):
        """Test authentication requirements for protected endpoints."""
        # Test without authentication
        response = self.client.get('/api/v1/auth/profile/')
        assert response.status_code == 401
        
        # Test with invalid token
        self.client.credentials(HTTP_AUTHORIZATION='Bearer invalid-token')
        response = self.client.get('/api/v1/auth/profile/')
        assert response.status_code == 401
        
        # Test with valid token
        refresh = RefreshToken.for_user(self.user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}')
        response = self.client.get('/api/v1/auth/profile/')
        assert response.status_code == 200
        assert 'role' in response.data  # Verify role is included in authenticated response
