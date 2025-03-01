import os
import random

import django
from django.contrib.auth import get_user_model
from django.core.wsgi import get_wsgi_application

# Setup Django environment
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "learningplatform.settings")
django.setup()

from core.services.version_control_service import VersionControlService
from learning.models import (Course, CourseInstructorAssignment, CourseVersion,
                             InstructorRole)

User = get_user_model()


class UserAcceptanceTestDataGenerator:
    @classmethod
    def create_test_users(cls):
        """
        Create test users with different roles and permissions.
        """
        users = {
            "lead_instructor": User.objects.create_user(
                username="lead_instructor",
                email="lead@example.com",
                password="testpass123",
            ),
            "assistant_instructor": User.objects.create_user(
                username="assistant_instructor",
                email="assistant@example.com",
                password="testpass123",
            ),
            "guest_instructor": User.objects.create_user(
                username="guest_instructor",
                email="guest@example.com",
                password="testpass123",
            ),
        }
        return users

    @classmethod
    def create_instructor_roles(cls):
        """
        Ensure instructor roles exist.
        """
        roles = {
            "LEAD": InstructorRole.objects.get_or_create(
                role_name=InstructorRole.StandardRoles.LEAD,
                defaults={
                    "description": "Lead Instructor with full course management rights",
                    "can_edit_course": True,
                    "can_manage_tasks": True,
                    "can_grade_submissions": True,
                },
            )[0],
            "ASSISTANT": InstructorRole.objects.get_or_create(
                role_name=InstructorRole.StandardRoles.ASSISTANT,
                defaults={
                    "description": "Assistant Instructor with limited course management rights",
                    "can_edit_course": False,
                    "can_manage_tasks": True,
                    "can_grade_submissions": True,
                },
            )[0],
            "GUEST": InstructorRole.objects.get_or_create(
                role_name=InstructorRole.StandardRoles.GUEST,
                defaults={
                    "description": "Guest Instructor with view-only access",
                    "can_edit_course": False,
                    "can_manage_tasks": False,
                    "can_grade_submissions": False,
                },
            )[0],
        }
        return roles

    @classmethod
    def create_test_courses(cls, users, roles):
        """
        Create test courses with version history and instructor assignments.
        """
        courses = []
        for i in range(3):
            course = Course.objects.create(
                title=f"Test Course {i+1}",
                description=f"Comprehensive test course {i+1} for user acceptance testing",
                status=Course.Status.DRAFT,
                visibility=Course.Visibility.INTERNAL,
                learning_objectives=f"Learning objectives for test course {i+1}",
                prerequisites=f"Prerequisites for test course {i+1}",
            )

            # Assign instructors
            CourseInstructorAssignment.objects.create(
                course=course, instructor=users["lead_instructor"], role=roles["LEAD"]
            )
            CourseInstructorAssignment.objects.create(
                course=course,
                instructor=users["assistant_instructor"],
                role=roles["ASSISTANT"],
            )
            CourseInstructorAssignment.objects.create(
                course=course, instructor=users["guest_instructor"], role=roles["GUEST"]
            )

            # Create version history
            version_service = VersionControlService(course)
            for version in range(2, 5):  # Create multiple versions
                version_service.create_version(
                    user=users["lead_instructor"], notes=f"Version {version} changes"
                )

            courses.append(course)
        return courses

    @classmethod
    def generate_test_data(cls):
        """
        Generate comprehensive test data for user acceptance testing.
        """
        users = cls.create_test_users()
        roles = cls.create_instructor_roles()
        courses = cls.create_test_courses(users, roles)

        return {"users": users, "roles": roles, "courses": courses}


def main():
    test_data = UserAcceptanceTestDataGenerator.generate_test_data()
    print("Test data generation complete.")
    print(f"Users: {list(test_data['users'].keys())}")
    print(f"Courses: {len(test_data['courses'])}")


if __name__ == "__main__":
    main()
