"""
This module provides the VersionControlService class for managing version control
of Course instances in a Django application. It includes functionality to create
new versions, compare versions, retrieve version history, and rollback to a specific
version.

Classes:
    VersionControlService: A service class for handling version control operations
    on Course instances.

Exceptions:
    VersionControlError: Custom exception raised when version control operations
    encounter errors.
"""

from django.core.exceptions import ObjectDoesNotExist
from django.db import transaction
from django.utils import timezone

from core.services.exceptions import VersionControlError
from learning.models import Course, CourseVersion

# Define DoesNotExist exception for CourseVersion
CourseVersion.DoesNotExist = ObjectDoesNotExist

class VersionControlService:
    """
    A service class for handling version control operations on Course instances.

    Attributes:
        course (Course): The Course instance to manage.
    """

    def __init__(self, course):
        """
        Initialize the VersionControlService with a specific Course instance.

        Args:
            course (Course): The Course instance to manage.
        """
        self.course = course

    def create_new_version(self, created_by, notes=""):
        """
        Create a new version of the course.

        Args:
            created_by (User): The user creating the new version.
            notes (str): Optional notes about the new version.

        Returns:
            CourseVersion: The newly created CourseVersion instance.
        """
        with transaction.atomic():
            latest_version = self.course.courseversion_set.order_by(
                "-version_number"
            ).first()
            new_version_number = (
                latest_version.version_number + 1 if latest_version else 1
            )

            new_version = CourseVersion.objects.create(
                course=self.course,
                version_number=new_version_number,
                created_at=timezone.now(),
                created_by=created_by,
                notes=notes,
                content_snapshot=self.course.serialize_content(),
            )
            return new_version

    def compare_versions(self, version1, version2):
        """
        Compare two versions of the course.

        Args:
            version1 (CourseVersion): The first version to compare.
            version2 (CourseVersion): The second version to compare.

        Returns:
            str: A string describing the comparison result.
        """
        if version1.version_number == version2.version_number:
            return "Versions are identical."
        elif version1.version_number > version2.version_number:
            return "Version {} is newer than version {}.".format(
                version1.version_number, version2.version_number
            )
        else:
            return "Version {} is older than version {}.".format(
                version1.version_number, version2.version_number
            )

    def get_version_history(self):
        """
        Retrieve the version history of the course.

        Returns:
            QuerySet: A QuerySet of CourseVersion instances ordered by version number.
        """
        return self.course.courseversion_set.order_by("version_number")

    def rollback_to_version(self, version_number):
        """
        Rollback the course to a specified version.

        Args:
            version_number (int): The version number to rollback to.

        Returns:
            CourseVersion: The course version object corresponding to the specified version number.

        Raises:
            VersionControlError: If the specified version number does not exist.
        """
        with transaction.atomic():
            try:
                version = self.course.courseversion_set.get(
                    version_number=version_number
                )
                self.course.deserialize_content(version.content_snapshot)
                self.course.save()
                return version
            except CourseVersion.DoesNotExist as exc:
                raise VersionControlError(
                    f"Version {version_number} does not exist."
                ) from exc
