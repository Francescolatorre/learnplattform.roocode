"""
Tests for the AssessmentRepository implementation.
"""
from decimal import Decimal

import pytest
from django.core.exceptions import ObjectDoesNotExist
from django.db import transaction

from assessment.models import Quiz, Submission, UserProgress
from core.repositories.assessment_repository import AssessmentRepository
from core.tests.factories import (AdminFactory, QuizFactory, SubmissionFactory,
                                  UserFactory, UserProgressFactory)

pytestmark = pytest.mark.django_db

class TestAssessmentRepository:
    """
    Database tests for AssessmentRepository.
    """
    
    @pytest.fixture
    def repository(self):
        """
        Creates an AssessmentRepository instance.
        """
        return AssessmentRepository()

    def test_get_user_submissions_empty(self, repository, test_user):
        """
        Test getting user submissions when none exist.
        """
        # Act
        submissions = repository.get_user_submissions(test_user.id)
        
        # Assert
        assert len(submissions) == 0

    def test_get_user_submissions_with_data(
        self,
        repository,
        test_user,
        transactional_db_setup
    ):
        """
        Test getting user submissions with existing data.
        """
        # Arrange
        submission = SubmissionFactory(user=test_user)
        
        # Act
        submissions = repository.get_user_submissions(
            test_user.id,
            include_task_details=True
        )
        
        # Assert
        assert len(submissions) == 1
        assert submissions[0].id == submission.id
        assert submissions[0].user_id == test_user.id

    def test_get_submission_exists(
        self,
        repository,
        test_user,
        transactional_db_setup
    ):
        """
        Test getting a specific submission that exists.
        """
        # Arrange
        submission = SubmissionFactory(
            user=test_user,
            grade=Decimal('85.0')
        )
        
        # Act
        result = repository.get_submission(submission.id)
        
        # Assert
        assert result.id == submission.id
        assert result.user_id == test_user.id
        assert result.grade == Decimal('85.0')

    def test_get_submission_not_found(self, repository):
        """
        Test getting a submission that doesn't exist.
        """
        # Act/Assert
        with pytest.raises(ObjectDoesNotExist):
            repository.get_submission(999)

    def test_get_quiz_with_tasks(
        self,
        repository,
        transactional_db_setup
    ):
        """
        Test getting a quiz with its associated tasks.
        """
        # Arrange
        quiz = QuizFactory()
        
        # Act
        result = repository.get_quiz_with_tasks(quiz.id)
        
        # Assert
        assert result.id == quiz.id
        assert result.title == quiz.title

    def test_get_progress_with_related(
        self,
        repository,
        test_user,
        transactional_db_setup
    ):
        """
        Test getting user progress with related data.
        """
        # Arrange
        quiz = QuizFactory()
        progress = UserProgressFactory(user=test_user, quiz=quiz)
        
        # Act
        result = repository.get_progress_with_related(progress.id)
        
        # Assert
        assert result.id == progress.id
        assert result.user_id == test_user.id
        assert result.quiz_id == quiz.id
        assert result.total_score == Decimal('0.0')

    def test_atomic_quiz_creation(
        self,
        repository,
        test_transaction
    ):
        """
        Test atomic quiz creation with tasks.
        """
        # Arrange
        quiz = QuizFactory()
        
        # Act
        with transaction.atomic():
            # Create quiz without default tasks
            quiz.tasks.add()
        
        # Assert
        saved_quiz = repository.get_quiz_with_tasks(quiz.id)
        assert saved_quiz.tasks.count() == 0

    def test_concurrent_submission_grading(
        self,
        repository,
        test_user,
        test_admin,
        nested_transaction
    ):
        """
        Test concurrent submission grading with transaction isolation.
        """
        # Arrange
        submission = SubmissionFactory(
            user=test_user,
            grade=Decimal('0.0')
        )
        
        # Act
        with transaction.atomic():
            # First grading
            submission.grade = Decimal('85.0')
            submission.graded_by = test_admin  # Pass the User instance, not just the ID
            submission.save()
            
            # Simulate concurrent grading
            with transaction.atomic():
                concurrent_submission = Submission.objects.get(id=submission.id)
                concurrent_submission.grade = Decimal('90.0')
                concurrent_submission.save()
        
        # Assert
        final_submission = repository.get_submission(submission.id)
        assert final_submission.grade == Decimal('90.0')
        assert final_submission.graded_by == test_admin
