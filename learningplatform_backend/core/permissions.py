from rest_framework.permissions import BasePermission
from .models import CourseEnrollment  # Replace 'your_app' with the actual app name
import logging  # Add logging import

# Configure logger for this module
logger = logging.getLogger(__name__)


class IsStudentOrReadOnly(BasePermission):
    """
    Custom permission to allow students to access their own data.
    """

    def has_permission(self, request, view):
        logger.debug(f"Checking permission for user {request.user}")  # Log to file
        return request.user.is_authenticated and request.user.role == "student"

    def has_object_permission(self, request, view, obj):
        # Allow access only if the object belongs to the authenticated student
        return request.user.role == "student" and obj.user == request.user


class IsInstructorOrAdmin(BasePermission):
    """
    Custom permission to allow only instructors or admins to access a view.
    """

    def has_permission(self, request, view):
        # Allow access only if the user is an instructor or admin
        return (request.user.is_authenticated and (request.user.role == "instructor" or request.user.is_staff))




class IsEnrolledInCourse(BasePermission):
    """
    Custom permission to allow students enrolled in a course to access its data.
    """

    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False

        # Check if the user is a student
        if request.user.role != "student":
            return False

        # Check if the student is enrolled in the course
        course_id = view.kwargs.get("pk") or request.GET.get("course")
        if not course_id:
            return False

        return CourseEnrollment.objects.filter(
            user=request.user, course_id=course_id
        ).exists()
