from typing import Optional, Dict, Any
from django.utils import timezone
from django.db import transaction
from django.core.exceptions import ValidationError
from django.conf import settings
from learning.models import CourseVersion

class VersionControlService:
    """
    Service for managing course version control operations.
    Handles version tracking, comparison, and rollback functionality.
    """

    def __init__(self, course):
        self.course = course

    @transaction.atomic
    def create_version(self, user, notes: str = "") -> 'CourseVersion':
        """
        Creates a new version of the course with version metadata.
        
        Args:
            user: The user creating the version
            notes: Optional notes about the version changes
            
        Returns:
            CourseVersion: The newly created version
        """
        
        # Increment version number
        new_version_number = self.course.version + 1
        
        # Create version snapshot
        version = CourseVersion.objects.create(
            course=self.course,
            version_number=new_version_number,
            created_by=user,
            notes=notes,
            content_snapshot=self._create_content_snapshot()
        )
        
        # Update course version
        self.course.version = new_version_number
        self.course.save()
        
        return version

    def _create_content_snapshot(self) -> Dict[str, Any]:
        """
        Creates a snapshot of the current course content.
        
        Returns:
            Dict containing the course content snapshot
        """
        return {
            'title': self.course.title,
            'description': self.course.description,
            'learning_objectives': self.course.learning_objectives,
            'prerequisites': self.course.prerequisites,
            'status': self.course.status,
            'visibility': self.course.visibility,
            'tasks': list(self.course.tasks.values_list('id', flat=True))
        }

    def get_version_history(self):
        """
        Retrieves the complete version history of the course.
        
        Returns:
            QuerySet of CourseVersion objects
        """
        from learning.models import CourseVersion
        return CourseVersion.objects.filter(course=self.course).order_by('-version_number')

    def compare_versions(self, version1_number: int, version2_number: int) -> Dict[str, Any]:
        """
        Compares two versions of the course and returns the differences.
        
        Args:
            version1_number: First version number to compare
            version2_number: Second version number to compare
            
        Returns:
            Dict containing the differences between versions
        """
        
        try:
            version1 = CourseVersion.objects.get(
                course=self.course, 
                version_number=version1_number
            )
            version2 = CourseVersion.objects.get(
                course=self.course, 
                version_number=version2_number
            )
        except CourseVersion.DoesNotExist:
            raise ValidationError("One or both versions do not exist")

        return self._compare_snapshots(version1.content_snapshot, version2.content_snapshot)

    def _compare_snapshots(self, snapshot1: Dict[str, Any], snapshot2: Dict[str, Any]) -> Dict[str, Any]:
        """
        Compares two content snapshots and returns the differences.
        
        Args:
            snapshot1: First snapshot to compare
            snapshot2: Second snapshot to compare
            
        Returns:
            Dict containing the differences between snapshots
        """
        differences = {}
        
        for key in snapshot1.keys():
            if snapshot1[key] != snapshot2.get(key):
                differences[key] = {
                    'old': snapshot1[key],
                    'new': snapshot2.get(key)
                }
        
        return differences

    @transaction.atomic
    def rollback_to_version(self, version_number: int, user, reason: str = "") -> None:
        """
        Rolls back the course to a specific version.
        
        Args:
            version_number: Version number to roll back to
            user: User performing the rollback
            reason: Reason for the rollback
            
        Raises:
            ValidationError: If version doesn't exist or rollback is invalid
        """
        
        try:
            target_version = CourseVersion.objects.get(
                course=self.course,
                version_number=version_number
            )
        except CourseVersion.DoesNotExist:
            raise ValidationError(f"Version {version_number} does not exist")

        if version_number >= self.course.version:
            raise ValidationError("Cannot rollback to same or newer version")

        # Create new version for rollback
        rollback_notes = f"Rollback to version {version_number}. Reason: {reason}"
        self.create_version(user, rollback_notes)
        
        # Restore content from target version
        snapshot = target_version.content_snapshot
        self._restore_from_snapshot(snapshot)

    def _restore_from_snapshot(self, snapshot: Dict[str, Any]) -> None:
        """
        Restores course content from a snapshot.
        
        Args:
            snapshot: Content snapshot to restore from
        """
        for key, value in snapshot.items():
            if key != 'tasks':  # Handle tasks separately
                setattr(self.course, key, value)
        
        # Restore tasks
        self.course.tasks.set(snapshot['tasks'])
        self.course.save()

    def validate_version_operation(self, operation: str) -> bool:
        """
        Validates if a version control operation is allowed.
        
        Args:
            operation: The operation to validate
            
        Returns:
            bool: Whether the operation is allowed
        """
        if operation == 'rollback':
            return self.course.status != self.course.Status.PUBLISHED
        return True