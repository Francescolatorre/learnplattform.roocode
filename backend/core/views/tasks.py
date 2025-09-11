"""
Learning task management API views for the Learning Platform backend.

Includes:
- CRUD operations for learning tasks
- Task progress endpoints
"""

import logging

from django.core.exceptions import PermissionDenied
from django.db.models import Count, Q
from django.utils import timezone
from rest_framework import permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from ..models import AuditLog, LearningTask, TaskProgress
from ..serializers import LearningTaskSerializer, TaskProgressSerializer

logger = logging.getLogger(__name__)


def create_audit_log(
    user, action, entity_type, entity_id, entity_name="", details=None, request=None
):
    """
    Utility function to create audit log entries.
    """
    ip_address = None
    if request:
        x_forwarded_for = request.META.get("HTTP_X_FORWARDED_FOR")
        if x_forwarded_for:
            ip_address = x_forwarded_for.split(",")[0]
        else:
            ip_address = request.META.get("REMOTE_ADDR")

    AuditLog.objects.create(
        user=user,
        action=action,
        entity_type=entity_type,
        entity_id=str(entity_id),
        entity_name=entity_name,
        details=details or {},
        ip_address=ip_address,
    )


class LearningTaskViewSet(viewsets.ModelViewSet):
    """
    API endpoint for learning tasks
    """

    queryset = LearningTask.objects.all()
    serializer_class = LearningTaskSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """
        Filter queryset based on user role and permissions:
        - Exclude soft-deleted tasks by default
        - Admins and staff see all non-deleted tasks
        - Instructors see all non-deleted tasks in their courses
        - Students only see published, non-deleted tasks
        """
        queryset = LearningTask.objects.filter(is_deleted=False)
        course_id = self.request.query_params.get("course")
        if course_id is not None:
            queryset = queryset.filter(course_id=course_id)
        if self.request.user.is_staff or self.request.user.is_superuser:
            pass
        elif getattr(self.request.user, "role", None) == "instructor":
            queryset = queryset.filter(course__creator=self.request.user)
        else:
            queryset = queryset.filter(is_published=True)
        return queryset

    def destroy(self, request, *args, **kwargs):
        """
        Override destroy to check if task has student progress before deletion.
        Only allow deletion if no students have started the task.
        """
        instance = self.get_object()

        # Check permissions - must be instructor/admin and course creator
        if not (
            request.user.is_staff
            or request.user.is_superuser
            or (
                hasattr(request.user, "role")
                and request.user.role in ["instructor", "admin"]
                and instance.course.creator == request.user
            )
        ):
            raise PermissionDenied("You don't have permission to delete this task.")

        # Check if any students have progress on this task
        progress_count = (
            TaskProgress.objects.filter(task=instance)
            .exclude(status="not_started")
            .count()
        )

        if progress_count > 0:
            # Get detailed counts for the error message
            in_progress = TaskProgress.objects.filter(
                task=instance, status="in_progress"
            ).count()
            completed = TaskProgress.objects.filter(
                task=instance, status="completed"
            ).count()

            return Response(
                {
                    "error": "Cannot delete task with student progress",
                    "message": f"Task has student progress: {in_progress} in progress, {completed} completed",
                    "students_affected": progress_count,
                    "can_delete": False,
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # If no progress, perform soft delete
        instance.is_deleted = True
        instance.deleted_at = timezone.now()
        instance.save()

        # Create audit log entry
        create_audit_log(
            user=request.user,
            action="task_deleted",
            entity_type="LearningTask",
            entity_id=instance.id,
            entity_name=instance.title,
            details={
                "course_id": instance.course.id,
                "course_title": instance.course.title,
                "task_order": instance.order,
                "was_published": instance.is_published,
                "deletion_method": "soft_delete",
            },
            request=request,
        )

        logger.info(
            f"Task {instance.id} '{instance.title}' soft deleted by user {request.user.id}"
        )

        return Response(
            {
                "message": "Task deleted successfully",
                "task_id": instance.id,
                "deleted_at": instance.deleted_at,
            },
            status=status.HTTP_200_OK,
        )

    @action(detail=False, methods=["post"], url_path="progress-counts")
    def progress_counts(self, request):
        """
        Get progress counts for multiple tasks (for UI deletion authorization).
        Expects: {"task_ids": [1, 2, 3, ...]}
        Returns: {"task_id": {"in_progress": count, "completed": count}, ...}
        """
        task_ids = request.data.get("task_ids", [])
        if not task_ids:
            return Response(
                {"error": "task_ids required"}, status=status.HTTP_400_BAD_REQUEST
            )

        # Filter tasks to those the user can access (same logic as get_queryset)
        queryset = self.get_queryset().filter(id__in=task_ids)

        result = {}
        for task in queryset:
            progress_counts = TaskProgress.objects.filter(task=task).aggregate(
                in_progress=Count("id", filter=Q(status="in_progress")),
                completed=Count("id", filter=Q(status="completed")),
            )
            result[str(task.id)] = {
                "in_progress": progress_counts["in_progress"] or 0,
                "completed": progress_counts["completed"] or 0,
            }

        return Response(result)

    @action(detail=False, methods=["get"], url_path="course/(?P<course_id>[^/.]+)")
    def tasks_by_course(self, request, course_id=None):
        """
        Fetch tasks for a specific course.
        """
        try:
            tasks = self.get_queryset().filter(course_id=course_id).order_by("order")
            if not tasks.exists():
                return Response(
                    {"error": "No tasks found for this course."}, status=404
                )
            serializer = self.get_serializer(tasks, many=True)
            return Response(serializer.data)
        except Exception as e:
            logger.error(
                "Error fetching tasks for course %s: %s",
                course_id,
                str(e),
                exc_info=True,
            )
            return Response(
                {"error": "An unexpected error occurred while fetching tasks."},
                status=500,
            )


class TaskProgressViewSet(viewsets.ModelViewSet):
    """
    API endpoint for task progress
    """

    queryset = TaskProgress.objects.all()
    serializer_class = TaskProgressSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Filter progress to only show those belonging to the current user
        return TaskProgress.objects.filter(user=self.request.user)

    def partial_update(self, request, *args, **kwargs):
        # Allow updating the status of a task
        instance = self.get_object()
        instance.status = request.data.get("status", instance.status)
        instance.save()
        return Response({"status": "Task progress updated"})


class UserTaskProgressAPI(APIView):
    """
    API endpoint to retrieve task progress for the authenticated user.
    """

    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        task_progress = TaskProgress.objects.filter(user=user)
        data = [{"task_id": tp.task.id, "status": tp.status} for tp in task_progress]
        return Response(data)
