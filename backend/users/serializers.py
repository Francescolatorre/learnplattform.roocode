"""
Serializers for user authentication and management.
"""
from django.contrib.auth import authenticate, get_user_model
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from rest_framework import serializers
from rest_framework.exceptions import AuthenticationFailed

User = get_user_model()

class UserRegistrationSerializer(serializers.ModelSerializer):
    """Serializer for user registration."""
    password = serializers.CharField(
        write_only=True,
        required=True,
        validators=[validate_password]
    )
    password2 = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = User
        fields = ('username', 'email', 'password', 'password2', 'display_name', 'role')
        extra_kwargs = {
            'username': {'required': True},
            'email': {'required': True},
            'display_name': {'required': False},
            'role': {'required': False}
        }

    def validate(self, attrs):
        """Validate that the two password fields match."""
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Password fields didn't match."})

        # Validate email uniqueness
        email = attrs.get('email')
        if email and User.objects.filter(email=email).exists():
            raise serializers.ValidationError({"email": "A user with that email already exists."})

        return attrs

    def create(self, validated_data):
        """Create a new user with encrypted password."""
        validated_data.pop('password2')
        password = validated_data.pop('password')
        user = User.objects.create_user(**validated_data)
        user.set_password(password)
        user.save()
        return user

class UserLoginSerializer(serializers.Serializer):
    """Serializer for user login."""
    username_or_email = serializers.CharField(required=True)
    password = serializers.CharField(required=True, style={'input_type': 'password'})

    def validate(self, data):
        """Validate the user credentials."""
        username_or_email = data.get('username_or_email')
        password = data.get('password')

        if not username_or_email or not password:
            raise serializers.ValidationError('Must include "username_or_email" and "password".')

        # Try to authenticate with username
        user = authenticate(username=username_or_email, password=password)

        # If not found, try with email
        if not user:
            try:
                user_obj = User.objects.get(email=username_or_email)
                user = authenticate(username=user_obj.username, password=password)
            except User.DoesNotExist:
                user = None

        if not user:
            raise AuthenticationFailed('Invalid credentials.')

        if not user.is_active:
            raise AuthenticationFailed('User account is disabled.')

        data['user'] = user
        return data

class UserProfileSerializer(serializers.ModelSerializer):
    """Serializer for user profile."""
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'display_name', 'role')
        read_only_fields = ('id', 'username', 'email', 'role')

    def update(self, instance, validated_data):
        """Update user profile, preventing role changes."""
        for attr, value in validated_data.items():
            if attr not in self.Meta.read_only_fields:
                setattr(instance, attr, value)
        instance.save()
        return instance

class PasswordResetSerializer(serializers.Serializer):
    """Serializer for password reset."""
    email = serializers.EmailField(required=True)

    def validate_email(self, value):
        """Validate that the email exists in the system."""
        try:
            User.objects.get(email=value)
        except User.DoesNotExist:
            raise serializers.ValidationError("No user found with this email address.")
        return value

    def save(self):
        """Process the password reset request."""
        email = self.validated_data['email']
        user = User.objects.get(email=email)
        # In a real implementation, you would:
        # 1. Generate a password reset token
        # 2. Send an email with the reset link
        # 3. Save the token in the database
        # For testing purposes, we'll just verify the user exists
        return True
