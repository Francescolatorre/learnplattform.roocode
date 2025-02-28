from django.test import TestCase
from django.contrib.auth import get_user_model
from django.utils import timezone
from django.core.exceptions import ValidationError
from datetime import timedelta
from courses.models import Course
from tasks.models import LearningTask, TaskStatus, TaskType, TaskDifficulty

User = get_user_model()

class LearningTaskModelTestCase(TestCase):
    def setUp(self):
        """
        Set up test data for LearningTask model tests
        """
        # Create a test user
        self.user = User.objects.create_user(
            username='testuser', 
            email='test@example.com', 
            password='testpass123'
        )
        
        # Create a test course
        self.course = Course.objects.create(
            title='Test Course',
            description='A test course for learning tasks',
            instructor=self.user
        )

    def test_create_text_submission_task(self):
        """
        Test creating a text submission task with specific configurations
        """
        task = LearningTask.objects.create(
            title='Text Submission Task',
            course=self.course,
            created_by=self.user,
            task_type=TaskType.TEXT_SUBMISSION,
            min_word_count=50,
            max_word_count=500,
            text_submission_config={
                'prompt': 'Write an essay about your learning experience',
                'formatting_guidelines': 'Use APA format'
            }
        )
        
        self.assertEqual(task.task_type, TaskType.TEXT_SUBMISSION)
        self.assertEqual(task.min_word_count, 50)
        self.assertEqual(task.max_word_count, 500)
        self.assertEqual(task.text_submission_config.get('prompt'), 'Write an essay about your learning experience')

    def test_text_submission_validation(self):
        """
        Test text submission validation methods
        """
        task = LearningTask.objects.create(
            title='Text Submission Validation Task',
            course=self.course,
            created_by=self.user,
            task_type=TaskType.TEXT_SUBMISSION,
            min_word_count=50,
            max_word_count=500
        )

        # Test valid submission
        valid_text = ' '.join(['word'] * 100)  # 100 words
        self.assertTrue(task.validate_text_submission(valid_text))

        # Test submission below minimum word count
        short_text = ' '.join(['word'] * 20)  # 20 words
        self.assertFalse(task.validate_text_submission(short_text))

        # Test submission above maximum word count
        long_text = ' '.join(['word'] * 600)  # 600 words
        self.assertFalse(task.validate_text_submission(long_text))

    def test_text_submission_word_count_constraints(self):
        """
        Test validation of word count constraints
        """
        # Test invalid word count configuration
        with self.assertRaises(ValidationError):
            invalid_task = LearningTask(
                title='Invalid Word Count Task',
                course=self.course,
                created_by=self.user,
                task_type=TaskType.TEXT_SUBMISSION,
                min_word_count=500,
                max_word_count=50
            )
            invalid_task.full_clean()

    def test_text_submission_configuration(self):
        """
        Test text submission specific configuration
        """
        task = LearningTask.objects.create(
            title='Configured Text Submission Task',
            course=self.course,
            created_by=self.user,
            task_type=TaskType.TEXT_SUBMISSION,
            text_submission_config={
                'allowed_file_types': ['.txt', '.docx'],
                'plagiarism_check': True,
                'submission_instructions': 'Upload your essay as a document'
            }
        )

        config = task.text_submission_config
        self.assertEqual(config.get('allowed_file_types'), ['.txt', '.docx'])
        self.assertTrue(config.get('plagiarism_check'))
        self.assertEqual(config.get('submission_instructions'), 'Upload your essay as a document')

    def test_create_learning_task_with_default_values(self):
        """
        Test creating a learning task with default values
        """
        task = LearningTask.objects.create(
            title='Test Task',
            course=self.course,
            created_by=self.user
        )
        
        self.assertEqual(task.title, 'Test Task')
        self.assertEqual(task.course, self.course)
        self.assertEqual(task.created_by, self.user)
        self.assertEqual(task.status, TaskStatus.DRAFT)
        self.assertEqual(task.difficulty_level, TaskDifficulty.BEGINNER)
        self.assertEqual(task.task_type, TaskType.TEXT_SUBMISSION)
        self.assertTrue(task.is_active)

    def test_task_type_configuration(self):
        """
        Test task type configuration with JSONField
        """
        task = LearningTask.objects.create(
            title='Quiz Task',
            course=self.course,
            created_by=self.user,
            task_type=TaskType.MULTIPLE_CHOICE,
            task_configuration={
                'question_count': 10,
                'time_limit': 30,
                'passing_score': 7
            }
        )
        
        self.assertEqual(task.task_type, TaskType.MULTIPLE_CHOICE)
        self.assertEqual(task.get_task_configuration().get('question_count'), 10)
        self.assertEqual(task.get_task_configuration().get('time_limit'), 30)

    def test_task_availability_checks(self):
        """
        Test task availability methods
        """
        # Active, published task
        active_task = LearningTask.objects.create(
            title='Active Task',
            course=self.course,
            created_by=self.user,
            status=TaskStatus.PUBLISHED,
            deadline=timezone.now() + timedelta(days=1)
        )
        self.assertTrue(active_task.is_available_to_students())

        # Inactive task
        inactive_task = LearningTask.objects.create(
            title='Inactive Task',
            course=self.course,
            created_by=self.user,
            is_active=False,
            status=TaskStatus.PUBLISHED
        )
        self.assertFalse(inactive_task.is_available_to_students())

        # Expired task validation
        with self.assertRaises(ValidationError):
            LearningTask(
                title='Expired Task',
                course=self.course,
                created_by=self.user,
                status=TaskStatus.PUBLISHED,
                deadline=timezone.now() - timedelta(days=1)
            ).full_clean()

    def test_task_submission_controls(self):
        """
        Test task submission control methods
        """
        # Task with unlimited submissions
        unlimited_task = LearningTask.objects.create(
            title='Unlimited Submissions Task',
            course=self.course,
            created_by=self.user,
            status=TaskStatus.PUBLISHED,
            max_submissions=None
        )
        self.assertTrue(unlimited_task.can_submit(self.user))

        # Task with limited submissions
        limited_task = LearningTask.objects.create(
            title='Limited Submissions Task',
            course=self.course,
            created_by=self.user,
            status=TaskStatus.PUBLISHED,
            max_submissions=2
        )
        self.assertTrue(limited_task.can_submit(self.user))

    def test_task_validation(self):
        """
        Test model validation methods
        """
        # Test negative points possible
        with self.assertRaises(ValidationError):
            invalid_points_task = LearningTask(
                title='Invalid Points Task',
                course=self.course,
                created_by=self.user,
                points_possible=-1
            )
            invalid_points_task.full_clean()

        # Test past deadline
        with self.assertRaises(ValidationError):
            invalid_deadline_task = LearningTask(
                title='Invalid Deadline Task',
                course=self.course,
                created_by=self.user,
                deadline=timezone.now() - timedelta(days=1)
            )
            invalid_deadline_task.full_clean()

        # Test passing score greater than points possible
        with self.assertRaises(ValidationError):
            invalid_score_task = LearningTask(
                title='Invalid Score Task',
                course=self.course,
                created_by=self.user,
                points_possible=10,
                passing_score=15
            )
            invalid_score_task.full_clean()
