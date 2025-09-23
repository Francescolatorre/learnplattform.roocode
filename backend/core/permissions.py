"""
Permission classes for the Learning Platform.

This module defines custom permission classes that control access to various
API endpoints based on user roles and relationships. These permissions work
alongside Django REST Framework's built-in permission classes.

Key permission types:
- Role-based permissions (admin, instructor, student)
- Course-specific permissions (enrollment, ownership)
- Content management permissions (task creation, quiz management)
"""

import logging  # Add logging import

from rest_framework.permissions import BasePermission

from .models import CourseEnrollment  # Replace 'your_app' with the actual app name

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
        return request.user.is_authenticated and (
            request.user.role == "instructor" or request.user.is_staff
        )


class IsEnrolledInCourse(BasePermission):
    """
    Custom permission to allow students enrolled in a course to access its data.
    """

    def has_permission(self, request, view):
        # Extract course ID from the view kwargs
        course_id = view.kwargs.get("course_id")
        user = request.user

        # Debug logging
        print(f"DEBUG: Checking enrollment for user {user} in course {course_id}")

        if not user.is_authenticated:
            print("DEBUG: User is not authenticated.")
            return False

        # Allow access to course details even if not enrolled
        if course_id is None:
            return True

        # Check if the user is enrolled in the course
        is_enrolled = CourseEnrollment.objects.filter(
            user=user, course_id=course_id
        ).exists()
        print(
            f"DEBUG: Enrollment status for user {user.id} in course {course_id}: {is_enrolled}"
        )

        return is_enrolled


class IsCourseCreatorOrAdmin(BasePermission):
    """
    Permission class that only allows access to the course creator or administrators.

    This permission is used for endpoints that involve:
    - Course content management
    - Course settings modification
    - Course deletion
    - Student progress oversight
    """

    def has_object_permission(self, request, view, obj):
        return bool(
            request.user
            and request.user.is_authenticated
            and (obj.creator == request.user or request.user.role == "admin")
        )


class IsTaskCreatorOrAdmin(BasePermission):
    """
    Permission class that only allows access to the task creator or administrators.

    This permission is used for endpoints that manage:
    - Learning task content
    - Quiz questions and settings
    - Task visibility and ordering
    """

    def has_object_permission(self, request, view, obj):
        return bool(
            request.user
            and request.user.is_authenticated
            and (obj.course.creator == request.user or request.user.role == "admin")
        )


class IsQuizParticipant(BasePermission):
    """
    Permission class that only allows access to users who can participate in a quiz.

    This includes:
    - Enrolled students taking the quiz
    - Course instructors viewing results
    - Administrators

    Used for endpoints that handle:
    - Quiz attempts
    - Quiz responses
    - Results viewing
    """

    def has_permission(self, request, view):
        quiz_id = view.kwargs.get("quiz_id") or request.data.get("quiz")
        if not quiz_id:
            return False

        # Allow instructors and admins
        if request.user.role in ["instructor", "admin"]:
            return True

        # Check if student is enrolled in the course containing this quiz
        return bool(
            request.user
            and request.user.is_authenticated
            and CourseEnrollment.objects.filter(
                user=request.user,
                course__learning_tasks__quiztask__id=quiz_id,
                status="active",
            ).exists()
        )
