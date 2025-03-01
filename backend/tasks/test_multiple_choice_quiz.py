from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError
from django.test import TestCase

from courses.models import Course
from tasks.models import (LearningTask, MultipleChoiceQuizSubmission,
                          MultipleChoiceQuizTaskType, TaskStatus, TaskType)

User = get_user_model()

class MultipleChoiceQuizTaskTypeTestCase(TestCase):
    def setUp(self):
        """
        Set up test data for multiple choice quiz task type
        """
        # Create a test user
        self.user = User.objects.create_user(
            username='quizuser', 
            email='quiz@example.com', 
            password='testpass123'
        )
        
        # Create a test course
        self.course = Course.objects.create(
            title='Quiz Course',
            description='A course for testing quizzes',
            instructor=self.user,
            difficulty_level='BEGINNER'
        )
        
        # Create a learning task
        self.task = LearningTask.objects.create(
            title='Test Multiple Choice Quiz',
            description='A quiz to test multiple choice functionality',
            course=self.course,
            created_by=self.user,
            task_type=TaskType.MULTIPLE_CHOICE,
            points_possible=10.0,
            passing_score=7.0
        )
    
    def test_multiple_choice_quiz_task_type_creation(self):
        """
        Test creating a multiple choice quiz task type configuration
        """
        quiz_config = MultipleChoiceQuizTaskType.objects.create(
            task=self.task,
            total_questions=3,
            questions_config=[
                {
                    'question': 'What is the capital of France?',
                    'options': ['London', 'Berlin', 'Paris', 'Madrid'],
                    'correct_answers': ['Paris']
                },
                {
                    'question': 'Which planet is known as the Red Planet?',
                    'options': ['Venus', 'Mars', 'Jupiter', 'Saturn'],
                    'correct_answers': ['Mars']
                },
                {
                    'question': 'Select all prime numbers',
                    'options': ['2', '4', '7', '9'],
                    'correct_answers': ['2', '7']
                }
            ],
            randomize_questions=True,
            randomize_options=True,
            points_per_question=3.33,
            max_attempts=2
        )
        
        # Verify quiz configuration creation
        self.assertEqual(quiz_config.task, self.task)
        self.assertEqual(quiz_config.total_questions, 3)
        self.assertEqual(len(quiz_config.questions_config), 3)
        self.assertTrue(quiz_config.randomize_questions)
        self.assertTrue(quiz_config.randomize_options)
        self.assertEqual(quiz_config.points_per_question, 3.33)
        self.assertEqual(quiz_config.max_attempts, 2)
    
    def test_quiz_submission_validation(self):
        """
        Test quiz submission validation and scoring
        """
        quiz_config = MultipleChoiceQuizTaskType.objects.create(
            task=self.task,
            total_questions=3,
            questions_config=[
                {
                    'question': 'What is the capital of France?',
                    'options': ['London', 'Berlin', 'Paris', 'Madrid'],
                    'correct_answers': ['Paris']
                },
                {
                    'question': 'Which planet is known as the Red Planet?',
                    'options': ['Venus', 'Mars', 'Jupiter', 'Saturn'],
                    'correct_answers': ['Mars']
                },
                {
                    'question': 'Select all prime numbers',
                    'options': ['2', '4', '7', '9'],
                    'correct_answers': ['2', '7']
                }
            ],
            points_per_question=3.33,
            max_attempts=2
        )
        
        # Correct submission
        correct_answers = [['Paris'], ['Mars'], ['2', '7']]
        score, detailed_results = quiz_config.validate_submission(correct_answers)
        
        self.assertAlmostEqual(score, 10.0)  # 3 questions * 3.33 points
        self.assertEqual(len(detailed_results), 3)
        self.assertTrue(all(result['is_correct'] for result in detailed_results))
        
        # Partially correct submission
        partial_answers = [['Paris'], ['Jupiter'], ['2']]
        score, detailed_results = quiz_config.validate_submission(partial_answers)
        
        self.assertAlmostEqual(score, 3.33)  # Only first question correct
        self.assertEqual(len(detailed_results), 3)
        self.assertEqual(sum(1 for result in detailed_results if result['is_correct']), 1)
    
    def test_quiz_submission_model(self):
        """
        Test MultipleChoiceQuizSubmission model
        """
        quiz_config = MultipleChoiceQuizTaskType.objects.create(
            task=self.task,
            total_questions=3,
            questions_config=[
                {
                    'question': 'What is the capital of France?',
                    'options': ['London', 'Berlin', 'Paris', 'Madrid'],
                    'correct_answers': ['Paris']
                },
                {
                    'question': 'Which planet is known as the Red Planet?',
                    'options': ['Venus', 'Mars', 'Jupiter', 'Saturn'],
                    'correct_answers': ['Mars']
                },
                {
                    'question': 'Select all prime numbers',
                    'options': ['2', '4', '7', '9'],
                    'correct_answers': ['2', '7']
                }
            ],
            points_per_question=3.33,
            max_attempts=2
        )
        
        # Correct submission
        correct_answers = [['Paris'], ['Mars'], ['2', '7']]
        score, detailed_results = quiz_config.validate_submission(correct_answers)
        
        submission = MultipleChoiceQuizSubmission.objects.create(
            task=self.task,
            student=self.user,
            answers=correct_answers,
            score=score,
            max_score=quiz_config.calculate_max_score(),
            detailed_results=detailed_results,
            attempt_number=1,
            is_passed=score >= self.task.passing_score
        )
        
        self.assertEqual(submission.task, self.task)
        self.assertEqual(submission.student, self.user)
        self.assertEqual(submission.answers, correct_answers)
        self.assertAlmostEqual(submission.score, 10.0)
        self.assertAlmostEqual(submission.max_score, 10.0)
        self.assertEqual(len(submission.detailed_results), 3)
        self.assertTrue(submission.is_passed)
        self.assertEqual(submission.attempt_number, 1)
