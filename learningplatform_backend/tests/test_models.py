import pytest
from core.models import Course, User  # Update import to reference the new location


@pytest.mark.django_db
def test_course_creation():
    user = User.objects.create_user(
        username="testuser", email="test@example.com", password="password"
    )
    course = Course.objects.create(title="Test Course", creator=user)
    assert course.title == "Test Course"
