from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.db import transaction

from learning.models import Course, CourseInstructorAssignment, InstructorRole
from core.services.version_control_service import VersionControlService

User = get_user_model()

class Command(BaseCommand):
    help = 'Create comprehensive test data for development and testing'

    def create_test_users(self):
        """Create test users with different roles."""
        test_users = [
            {
                'username': 'lead_instructor',
                'email': 'lead@example.com',
                'password': 'testpass123',
                'role': 'instructor'
            },
            {
                'username': 'assistant_instructor', 
                'email': 'assistant@example.com',
                'password': 'testpass123',
                'role': 'instructor'
            },
            {
                'username': 'guest_instructor',
                'email': 'guest@example.com', 
                'password': 'testpass123',
                'role': 'instructor'
            }
        ]

        created_users = {}
        for user_data in test_users:
            user, created = User.objects.get_or_create(
                username=user_data['username'],
                defaults={
                    'email': user_data['email'],
                    'role': user_data['role']
                }
            )
            
            if created:
                user.set_password(user_data['password'])
                user.save()
                print(f'Created user: {user_data["username"]}')
            
            created_users[user_data['username']] = user
        
        return created_users

    def create_instructor_roles(self):
        """Create and return instructor roles."""
        roles = {
            'LEAD': InstructorRole.objects.get_or_create(
                role_name=InstructorRole.StandardRoles.LEAD,
                defaults={
                    'description': 'Lead Instructor with full course management rights',
                    'can_edit_course': True,
                    'can_manage_tasks': True,
                    'can_grade_submissions': True
                }
            )[0],
            'ASSISTANT': InstructorRole.objects.get_or_create(
                role_name=InstructorRole.StandardRoles.ASSISTANT,
                defaults={
                    'description': 'Assistant Instructor with limited course management rights',
                    'can_edit_course': False,
                    'can_manage_tasks': True,
                    'can_grade_submissions': True
                }
            )[0],
            'GUEST': InstructorRole.objects.get_or_create(
                role_name=InstructorRole.StandardRoles.GUEST,
                defaults={
                    'description': 'Guest Instructor with view-only access',
                    'can_edit_course': False,
                    'can_manage_tasks': False,
                    'can_grade_submissions': False
                }
            )[0]
        }
        return roles

    def create_test_courses(self, users, roles):
        """Create test courses with multiple instructors."""
        courses = []
        for i in range(3):
            course = Course.objects.create(
                title=f'Test Course {i+1}',
                description=f'Comprehensive test course {i+1} for development',
                status=Course.Status.DRAFT,
                visibility=Course.Visibility.INTERNAL,
                learning_objectives=f'Learning objectives for test course {i+1}',
                prerequisites=f'Prerequisites for test course {i+1}'
            )

            # Assign instructors with different roles
            CourseInstructorAssignment.objects.create(
                course=course,
                instructor=users['lead_instructor'],
                role=roles['LEAD']
            )
            CourseInstructorAssignment.objects.create(
                course=course,
                instructor=users['assistant_instructor'],
                role=roles['ASSISTANT']
            )
            CourseInstructorAssignment.objects.create(
                course=course,
                instructor=users['guest_instructor'],
                role=roles['GUEST']
            )

            # Create version history
            version_service = VersionControlService(course)
            for version in range(2, 4):  # Create multiple versions
                version_service.create_version(
                    user=users['lead_instructor'], 
                    notes=f'Version {version} changes'
                )

            courses.append(course)
            print(f'Created course: {course.title}')
        
        return courses

    def handle(self, *args, **kwargs):
        """Generate comprehensive test data."""
        with transaction.atomic():
            # Create users
            users = self.create_test_users()
            
            # Create instructor roles
            roles = self.create_instructor_roles()
            
            # Create courses
            courses = self.create_test_courses(users, roles)
            
            print(f'Test data generation complete. Created {len(users)} users, {len(roles)} roles, and {len(courses)} courses.')