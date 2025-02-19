import pytest
from django.contrib.auth import get_user_model
from learning.models import (
    Course,
    CourseInstructorAssignment,
    InstructorRole,
    CourseVersion,
)
from core.services.version_control_service import VersionControlService

User = get_user_model()


@pytest.mark.django_db
class TestUserAcceptanceCourseManagement:
    @pytest.fixture
    def test_users(self):
        """Create test users with different roles."""
        users = {
            "lead": User.objects.create_user(
                username="lead_instructor",
                email="lead@example.com",
                password="testpass123",
            ),
            "assistant": User.objects.create_user(
                username="assistant_instructor",
                email="assistant@example.com",
                password="testpass123",
            ),
            "guest": User.objects.create_user(
                username="guest_instructor",
                email="guest@example.com",
                password="testpass123",
            ),
        }
        return users

    @pytest.fixture
    def instructor_roles(self):
        """Create and return instructor roles."""
        return {
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

    @pytest.fixture
    def test_course(self, test_users, instructor_roles):
        """Create a test course with multiple instructors."""
        course = Course.objects.create(
            title="User Acceptance Test Course",
            description="Comprehensive course for testing user acceptance scenarios",
            status=Course.Status.DRAFT,
            visibility=Course.Visibility.INTERNAL,
        )

        # Assign instructors with different roles
        CourseInstructorAssignment.objects.create(
            course=course, instructor=test_users["lead"], role=instructor_roles["LEAD"]
        )
        CourseInstructorAssignment.objects.create(
            course=course,
            instructor=test_users["assistant"],
            role=instructor_roles["ASSISTANT"],
        )
        CourseInstructorAssignment.objects.create(
            course=course,
            instructor=test_users["guest"],
            role=instructor_roles["GUEST"],
        )

        return course

    def test_instructor_role_permissions(
        self, test_course, test_users, instructor_roles
    ):
        """
        Test role-based access control for different instructor roles.
        """
        # Test Lead Instructor permissions
        lead_assignment = CourseInstructorAssignment.objects.get(
            course=test_course, instructor=test_users["lead"]
        )
        assert lead_assignment.role == instructor_roles["LEAD"]
        assert (
            test_course.has_instructor_permission(test_users["lead"], "edit_course")
            == True
        )
        assert (
            test_course.has_instructor_permission(test_users["lead"], "manage_tasks")
            == True
        )
        assert (
            test_course.has_instructor_permission(
                test_users["lead"], "grade_submissions"
            )
            == True
        )

        # Test Assistant Instructor permissions
        assistant_assignment = CourseInstructorAssignment.objects.get(
            course=test_course, instructor=test_users["assistant"]
        )
        assert assistant_assignment.role == instructor_roles["ASSISTANT"]
        assert (
            test_course.has_instructor_permission(
                test_users["assistant"], "edit_course"
            )
            == False
        )
        assert (
            test_course.has_instructor_permission(
                test_users["assistant"], "manage_tasks"
            )
            == True
        )
        assert (
            test_course.has_instructor_permission(
                test_users["assistant"], "grade_submissions"
            )
            == True
        )

        # Test Guest Instructor permissions
        guest_assignment = CourseInstructorAssignment.objects.get(
            course=test_course, instructor=test_users["guest"]
        )
        assert guest_assignment.role == instructor_roles["GUEST"]
        assert (
            test_course.has_instructor_permission(test_users["guest"], "edit_course")
            == False
        )
        assert (
            test_course.has_instructor_permission(test_users["guest"], "manage_tasks")
            == False
        )
        assert (
            test_course.has_instructor_permission(
                test_users["guest"], "grade_submissions"
            )
            == False
        )

    def test_course_version_creation(self, test_course, test_users):
        """
        Test course version creation and tracking.
        """
        # Initial version check
        assert test_course.version == 1

        # Create version control service
        version_service = VersionControlService(test_course)

        # Create new version
        new_version = version_service.create_version(
            user=test_users["lead"], notes="First version update"
        )

        # Verify version incremented
        test_course.refresh_from_db()
        assert test_course.version == 2
        assert new_version.version_number == 2
        assert new_version.created_by == test_users["lead"]
        assert new_version.notes == "First version update"

    def test_version_rollback(self, test_course, test_users):
        """
        Test version rollback functionality.
        """
        version_service = VersionControlService(test_course)

        # Create multiple versions
        version_service.create_version(
            user=test_users["lead"], notes="Version 2 changes"
        )
        version_service.create_version(
            user=test_users["lead"], notes="Version 3 changes"
        )

        # Verify current version
        test_course.refresh_from_db()
        assert test_course.version == 3

        # Rollback to previous version
        version_service.rollback_to_version(
            version_number=2, user=test_users["lead"], reason="Testing rollback"
        )

        # Verify rollback
        test_course.refresh_from_db()
        assert test_course.version == 4  # New version created for rollback

        # Verify version history
        versions = CourseVersion.objects.filter(course=test_course)
        assert versions.count() == 4  # Original + 3 versions

    def test_version_comparison(self, test_course, test_users):
        """
        Test version comparison functionality.
        """
        version_service = VersionControlService(test_course)

        # Create versions with different content
        test_course.learning_objectives = "Initial learning objectives"
        test_course.save()
        version_service.create_version(user=test_users["lead"], notes="First version")

        test_course.learning_objectives = "Updated learning objectives"
        test_course.save()
        version_service.create_version(user=test_users["lead"], notes="Second version")

        # Compare versions
        changes = version_service.compare_versions(1, 2)
        assert "learning_objectives" in changes
        assert changes["learning_objectives"]["old"] == "Initial learning objectives"
        assert changes["learning_objectives"]["new"] == "Updated learning objectives"
