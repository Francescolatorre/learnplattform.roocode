"""
Repository for task-related database operations.
"""

from decimal import Decimal
from typing import Dict, List, Optional, Union

from django.db import transaction
from django.db.models import QuerySet

from backend.learningplatform.models import Task


class TaskRepository:
    """
    Handles database operations for tasks.
    """

    def get_tasks(self) -> QuerySet[Task]:
        """
        Retrieves all tasks.

        Returns:
            QuerySet[Task]: A queryset of tasks.
        """
        return Task.objects.all()

    def get_task(self, task_id: int) -> Task:
        """
        Retrieves a specific task by ID.

        Args:
            task_id (int): The ID of the task.

        Returns:
            Task: The requested task.

        Raises:
            ObjectDoesNotExist: If the task doesn't exist.
        """
        return Task.objects.get(id=task_id)

    def create_task(
        self, **task_data: Dict[str, Union[str, int, bool, Decimal]]
    ) -> Task:
        """
        Creates a new task.

        Args:
            **task_data: Task fields including title, description, and other attributes.

        Returns:
            Task: The created task.
        """
        return Task.objects.create(**task_data)

    def update_task(
        self, task_id: int, **updates: Dict[str, Union[str, Decimal]]
    ) -> Task:
        """
        Updates a task.

        Args:
            task_id (int): The ID of the task to update.
            **updates: Fields to update.

        Returns:
            Task: The updated task.

        Raises:
            ObjectDoesNotExist: If the task doesn't exist.
        """
        task = Task.objects.get(id=task_id)
        for field, value in updates.items():
            setattr(task, field, value)
        task.save()
        return task

    def delete_task(self, task_id: int) -> None:
        """
        Deletes a task.

        Args:
            task_id (int): The ID of the task to delete.

        Raises:
            ObjectDoesNotExist: If the task doesn't exist.
        """
        task = Task.objects.get(id=task_id)
        task.delete()

    def get_tasks_by_due_date(
        self, before_date: Optional[str] = None
    ) -> QuerySet[Task]:
        """
        Retrieves tasks based on due date.

        Args:
            before_date (datetime, optional): Filter tasks due before this date.

        Returns:
            QuerySet: Tasks matching the criteria.
        """
        tasks = Task.objects.all()
        if before_date:
            tasks = tasks.filter(due_date__lte=before_date)
        return tasks

    def get_tasks_with_criteria(
        self, **filters: Dict[str, Union[str, Decimal]]
    ) -> QuerySet[Task]:
        """
        Retrieves tasks based on multiple criteria.

        Args:
            **filters: Filter criteria to apply.

        Returns:
            QuerySet: Tasks matching the criteria.
        """
        return Task.objects.filter(**filters)

    @transaction.atomic
    def bulk_create_tasks(
        self, task_data_list: List[Dict[str, Union[str, int, bool, Decimal]]]
    ) -> List[Task]:
        """
        Creates multiple tasks in a single transaction.

        Args:
            task_data_list (list): List of task data dictionaries.

        Returns:
            list: Created task instances.
        """
        created_tasks = []
        for task_data in task_data_list:
            task = self.create_task(**task_data)
            created_tasks.append(task)
        return created_tasks
