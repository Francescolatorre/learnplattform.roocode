"""
Repository for task-related database operations.
"""
from decimal import Decimal
from typing import Dict, List, Optional, Union
from django.core.exceptions import ObjectDoesNotExist
from django.db import transaction
from django.db.models import QuerySet

from tasks.models import LearningTask, AssessmentTask, QuizTask

class TaskRepository:
    """
    Handles database operations for tasks.
    """

    def get_learning_tasks(self) -> QuerySet[LearningTask]:
        """
        Retrieves all learning tasks.

        Returns:
            QuerySet[LearningTask]: A queryset of learning tasks.
        """
        return LearningTask.objects.all()

    def get_assessment_tasks(self) -> QuerySet[AssessmentTask]:
        """
        Retrieves all assessment tasks.

        Returns:
            QuerySet[AssessmentTask]: A queryset of assessment tasks.
        """
        return AssessmentTask.objects.all()

    def get_quiz_task(self, task_id: int) -> QuizTask:
        """
        Retrieves a specific quiz task by ID.

        Args:
            task_id (int): The ID of the quiz task.

        Returns:
            QuizTask: The requested quiz task.

        Raises:
            ObjectDoesNotExist: If the task doesn't exist.
        """
        return QuizTask.objects.get(id=task_id)

    def create_learning_task(self, **task_data: Dict[str, Union[str, Decimal]]) -> LearningTask:
        """
        Creates a new learning task.

        Args:
            **task_data: Task fields including title, description,
                        and difficulty_level.

        Returns:
            LearningTask: The created learning task.
        """
        return LearningTask.objects.create(**task_data)

    def create_quiz_task(self, **task_data: Dict[str, Union[str, int, bool, Decimal]]) -> QuizTask:
        """
        Creates a new quiz task.

        Args:
            **task_data: Task fields including title, max_score,
                        time_limit, and is_randomized.

        Returns:
            QuizTask: The created quiz task.
        """
        return QuizTask.objects.create(**task_data)

    def update_assessment_task(self, task_id: int, **updates: Dict[str, Union[str, Decimal]]) -> AssessmentTask:
        """
        Updates an assessment task.

        Args:
            task_id (int): The ID of the task to update.
            **updates: Fields to update.

        Returns:
            AssessmentTask: The updated task.

        Raises:
            ObjectDoesNotExist: If the task doesn't exist.
        """
        task = AssessmentTask.objects.get(id=task_id)
        for field, value in updates.items():
            setattr(task, field, value)
        task.save()
        return task

    def delete_task(self, task_id: int) -> None:
        """
        Deletes a task of any type.

        Args:
            task_id (int): The ID of the task to delete.

        Raises:
            ObjectDoesNotExist: If the task doesn't exist.
        """
        try:
            task = LearningTask.objects.get(id=task_id)
        except LearningTask.DoesNotExist:
            task = AssessmentTask.objects.get(id=task_id)
        task.delete()

    def get_tasks_by_due_date(self, before_date: Optional[str] = None) -> QuerySet[AssessmentTask]:
        """
        Retrieves tasks based on due date.

        Args:
            before_date (datetime, optional): Filter tasks due before this date.

        Returns:
            QuerySet: Tasks matching the criteria.
        """
        tasks = AssessmentTask.objects.all()
        if before_date:
            tasks = tasks.filter(due_date__lte=before_date)
        return tasks

    def get_tasks_with_criteria(self, **filters: Dict[str, Union[str, Decimal]]) -> QuerySet[AssessmentTask]:
        """
        Retrieves tasks based on multiple criteria.

        Args:
            **filters: Filter criteria to apply.

        Returns:
            QuerySet: Tasks matching the criteria.
        """
        return AssessmentTask.objects.filter(**filters)

    @transaction.atomic
    def bulk_create_tasks(self, task_data_list: List[Dict[str, Union[str, int, bool, Decimal]]]) -> List[Union[LearningTask, QuizTask]]:
        """
        Creates multiple tasks in a single transaction.

        Args:
            task_data_list (list): List of task data dictionaries.

        Returns:
            list: Created task instances.
        """
        created_tasks = []
        for task_data in task_data_list:
            task_type = task_data.pop('type', 'learning')
            if task_type == 'quiz':
                task = self.create_quiz_task(**task_data)
            else:
                task = self.create_learning_task(**task_data)
            created_tasks.append(task)
        return created_tasks