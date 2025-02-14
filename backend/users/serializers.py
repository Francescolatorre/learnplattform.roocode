from django.contrib.auth import get_user_model, authenticate
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from rest_framework import serializers
from rest_framework.exceptions import AuthenticationFailed

User = get_user_model()

class UserRegistrationSerializer(serializers.ModelSerializer):
    """
    Serializer for user registration.
    """
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
            'email': {'required': True}
        }

    def validate(self, attrs):
        """
        Validate that the two password fields match.
        """
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Password fields didn't match."})
        return attrs

    def create(self, validated_data):
        """
        Create a new user with the validated data.
        """
        validated_data.pop('password2')
        user = User.objects.create_user(**validated_data)
        return user

class UserLoginSerializer(serializers.Serializer):
    """
    Serializer for user login.
    """
    username_or_email = serializers.CharField()
    password = serializers.CharField()

    def validate(self, data):
        """
        Validate the user credentials.
        """
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
    """
    Serializer for user profile.
    """
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'display_name', 'role')
        read_only_fields = ('id', 'username', 'email')

class PasswordResetSerializer(serializers.Serializer):
    """
    Serializer for password reset.
    """
    email = serializers.EmailField()

    def validate_email(self, value):
        """
        Validate that the email exists in the system.
        """
        try:
            user = User.objects.get(email=value)
        except User.DoesNotExist:
            raise serializers.ValidationError("No user found with this email address.")
        return value

    def save(self):
        """
        Save the password reset request.
        """
        email = self.validated_data['email']
        user = User.objects.get(email=email)
        # Implement actual password reset logic here
        # This is a placeholder and should be replaced with a secure implementation
        pass