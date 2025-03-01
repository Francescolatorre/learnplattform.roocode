import pytest
from django.contrib.auth import get_user_model
from django.core import mail
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken

User = get_user_model()


@pytest.mark.django_db
class TestAuthenticationAPI:
    """Test suite for authentication endpoints."""

    def setup_method(self):
        """Set up test environment before each test method."""
        self.client = APIClient()
        self.user = User.objects.create_user(
            username="testuser",
            email="testuser@example.com",
            password="testpassword123",
            is_active=True,
            role="user",
        )
        self.lead_instructor = User.objects.create_user(
            username="lead_instructor",
            email="lead@example.com",
            password="testpassword123",
            is_active=True,
            role="instructor",
        )
        self.admin_user = User.objects.create_user(
            username="admin",
            email="admin@example.com",
            password="testpassword123",
            is_active=True,
            role="admin",
        )
        self.inactive_user = User.objects.create_user(
            username="inactiveuser",
            email="inactive@example.com",
            password="testpassword123",
            is_active=False,
            role="user",
        )

    def test_user_registration_success(self):
        """Test successful user registration with valid data and role."""
        registration_data = {
            "username": "newuser",
            "email": "newuser@example.com",
            "password": "NewPass123!",
            "password2": "NewPass123!",
            "display_name": "New User",
            "role": "user",
        }

        response = self.client.post("/users/register/", registration_data)

        assert (
            response.status_code == 201
        ), "Expected HTTP 201 for successful registration"
        assert "user" in response.data, "User data not returned in response"
        assert (
            response.data["user"]["username"] == "newuser"
        ), "Incorrect username in response"
        assert "role" in response.data["user"], "Role not returned in user data"
        assert response.data["user"]["role"] == "user", "Incorrect role in response"
        assert "access" in response.data, "Access token not returned"
        assert "refresh" in response.data, "Refresh token not returned"

        # Verify user was created with correct role
        user = User.objects.get(username="newuser")
        assert (
            user.email == "newuser@example.com"
        ), "Email not correctly set in user model"
        assert (
            user.display_name == "New User"
        ), "Display name not correctly set in user model"
        assert user.role == "user", "Role not correctly set in user model"

    def test_registration_missing_fields(self):
        """Test registration fails when required fields are missing."""
        response = self.client.post("/users/register/", {})
        assert response.status_code == 400, "Expected HTTP 400 for missing fields"
        assert (
            "username" in response.data
        ), "Missing 'username' field error not returned"
        assert "email" in response.data, "Missing 'email' field error not returned"
        assert (
            "password" in response.data
        ), "Missing 'password' field error not returned"

    def test_registration_password_mismatch(self):
        """Test registration fails when passwords do not match."""
        data = {
            "username": "newuser",
            "email": "new@example.com",
            "password": "Pass123!",
            "password2": "DifferentPass123!",
            "role": "user",
        }
        response = self.client.post("/users/register/", data)
        assert response.status_code == 400, "Expected HTTP 400 for password mismatch"
        assert "password" in response.data, "Password mismatch error not returned"

    def test_registration_duplicate_username(self):
        """Test registration fails when username already exists."""
        data = {
            "username": "testuser",  # Existing username
            "email": "new@example.com",
            "password": "Pass123!",
            "password2": "Pass123!",
            "role": "instructor",
        }
        response = self.client.post("/users/register/", data)
        assert response.status_code == 400, "Expected HTTP 400 for duplicate username"
        assert "username" in response.data, "Duplicate username error not returned"

    def test_registration_invalid_role(self):
        """Test registration fails when role is invalid."""
        data = {
            "username": "roletest",
            "email": "roletest@example.com",
            "password": "Pass123!",
            "password2": "Pass123!",
            "role": "invalid_role",
        }
        response = self.client.post("/users/register/", data)
        assert response.status_code == 400, "Expected HTTP 400 for invalid role"
        assert "role" in response.data, "Invalid role error not returned"

    def test_user_login_success(self):
        """Test successful login with username, email, and role verification."""
        test_users = [
            {
                "username_or_email": "lead_instructor",
                "password": "testpassword123",
                "expected_role": "instructor",
            },
            {
                "username_or_email": "admin",
                "password": "testpassword123",
                "expected_role": "admin",
            },
            {
                "username_or_email": "testuser",
                "password": "testpassword123",
                "expected_role": "user",
            },
        ]

        for user_data in test_users:
            # Login with username or email
            login_data = {
                "username_or_email": user_data["username_or_email"],
                "password": user_data["password"],
            }
            response = self.client.post("/users/login/", login_data)

            assert response.status_code == 200, "Expected HTTP 200 for successful login"
            assert "access" in response.data, "Access token not returned"
            assert "refresh" in response.data, "Refresh token not returned"
            assert "user" in response.data, "User data not returned in response"

            # Verify user role
            assert (
                "role" in response.data["user"]
            ), f"Role missing for {user_data['username_or_email']}"
            assert (
                response.data["user"]["role"] == user_data["expected_role"]
            ), f"Role mismatch for {user_data['username_or_email']}"

    def test_user_login_failure(self):
        """Test login failures with invalid credentials."""
        # Test invalid password
        login_data = {"username_or_email": "testuser", "password": "wrongpassword"}
        response = self.client.post("/users/login/", login_data)
        assert response.status_code == 401, "Expected HTTP 401 for invalid password"

        # Test non-existent user
        login_data = {"username_or_email": "nonexistent", "password": "testpassword123"}
        response = self.client.post("/users/login/", login_data)
        assert response.status_code == 401, "Expected HTTP 401 for non-existent user"

        # Test inactive user
        login_data = {
            "username_or_email": "inactiveuser",
            "password": "testpassword123",
        }
        response = self.client.post("/users/login/", login_data)
        assert response.status_code == 401, "Expected HTTP 401 for inactive user"

    def test_user_logout(self):
        """Test user logout and token blacklisting."""
        # Get refresh token
        refresh = RefreshToken.for_user(self.user)

        # Test successful logout
        response = self.client.post("/users/logout/", {"refresh_token": str(refresh)})
        assert response.status_code == 205, "Expected HTTP 205 for successful logout"

        # Test logout with invalid token
        response = self.client.post(
            "/users/logout/", {"refresh_token": "invalid-token"}
        )
        assert response.status_code == 400, "Expected HTTP 400 for invalid token"

        # Test logout without token
        response = self.client.post("/users/logout/", {})
        assert response.status_code == 400, "Expected HTTP 400 for logout without token"

    def test_password_reset_request(self):
        """Test password reset request process."""
        # Test with valid email
        response = self.client.post(
            "/users/password-reset/", {"email": "testuser@example.com"}
        )
        assert (
            response.status_code == 200
        ), "Expected HTTP 200 for valid email password reset"
        assert len(mail.outbox) > 0, "Email not sent for valid password reset request"

        # Test with invalid email
        response = self.client.post(
            "/users/password-reset/", {"email": "nonexistent@example.com"}
        )
        assert (
            response.status_code == 400
        ), "Expected HTTP 400 for invalid email password reset"

    def test_user_profile(self):
        """Test user profile retrieval and updates with role verification."""
        # Authenticate user
        self.client.force_authenticate(user=self.user)

        # Test profile retrieval
        response = self.client.get("/users/profile/")
        assert response.status_code == 200, "Expected HTTP 200 for profile retrieval"
        assert (
            response.data["username"] == "testuser"
        ), "Username not returned in profile data"
        assert (
            response.data["email"] == "testuser@example.com"
        ), "Email not returned in profile data"
        assert response.data["role"] == "user", "Role not returned in profile data"

        # Test profile update
        update_data = {"display_name": "Updated Name"}
        response = self.client.patch("/users/profile/", update_data)
        assert response.status_code == 200, "Expected HTTP 200 for profile update"
        assert (
            response.data["display_name"] == "Updated Name"
        ), "Display name not updated in profile data"
        assert (
            response.data["role"] == "user"
        ), "Role changed unexpectedly in profile data"

        # Verify read-only fields can't be updated
        update_data = {
            "username": "newusername",
            "email": "newemail@example.com",
            "role": "admin",  # Attempt to change role
        }
        response = self.client.patch("/users/profile/", update_data)
        assert (
            response.status_code == 200
        ), "Expected HTTP 200 for profile update attempt with read-only fields"
        assert (
            response.data["username"] == "testuser"
        ), "Username changed unexpectedly in profile data"
        assert (
            response.data["email"] == "testuser@example.com"
        ), "Email changed unexpectedly in profile data"
        assert (
            response.data["role"] == "user"
        ), "Role changed unexpectedly in profile data"

    def test_token_refresh(self):
        """Test JWT token refresh functionality."""
        # Get initial tokens
        refresh = RefreshToken.for_user(self.user)

        # Test successful token refresh
        response = self.client.post("/users/token/refresh/", {"refresh": str(refresh)})
        assert (
            response.status_code == 200
        ), "Expected HTTP 200 for successful token refresh"
        assert (
            "access" in response.data
        ), "Access token not returned in token refresh response"

        # Test with invalid refresh token
        response = self.client.post(
            "/users/token/refresh/", {"refresh": "invalid-token"}
        )
        assert (
            response.status_code == 401
        ), "Expected HTTP 401 for invalid token token refresh"

    def test_authentication_required(self):
        """Test authentication requirements for protected endpoints."""
        # Test without authentication
        response = self.client.get("/users/profile/")
        assert (
            response.status_code == 401
        ), "Expected HTTP 401 for unauthenticated profile access"

        # Test with invalid token
        self.client.credentials(HTTP_AUTHORIZATION="Bearer invalid-token")
        response = self.client.get("/users/profile/")
        assert (
            response.status_code == 401
        ), "Expected HTTP 401 for profile access with invalid token"

        # Test with valid token
        refresh = RefreshToken.for_user(self.user)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {refresh.access_token}")
        response = self.client.get("/users/profile/")
        assert (
            response.status_code == 200
        ), "Expected HTTP 200 for profile access with valid token"
        assert (
            "role" in response.data
        ), "Role not included in authenticated profile response"
