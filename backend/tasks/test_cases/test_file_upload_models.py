from django.conf import settings
from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import TestCase

from courses.models import Course
from tasks.models import FileSubmission, FileUploadTaskType, LearningTask

User = get_user_model()

class FileUploadTaskTypeTestCase(TestCase):
    def setUp(self):
        """
        Set up test data for FileUploadTaskType model tests
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
            description='A test course for file upload tasks',
            instructor=self.user
        )
        
        # Create a test learning task
        self.task = LearningTask.objects.create(
            title='File Upload Task',
            course=self.course,
            created_by=self.user
        )

    def test_create_file_upload_task_config(self):
        """
        Test creating a file upload task configuration
        """
        config = FileUploadTaskType.objects.create(
            task=self.task,
            allowed_file_types=['.pdf', '.docx', '.jpg'],
            max_file_size=5242880,  # 5MB
            max_files=3,
            require_description=True,
            virus_scan_required=True
        )
        
        self.assertEqual(config.task, self.task)
        self.assertEqual(config.allowed_file_types, ['.pdf', '.docx', '.jpg'])
        self.assertEqual(config.max_file_size, 5242880)
        self.assertEqual(config.max_files, 3)
        self.assertTrue(config.require_description)
        self.assertTrue(config.virus_scan_required)

    def test_file_upload_config_validation(self):
        """
        Test validation of file upload task configuration
        """
        # Test invalid file types
        with self.assertRaises(ValidationError):
            FileUploadTaskType.objects.create(
                task=self.task,
                allowed_file_types='invalid',  # Not a list
            )
        
        # Test invalid max file size
        with self.assertRaises(ValidationError):
            FileUploadTaskType.objects.create(
                task=self.task,
                max_file_size=-1,
            )
        
        # Test invalid max files
        with self.assertRaises(ValidationError):
            FileUploadTaskType.objects.create(
                task=self.task,
                max_files=0,
            )

class FileSubmissionTestCase(TestCase):
    def setUp(self):
        """
        Set up test data for FileSubmission model tests
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
            description='A test course for file upload tasks',
            instructor=self.user
        )
        
        # Create a test learning task
        self.task = LearningTask.objects.create(
            title='File Upload Task',
            course=self.course,
            created_by=self.user
        )
        
        # Create a file upload task configuration
        self.file_config = FileUploadTaskType.objects.create(
            task=self.task,
            allowed_file_types=['.pdf', '.docx', '.jpg'],
            max_file_size=5242880,  # 5MB
            max_files=3,
            require_description=True,
            virus_scan_required=True
        )

    def test_file_submission_creation(self):
        """
        Test creating a file submission
        """
        # Create a test PDF file
        pdf_file = SimpleUploadedFile(
            "test.pdf", 
            b"file_content", 
            content_type="application/pdf"
        )
        
        submission = FileSubmission.objects.create(
            task=self.task,
            student=self.user,
            file=pdf_file,
            file_description="A test PDF submission",
            original_filename="test.pdf"
        )
        
        self.assertEqual(submission.task, self.task)
        self.assertEqual(submission.student, self.user)
        self.assertEqual(submission.original_filename, "test.pdf")
        self.assertEqual(submission.file_description, "A test PDF submission")

    def test_file_submission_validation(self):
        """
        Test file submission validation
        """
        # Test file size validation
        large_file = SimpleUploadedFile(
            "large.pdf", 
            b"0" * 10000000,  # Larger than 5MB
            content_type="application/pdf"
        )
        
        with self.assertRaises(ValidationError):
            FileSubmission.objects.create(
                task=self.task,
                student=self.user,
                file=large_file,
                file_description="Large file",
                original_filename="large.pdf"
            )
        
        # Test file type validation
        invalid_file = SimpleUploadedFile(
            "test.txt", 
            b"file content", 
            content_type="text/plain"
        )
        
        with self.assertRaises(ValidationError):
            FileSubmission.objects.create(
                task=self.task,
                student=self.user,
                file=invalid_file,
                file_description="Invalid file type",
                original_filename="test.txt"
            )
        
        # Test description requirement
        pdf_file = SimpleUploadedFile(
            "test.pdf", 
            b"file_content", 
            content_type="application/pdf"
        )
        
        with self.assertRaises(ValidationError):
            FileSubmission.objects.create(
                task=self.task,
                student=self.user,
                file=pdf_file,
                file_description=None,  # Description is required
                original_filename="test.pdf"
            )

    def test_multiple_file_submissions(self):
        """
        Test multiple file submissions for a task
        """
        # Create multiple file submissions
        for i in range(3):
            file = SimpleUploadedFile(
                f"test{i}.pdf", 
                b"file_content", 
                content_type="application/pdf"
            )
            
            FileSubmission.objects.create(
                task=self.task,
                student=self.user,
                file=file,
                file_description=f"Test submission {i}",
                original_filename=f"test{i}.pdf"
            )
        
        # Verify number of submissions
        submissions = FileSubmission.objects.filter(task=self.task, student=self.user)
        self.assertEqual(submissions.count(), 3)
