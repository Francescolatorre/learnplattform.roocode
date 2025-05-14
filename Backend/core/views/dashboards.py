"""
Dashboard API views for the Learning Platform backend.

Includes:
- Instructor, admin, and student dashboard endpoints
- Dashboard summary and analytics endpoints
"""

import logging
from django.db.models import Avg, Count, Case, When, Prefetch
from django.core.cache import cache
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.exceptions import NotFound

from ..models import Course, CourseEnrollment, TaskProgress, QuizAttempt
from ..serializers import UserSerializer

logger = logging.getLogger(__name__)


class InstructorDashboardAPI(APIView):
    """
    API endpoint for instructor-specific dashboard data.
    """

    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.role != "instructor":
            return Response(
                {"error": "You do not have permission to access this resource."},
                status=403,
            )
        courses_created = Course.objects.filter(creator=request.user).count()
        students_enrolled = (
            CourseEnrollment.objects.filter(course__creator=request.user)
            .values("user")
            .distinct()
            .count()
        )
        recent_activity = (
            TaskProgress.objects.filter(task__course__creator=request.user)
            .order_by("-updated_at")[:5]
            .values("task__title", "status", "updated_at")
        )
        data = {
            "courses_created": courses_created,
            "students_enrolled": students_enrolled,
            "recent_activity": list(recent_activity),
        }
        return Response(data)


class AdminDashboardAPI(APIView):
    """
    API endpoint for admin-specific dashboard data.
    """

    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.role != "admin":
            return Response(
                {"error": "You do not have permission to access this resource."},
                status=403,
            )
        data = {
            "totalTasks": TaskProgress.objects.count(),
            "completedTasks": TaskProgress.objects.filter(status="completed").count(),
            "averageScore": QuizAttempt.objects.aggregate(Avg("score"))["score__avg"]
            or 0,
        }
        return Response(data)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def admin_dashboard_summary(request):
    """
    API endpoint for admin dashboard summary.
    """
    if request.user.role != "admin":
        return Response(
            {"error": "You do not have permission to access this resource."},
            status=403,
        )
    data = {
        "total_completed_tasks": TaskProgress.objects.filter(
            status="completed"
        ).count(),
        "total_tasks": TaskProgress.objects.count(),
        "overall_average_score": QuizAttempt.objects.aggregate(Avg("score"))[
            "score__avg"
        ]
        or 0,
        "overall_completion_percentage": (
            (
                TaskProgress.objects.filter(status="completed").count()
                / TaskProgress.objects.count()
            )
            * 100
            if TaskProgress.objects.count() > 0
            else 0
        ),
        "total_time_spent": TaskProgress.objects.aggregate(
            total_time=models.Sum("time_spent")
        )["total_time"]
        or 0,
    }
    return Response(data)


class StudentDashboardAPI(APIView):
    """
    API endpoint for student-specific dashboard data.
    Returns a comprehensive overview of student's courses, progress, and recent activity.
    """

    permission_classes = [IsAuthenticated]

    def get(self, request, pk=None):
        try:
            user = (
                request.user
                if pk is None
                else UserSerializer.Meta.model.objects.get(id=pk)
            )
            if user != request.user and not (
                request.user.is_staff
                or request.user.groups.filter(name__in=["instructor", "admin"]).exists()
            ):
                return Response(
                    {"error": "You do not have permission to view this dashboard"},
                    status=403,
                )
            cache_key = f"student_dashboard_{user.id}"
            cached_data = cache.get(cache_key)
            if cached_data:
                return Response(cached_data)
            enrolled_courses = (
                CourseEnrollment.objects.filter(user=user)
                .select_related("course")
                .prefetch_related(
                    "course__learning_tasks",
                    Prefetch(
                        "course__learning_tasks__progress",
                        queryset=TaskProgress.objects.filter(user=user),
                        to_attr="user_progress",
                    ),
                )
                .order_by("-enrollment_date")
            )
            quiz_performance = (
                QuizAttempt.objects.filter(user=user, completion_status="completed")
                .values("quiz__course")
                .annotate(
                    avg_score=Avg("score"),
                    total_attempts=Count("id"),
                    passed_count=Count(
                        Case(When(completion_status="completed", then=1))
                    ),
                )
            )
            courses_data = []
            total_tasks = 0
            completed_tasks = 0
            for enrollment in enrolled_courses:
                course = enrollment.course
                course_tasks = course.learning_tasks.all()
                course_total_tasks = len(course_tasks)
                total_tasks += course_total_tasks
                course_completed_tasks = sum(
                    1
                    for task in course_tasks
                    if any(
                        p.status == "completed"
                        for p in getattr(task, "user_progress", [])
                    )
                )
                completed_tasks += course_completed_tasks
                course_quiz_perf = next(
                    (qp for qp in quiz_performance if qp["quiz__course"] == course.id),
                    {"avg_score": 0, "total_attempts": 0, "passed_count": 0},
                )
                courses_data.append(
                    {
                        "course_id": course.id,
                        "course_title": course.title,
                        "enrollment_date": enrollment.enrollment_date,
                        "enrollment_status": enrollment.status,
                        "progress": {
                            "completed_tasks": course_completed_tasks,
                            "total_tasks": course_total_tasks,
                            "completion_percentage": round(
                                (
                                    (course_completed_tasks / course_total_tasks * 100)
                                    if course_total_tasks > 0
                                    else 0
                                ),
                                2,
                            ),
                        },
                        "quiz_performance": {
                            "average_score": round(
                                course_quiz_perf["avg_score"] or 0, 2
                            ),
                            "total_attempts": course_quiz_perf["total_attempts"],
                            "passed_count": course_quiz_perf["passed_count"],
                        },
                    }
                )
            recent_activity = (
                TaskProgress.objects.filter(user=user)
                .select_related("task", "task__course")
                .order_by("-updated_at")[:5]
            )
            dashboard_data = {
                "user_info": {
                    "id": user.id,
                    "username": user.username,
                    "email": user.email,
                    "full_name": f"{user.first_name} {user.last_name}".strip(),
                },
                "courses": courses_data,
                "progress": {
                    "overall_progress": round(
                        (completed_tasks / total_tasks * 100) if total_tasks > 0 else 0,
                        2,
                    ),
                    "total_tasks": total_tasks,
                    "completed_tasks": completed_tasks,
                },
                "quiz_performance": {
                    "average_score": round(
                        quiz_performance.aggregate(Avg("avg_score"))["avg_score__avg"]
                        or 0,
                        2,
                    ),
                    "total_attempts": quiz_performance.count(),
                },
                "recent_activity": [
                    {
                        "task_id": activity.task.id,
                        "task_title": activity.task.title,
                        "course_title": activity.task.course.title,
                        "status": activity.status,
                        "updated_at": activity.updated_at,
                    }
                    for activity in recent_activity
                ],
            }
            cache.set(cache_key, dashboard_data, 15 * 60)
            return Response(dashboard_data)
        except UserSerializer.Meta.model.DoesNotExist:
            return Response({"error": "User not found"}, status=404)
        except Exception as e:
            logger.error(
                "Error in StudentDashboardAPI for user %s: %s",
                pk or request.user.id,
                str(e),
            )
            return Response({"error": "An unexpected error occurred"}, status=500)
