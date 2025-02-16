"""
Factory Boy factories for core models.
"""
import factory
from users.models import User  # Direct import from users app
from factory.django import DjangoModelFactory

class UserFactory(DjangoModelFactory):
    """Factory for User model."""
    
    class Meta:
        model = User
        django_get_or_create = ('username',)
    
    username = factory.Sequence(lambda n: f'user{n}')
    email = factory.LazyAttribute(lambda obj: f'{obj.username}@example.com')
    password = factory.PostGenerationMethodCall('set_password', 'testpass123')
    display_name = factory.LazyAttribute(lambda obj: f'Display {obj.username}')
    role = 'user'
    is_active = True
    is_staff = False
    is_superuser = False

    @factory.post_generation
    def groups(self, create, extracted, **kwargs):
        """Add groups to user if specified."""
        if not create or not extracted:
            return
        
        self.groups.add(*extracted)

    @factory.post_generation
    def user_permissions(self, create, extracted, **kwargs):
        """Add permissions to user if specified."""
        if not create or not extracted:
            return
        
        self.user_permissions.add(*extracted)

class AdminFactory(UserFactory):
    """Factory for admin users."""
    username = factory.Sequence(lambda n: f'admin{n}')
    email = factory.LazyAttribute(lambda obj: f'{obj.username}@example.com')
    display_name = factory.LazyAttribute(lambda obj: f'Admin {obj.username}')
    role = 'admin'
    is_staff = True
    is_superuser = True