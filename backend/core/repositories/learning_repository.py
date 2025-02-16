"""
Repository for learning-related database operations.
"""
from typing import List, Optional
from django.db import transaction
from django.core.exceptions import ObjectDoesNotExist

from learning.models import Course
from tasks.models import LearningTask

class LearningRepository:
    """
    Handles database operations for courses and learning-related entities.
    """

    def get_courses(self):
        """
        Retrieves all courses.

        Returns:
            QuerySet[Course]: A queryset of all courses.
        """
        return Course.objects.all()

    def get_course_by_id(self, course_id: int) -> Course:
        """
        Retrieves a specific course by ID.

        Args:
            course_id (int): The ID of the course.

        Returns:
            Course: The requested course.

        Raises:
            ObjectDoesNotExist: If the course doesn't exist.
        """
        return Course.objects.get(id=course_id)

    def create_course(self, **course_data) -> Course:
        """
        Creates a new course.

        Args:
            **course_data: Course fields including title, description,
                          and instructor.

        Returns:
            Course: The created course.
        """
        return Course.objects.create(**course_data)

    def update_course(self, course_id: int, **updates) -> Course:
        """
        Updates a course.

        Args:
            course_id (int): The ID of the course to update.
            **updates: Fields to update.

        Returns:
            Course: The updated course.

        Raises:
            ObjectDoesNotExist: If the course doesn't exist.
        """
        course = self.get_course_by_id(course_id)
        for field, value in updates.items():
            setattr(course, field, value)
        course.save()
        return course

    def delete_course(self, course_id: int) -> None:
        """
        Deletes a course.

        Args:
            course_id (int): The ID of the course to delete.

        Raises:
            ObjectDoesNotExist: If the course doesn't exist.
        """
        course = self.get_course_by_id(course_id)
        course.delete()

    def add_task_to_course(self, course_id: int, task_id: int) -> None:
        """
        Adds a learning task to a course.

        Args:
            course_id (int): The ID of the course.
            task_id (int): The ID of the task to add.

        Raises:
            ObjectDoesNotExist: If either the course or task doesn't exist.
        """
        course = self.get_course_by_id(course_id)
        task = LearningTask.objects.get(id=task_id)
        course.tasks.add(task)

    def remove_task_from_course(self, course_id: int, task_id: int) -> None:
        """
        Removes a learning task from a course.

        Args:
            course_id (int): The ID of the course.
            task_id (int): The ID of the task to remove.

        Raises:
            ObjectDoesNotExist: If either the course or task doesn't exist.
        """
        course = self.get_course_by_id(course_id)
        task = LearningTask.objects.get(id=task_id)
        course.tasks.remove(task)

    def get_instructor_courses(self, instructor_id: int):
        """
        Retrieves all courses for a specific instructor.

        Args:
            instructor_id (int): The ID of the instructor.

        Returns:
            QuerySet[Course]: A queryset of courses taught by the instructor.
        """
        return Course.objects.filter(instructor_id=instructor_id)

    def get_course_tasks(self, course_id: int):
        """
        Retrieves all tasks for a specific course.

        Args:
            course_id (int): The ID of the course.

        Returns:
            QuerySet[LearningTask]: A queryset of tasks associated with the course.

        Raises:
            ObjectDoesNotExist: If the course doesn't exist.
        """
        course = self.get_course_by_id(course_id)
        return course.tasks.all()

    @transaction.atomic
    def bulk_create_courses(self, course_data_list: List[dict]) -> List[Course]:
        """
        Creates multiple courses in a single transaction.

        Args:
            course_data_list (List[dict]): List of course data dictionaries.

        Returns:
            List[Course]: List of created course instances.
        """
        created_courses = []
        for course_data in course_data_list:
            course = self.create_course(**course_data)
            created_courses.append(course)
        return created_courses

    def get_courses_by_criteria(self, **filters):
        """
        Retrieves courses based on multiple criteria.

        Args:
            **filters: Filter criteria to apply.

        Returns:
            QuerySet[Course]: Courses matching the criteria.
        """
        return Course.objects.filter(**filters)

    def get_course_with_tasks_count(self, course_id: int) -> tuple:
        """
        Retrieves a course along with its total task count.

        Args:
            course_id (int): The ID of the course.

        Returns:
            tuple: (Course, int) The course and its total task count.

        Raises:
            ObjectDoesNotExist: If the course doesn't exist.
        """
        course = self.get_course_by_id(course_id)
        task_count = course.get_total_tasks()
        return course, task_count