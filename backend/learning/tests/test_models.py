from django.test import TestCase
from backend.learning.models import LearningTask
from backend.courses.models import Course
from django.contrib.auth.models import User
from django.utils import timezone
import uuid

class LearningTaskModelTest(TestCase):

    def setUp(self):
        self.user = User.objects.create_user(username='testuser', password='testpassword')
        self.course = Course.objects.create(name='Test Course', description='Test Description')

    def test_create_learning_task(self):
        task = LearningTask.objects.create(
            title='Test Task',
            description='This is a test task',
            course=self.course,
            status='Draft',
            created_by=self.user,
            max_submissions=1,
            deadline=timezone.now() + timezone.timedelta(days=7),
            points=10,
            task_type='Text',
            submission_instructions='Submit your work'
        )
        self.assertEqual(task.title, 'Test Task')
        self.assertEqual(task.description, 'This is a test task')
        self.assertEqual(task.course, self.course)
        self.assertEqual(task.status, 'Draft')
        self.assertEqual(task.created_by, self.user)
        self.assertEqual(task.max_submissions, 1)
        self.assertIsNotNone(task.deadline)
        self.assertEqual(task.points, 10)
        self.assertEqual(task.task_type, 'Text')
        self.assertEqual(task.submission_instructions, 'Submit your work')

    def test_learning_task_str(self):
        task = LearningTask.objects.create(
            title='Test Task',
            description='This is a test task',
            course=self.course,
            status='Draft',
            created_by=self.user
        )
        self.assertEqual(str(task), 'Test Task - Test Course')

    def test_learning_task_field_validation(self):
        with self.assertRaises(ValueError):
            LearningTask.objects.create(
                title='',
                description='This is a test task',
                course=self.course,
                status='Draft',
                created_by=self.user
            )

    def test_learning_task_relationship_integrity(self):
        task = LearningTask.objects.create(
            title='Test Task',
            description='This is a test task',
            course=self.course,
            status='Draft',
            created_by=self.user
        )
        self.course.delete()
        with self.assertRaises(LearningTask.DoesNotExist):
            LearningTask.objects.get(id=task.id)

    def test_learning_task_constraint_enforcement(self):
        with self.assertRaises(ValueError):
            LearningTask.objects.create(
                title='Test Task',
                description='This is a test task',
                course=self.course,
                status='InvalidStatus',
                created_by=self.user
            )

    def test_learning_task_edge_case_handling(self):
        task = LearningTask.objects.create(
            title='Test Task',
            description='This is a test task',
            course=self.course,
            status='Draft',
            created_by=self.user,
            max_submissions=None,
            deadline=None,
            points=0,
            task_type='',
            submission_instructions=''
        )
        self.assertIsNone(task.max_submissions)
        self.assertIsNone(task.deadline)
        self.assertEqual(task.points, 0)
        self.assertEqual(task.task_type, '')
        self.assertEqual(task.submission_instructions, '')
