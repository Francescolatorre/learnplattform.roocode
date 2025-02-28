from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.db import transaction

try:
    from courses.models import Course
except ImportError as e:
    try:
        from courses.models import Course
    except ImportError as e:
        raise ImportError(
            "Ensure the 'courses' app is installed and available in your Django project settings."
        ) from e

try:
    from learning.models import CourseInstructorAssignment, InstructorRole
except ImportError as e:
    raise ImportError(
        "Ensure the 'learning' app is installed and available in your Django project settings."
    ) from e

try:
    from core.services.version_control_service import VersionControlService
except ImportError as e:
    raise ImportError(
        "Ensure the 'core' app is installed and available in your Django project settings."
    ) from e

User = get_user_model()


class Command(BaseCommand):
    help = "Create comprehensive test data for development and testing"

    def create_test_users(self):
        """Create test users with different roles."""
        test_users = [
            {
                "username": "lead_instructor",
                "email": "lead@example.com",
                "password": "testpass123",
                "role": "instructor",
            },
            {
                "username": "assistant_instructor",
                "email": "assistant@example.com",
                "password": "testpass123",
                "role": "instructor",
            },
            {
                "username": "guest_instructor",
                "email": "guest@example.com",
                "password": "testpass123",
                "role": "instructor",
            },
        ]

        created_users = {}
        for user_data in test_users:
            user, created = User.objects.get_or_create(
                username=user_data["username"],
                defaults={"email": user_data["email"]},
            )

            if created:
                user.set_password(user_data["password"])
                user.save()
                self.stdout.write(self.style.SUCCESS(f'Created user: {user_data["username"]}'))
            else:
                self.stdout.write(self.style.WARNING(f'User already exists: {user_data["username"]}'))

            created_users[user_data["username"]] = user

        return created_users

    def create_instructor_roles(self):
        """Create and return instructor roles."""
        roles = {
            "LEAD": InstructorRole.LEAD,
            "ASSISTANT": InstructorRole.ASSISTANT,
            "GUEST": InstructorRole.GUEST,
        }
        self.stdout.write(self.style.SUCCESS(f"Using instructor roles: {', '.join(roles.keys())}"))
        return roles

    def create_test_courses(self, users, roles):
        """Create test courses with multiple instructors."""
        courses = []
        for i in range(3):
            course, created = Course.objects.get_or_create(
                title=f"Test Course {i+1}",
                defaults={
                    "description": f"Comprehensive test course {i+1} for development",
                    "instructor": users["lead_instructor"],
                    "status": Course.Status.PUBLISHED,
                    "visibility": Course.Visibility.PUBLIC,
                    "learning_objectives": f"Learning objectives for test course {i+1}",
                    "prerequisites": f"Prerequisites for test course {i+1}",
                },
            )

            if created:
                # Assign instructors with different roles
                try:
                    CourseInstructorAssignment.objects.get_or_create(
                        course=course,
                        instructor=users["lead_instructor"],
                        role=roles["LEAD"],
                    )
                    CourseInstructorAssignment.objects.get_or_create(
                        course=course,
                        instructor=users["assistant_instructor"],
                        role=roles["ASSISTANT"],
                    )
                    CourseInstructorAssignment.objects.get_or_create(
                        course=course,
                        instructor=users["guest_instructor"],
                        role=roles["GUEST"],
                    )
                except Exception as e:
                    self.stdout.write(self.style.WARNING(f"Could not assign instructors: {str(e)}"))

                # Create version history
                try:
                    version_service = VersionControlService(course)
                    for version in range(2, 4):  # Create multiple versions
                        version_service.create_version(
                            user=users["lead_instructor"],
                            notes=f"Version {version} changes",
                        )
                except Exception as e:
                    self.stdout.write(self.style.WARNING(f"Could not create versions: {str(e)}"))

                self.stdout.write(self.style.SUCCESS(f"Created course: {course.title}"))
            else:
                self.stdout.write(self.style.WARNING(f"Course already exists: {course.title}"))

            courses.append(course)

        return courses

    def handle(self, *args, **kwargs):
        """Generate comprehensive test data."""
        self.stdout.write(self.style.NOTICE("Starting test data generation..."))
        
        try:
            with transaction.atomic():
                # Create users
                users = self.create_test_users()

                # Create instructor roles
                roles = self.create_instructor_roles()

                # Create courses
                courses = self.create_test_courses(users, roles)

                self.stdout.write(
                    self.style.SUCCESS(
                        f"Test data generation complete. Created {len(users)} users and {len(courses)} courses."
                    )
                )
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f"Error generating test data: {str(e)}")
            )
