from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status
from django.urls import reverse
from rest_framework_simplejwt.tokens import RefreshToken

User = get_user_model()

class UserAuthenticationTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        
        # Create a test user
        self.user_data = {
            'username': 'testuser',
            'email': 'testuser@example.com',
            'password': 'testpassword123'
        }
        self.user = User.objects.create_user(
            username=self.user_data['username'], 
            email=self.user_data['email'], 
            password=self.user_data['password']
        )

    def test_user_registration(self):
        """
        Test user registration with valid data
        """
        new_user_data = {
            'username': 'newuser',
            'email': 'newuser@example.com',
            'password': 'newpassword123',
            'password2': 'newpassword123',
            'role': 'user'
        }
        response = self.client.post(reverse('user-register'), new_user_data)
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)
        self.assertEqual(response.data['user']['username'], new_user_data['username'])

    def test_user_registration_password_mismatch(self):
        """
        Test user registration with mismatched passwords
        """
        invalid_user_data = {
            'username': 'baduser',
            'email': 'baduser@example.com',
            'password': 'password123',
            'password2': 'differentpassword',
            'role': 'user'
        }
        response = self.client.post(reverse('user-register'), invalid_user_data)
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_user_login(self):
        """
        Test user login with valid credentials
        """
        login_data = {
            'username_or_email': self.user_data['username'],
            'password': self.user_data['password']
        }
        response = self.client.post(reverse('user-login'), login_data)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)
        self.assertEqual(response.data['user']['username'], self.user_data['username'])

    def test_user_login_with_email(self):
        """
        Test user login using email
        """
        login_data = {
            'username_or_email': self.user_data['email'],
            'password': self.user_data['password']
        }
        response = self.client.post(reverse('user-login'), login_data)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)
        self.assertEqual(response.data['user']['username'], self.user_data['username'])

    def test_user_login_invalid_credentials(self):
        """
        Test user login with invalid credentials
        """
        login_data = {
            'username_or_email': self.user_data['username'],
            'password': 'wrongpassword'
        }
        response = self.client.post(reverse('user-login'), login_data)
        
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_user_logout(self):
        """
        Test user logout
        """
        # First, log in to get a refresh token
        login_data = {
            'username_or_email': self.user_data['username'],
            'password': self.user_data['password']
        }
        login_response = self.client.post(reverse('user-login'), login_data)
        
        # Then logout
        logout_data = {
            'refresh_token': login_response.data['refresh']
        }
        logout_response = self.client.post(reverse('user-logout'), logout_data)
        
        self.assertEqual(logout_response.status_code, status.HTTP_205_RESET_CONTENT)
