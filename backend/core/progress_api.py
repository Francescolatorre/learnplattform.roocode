import logging  # Add a logger for this module

from django.core.cache import cache
from django.db.models import Avg
from django.shortcuts import get_object_or_404  # Used in analytics methods
from django.utils import timezone
from rest_framework import filters, permissions
from rest_framework.decorators import action
from rest_framework.exceptions import (
    ValidationError,
)  # Import for raising validation errors
from rest_framework.permissions import IsAuthenticated  # Ensure correct import
from rest_framework.response import Response
from rest_framework.views import APIView  # Base class for analytics views

from .base_viewset import BaseViewSet  # Import the base viewset
from .models import QuizQuestion  # Added QuizQuestion import
from .models import (
    Course,
    CourseEnrollment,
    LearningTask,
    QuizAttempt,
    QuizResponse,
    QuizTask,
    TaskProgress,
    User,
)
from .serializers import (
    CourseEnrollmentSerializer,
    QuizAttemptSerializer,
    QuizResponseSerializer,
    TaskProgressSerializer,
)


# Custom permissions
class IsInstructorOrAdmin(permissions.BasePermission):
    """
    Custom permission to only allow instructors or admins to access a view.
    """

    def has_permission(self, request, view):
        # Safely check user role and staff status
        if not request.user.is_authenticated:
            return False

        # Check if user has a role attribute, if not, default to False
        user_role = getattr(request.user, "role", "")
        is_staff = getattr(request.user, "is_staff", False)
        # add logging
        print(f"User role: {user_role}, Is staff: {is_staff}")

        return user_role in ["instructor", "admin"] or is_staff


class IsEnrolledInCourse(permissions.BasePermission):
    """
    Custom permission to only allow students enrolled in a course to access its data.
    """

    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            logger.info("Permission denied: User is not authenticated.")
            return False

        # Safely check user role and staff status
        user_role = getattr(request.user, "role", "")
        is_staff = getattr(request.user, "is_staff", False)

        logger.info(
            f"Checking permissions for user {request.user.id}: role={user_role}, is_staff={is_staff}"
        )

        # Admin and instructors can access all courses
        if user_role in ["instructor", "admin"] or is_staff:
            logger.info(
                f"Permission granted: User {request.user.id} is an instructor/admin/staff."
            )
            return True

        # For students, check if they're enrolled in the course
        course_id = view.kwargs.get("pk") or request.GET.get("course")
        if not course_id:
            logger.warning(
                f"Permission denied: No course ID provided for user {request.user.id}."
            )
            return False

        is_enrolled = CourseEnrollment.objects.filter(
            user=request.user, course_id=course_id
        ).exists()

        if is_enrolled:
            logger.info(
                f"Permission granted: User {request.user.id} is enrolled in course {course_id}."
            )
        else:
            logger.warning(
                f"Permission denied: User {request.user.id} is not enrolled in course {course_id}."
            )

        return is_enrolled


# Enhanced viewsets with filtering
class EnhancedCourseEnrollmentViewSet(BaseViewSet):
    """
    API endpoint for course enrollments with enhanced filtering and analytics.
    """

    queryset = CourseEnrollment.objects.select_related("user", "course").all()
    serializer_class = CourseEnrollmentSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["course__title", "status"]
    ordering_fields = ["enrollment_date", "status"]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=True, methods=["patch"])
    def update_status(self, request, pk=None):
        """
        Update the enrollment status (active, completed, dropped).
        """
        enrollment = self.get_object()
        status = request.data.get("status")

        if status not in ["active", "completed", "dropped"]:
            raise ValidationError(
                "Invalid status. Must be one of: active, completed, dropped"
            )

        enrollment.status = status
        enrollment.save()

        serializer = self.get_serializer(enrollment)
        return Response(serializer.data)


class EnhancedTaskProgressViewSet(BaseViewSet):
    """
    API endpoint for task progress tracking.
    """

    queryset = TaskProgress.objects.select_related("user", "task").all()
    serializer_class = TaskProgressSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=True, methods=["patch"])
    def update_status(self, request, pk=None):
        """
        Update the task progress status (not_started, in_progress, completed).
        """
        progress = self.get_object()
        status = request.data.get("status")

        if status not in ["not_started", "in_progress", "completed"]:
            raise ValidationError(
                "Invalid status. Must be one of: not_started, in_progress, completed"
            )

        # Set start_date when task is started
        if status == "in_progress" and not progress.start_date:
            progress.start_date = timezone.now()

        progress.status = status

        # Update completion date if status is completed
        if status == "completed" and not progress.completion_date:
            progress.completion_date = timezone.now()

        progress.save()

        serializer = self.get_serializer(progress)
        return Response(serializer.data)


class EnhancedQuizAttemptViewSet(BaseViewSet):
    """
    API endpoint for quiz attempts with enhanced filtering and analytics.
    """

    queryset = QuizAttempt.objects.select_related("user", "quiz").all()
    serializer_class = QuizAttemptSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["quiz__title"]
    ordering_fields = ["attempt_date", "score"]

    def perform_create(self, serializer):
        """
        Create a new quiz attempt and set the user to the current user.
        """
        quiz_id = self.request.data.get("quiz")
        if not quiz_id:
            raise ValidationError("Quiz ID is required.")

        quiz = get_object_or_404(QuizTask, id=quiz_id)

        # Count existing attempts
        attempt_count = QuizAttempt.objects.filter(
            user=self.request.user, quiz=quiz
        ).count()

        # Check if max attempts reached
        if quiz.max_attempts and attempt_count >= quiz.max_attempts:
            raise ValidationError(
                f"Maximum number of attempts ({quiz.max_attempts}) reached"
            )

        serializer.save(user=self.request.user, attempt_date=timezone.now())

    @action(detail=True, methods=["post"])
    def submit_responses(self, request, pk=None):
        """
        Submit responses for a quiz attempt and calculate the score
        """
        quiz_attempt = self.get_object()

        # Check if the attempt is already submitted
        if quiz_attempt.completion_status == "completed":
            return Response(
                {"error": "This quiz attempt has already been submitted"}, status=400
            )

        # Get the responses from the request
        responses_data = request.data.get("responses", [])

        # Create QuizResponse objects for each response
        for response_data in responses_data:
            question_id = response_data.get("question")
            selected_option_id = response_data.get("selected_option")

            # Get the question to check if the answer is correct
            question = get_object_or_404(QuizQuestion, id=question_id)

            # Find the correct option for this question
            correct_option = question.options.filter(is_correct=True).first()

            # Create the response
            QuizResponse.objects.create(
                quiz_attempt=quiz_attempt,
                question_id=question_id,
                selected_option_id=selected_option_id,
                is_correct=(
                    selected_option_id == correct_option.id if correct_option else False
                ),
            )

        # Calculate the score
        total_responses = QuizResponse.objects.filter(quiz_attempt=quiz_attempt).count()
        correct_responses = QuizResponse.objects.filter(
            quiz_attempt=quiz_attempt, is_correct=True
        ).count()

        if total_responses > 0:
            score_percentage = (correct_responses / total_responses) * 100
        else:
            score_percentage = 0

        # Update the quiz attempt
        quiz_attempt.score = score_percentage
        quiz_attempt.completion_status = "completed"
        quiz_attempt.attempt_date = timezone.now()
        quiz_attempt.save()

        # Return the updated quiz attempt
        serializer = self.get_serializer(quiz_attempt)
        return Response(serializer.data)

    @action(detail=True, methods=["get"])
    def responses(self, request, pk=None):
        """
        Get all responses for a specific quiz attempt
        """
        quiz_attempt = self.get_object()

        # Check if the user has permission to view these responses
        if (
            not self._is_admin_or_instructor(request.user)
            and request.user != quiz_attempt.user
        ):
            return Response(
                {"error": "You do not have permission to view these responses"},
                status=403,
            )

        # Get the responses
        responses = QuizResponse.objects.filter(quiz_attempt=quiz_attempt)
        serializer = QuizResponseSerializer(responses, many=True)

        return Response(serializer.data)


class CourseAnalyticsAPI(APIView):
    """
    API endpoint for retrieving analytics data for a specific course.
    Provides aggregated statistics about student performance, completion rates,
    and overall engagement.
    """

    permission_classes = [permissions.IsAuthenticated, IsInstructorOrAdmin]

    def get(self, request, pk=None):
        """
        Get aggregated analytics for a course

        Returns:
            - enrollment_stats: enrollment counts and trends
            - completion_rates: overall and module completion percentages
            - average_scores: average scores for different task types
            - engagement_metrics: time spent, submission rates, etc.
            - time_distribution: how students distribute their time across modules
            - difficulty_assessment: identification of challenging content
        """
        course = get_object_or_404(Course, pk=pk)

        # Try to get cached data first
        cache_key = f"course_analytics_{pk}"
        cached_data = cache.get(cache_key)

        if cached_data:
            return Response(cached_data)

        # Calculate enrollment statistics
        total_enrollments = CourseEnrollment.objects.filter(course=course).count()
        active_enrollments = CourseEnrollment.objects.filter(
            course=course, status="active"
        ).count()
        completed_enrollments = CourseEnrollment.objects.filter(
            course=course, status="completed"
        ).count()
        dropped_enrollments = CourseEnrollment.objects.filter(
            course=course, status="dropped"
        ).count()

        # Calculate completion rates
        all_tasks = LearningTask.objects.filter(course=course)
        total_tasks = all_tasks.count()

        # Get all task progress records for this course
        task_progress_records = TaskProgress.objects.filter(
            task__course=course
        ).select_related("user", "task")

        # Group task progress by user to calculate completion rate per student
        user_progress = {}
        for progress in task_progress_records:
            user_id = progress.user_id
            if user_id not in user_progress:
                user_progress[user_id] = {"completed": 0, "total": total_tasks}

            if progress.status == "completed":
                user_progress[user_id]["completed"] += 1

        # Calculate average completion rate
        completion_rates = []
        for user_id, progress in user_progress.items():
            if progress["total"] > 0:
                completion_rate = (progress["completed"] / progress["total"]) * 100
                completion_rates.append(completion_rate)

        avg_completion_rate = (
            sum(completion_rates) / len(completion_rates) if completion_rates else 0
        )

        # Calculate average scores for quiz tasks
        quiz_attempts = QuizAttempt.objects.filter(
            quiz__course=course, completion_status="completed"
        )

        avg_quiz_score = quiz_attempts.aggregate(Avg("score"))["score__avg"] or 0

        # Task type distribution
        task_types = {
            "reading": LearningTask.objects.filter(
                course=course, type="reading"
            ).count(),
            "video": LearningTask.objects.filter(course=course, type="video").count(),
            "quiz": QuizTask.objects.filter(course=course).count(),
            "assignment": LearningTask.objects.filter(
                course=course, type="assignment"
            ).count(),
            "discussion": LearningTask.objects.filter(
                course=course, type="discussion"
            ).count(),
        }

        # Identify challenging content
        # Get questions with low success rates
        challenging_questions = []
        quiz_tasks = QuizTask.objects.filter(course=course)

        for quiz in quiz_tasks:
            questions = QuizQuestion.objects.filter(quiz=quiz)

            for question in questions:
                # Calculate success rate for this question
                total_responses = QuizResponse.objects.filter(question=question).count()

                correct_responses = QuizResponse.objects.filter(
                    question=question, is_correct=True
                ).count()

                if total_responses > 0:
                    success_rate = (correct_responses / total_responses) * 100

                    # If success rate is below 50%, consider it challenging
                    if (
                        success_rate < 50 and total_responses >= 5
                    ):  # Only consider questions with sufficient attempts
                        challenging_questions.append(
                            {
                                "id": question.id,
                                "text": question.text,
                                "quiz": quiz.title,
                                "success_rate": round(success_rate, 2),
                                "total_attempts": total_responses,
                            }
                        )

        # Sort challenging questions by success rate (ascending)
        challenging_questions.sort(key=lambda x: x["success_rate"])

        # Compile results
        analytics_data = {
            "enrollment_stats": {
                "total": total_enrollments,
                "active": active_enrollments,
                "completed": completed_enrollments,
                "dropped": dropped_enrollments,
                "completion_percentage": (
                    round((completed_enrollments / total_enrollments * 100), 2)
                    if total_enrollments > 0
                    else 0
                ),
            },
            "completion_rates": {
                "average": round(avg_completion_rate, 2),
                "distribution": {
                    "below_25": len([r for r in completion_rates if r < 25]),
                    "25_to_50": len([r for r in completion_rates if 25 <= r < 50]),
                    "50_to_75": len([r for r in completion_rates if 50 <= r < 75]),
                    "above_75": len([r for r in completion_rates if r >= 75]),
                },
            },
            "average_scores": {"quizzes": round(avg_quiz_score, 2)},
            "content_distribution": task_types,
            "challenging_content": {
                "questions": challenging_questions[
                    :10
                ]  # Top 10 most challenging questions
            },
        }

        # Cache the analytics data for 1 hour
        cache.set(cache_key, analytics_data, 60 * 60)

        return Response(analytics_data)


logger = logging.getLogger(__name__)  # Add a logger for this module


class CourseStudentProgressAPI(APIView):
    """
    API endpoint for retrieving detailed progress data for all students in a specific course.
    Provides individualized statistics about student performance, task completion,
    and engagement levels for instructors and administrators.
    """

    permission_classes = [permissions.IsAuthenticated]

    def get_permissions(self):
        """
        Allow students to access their own progress and instructors/admins to access all progress.
        """
        user_role = getattr(self.request.user, "role", "")
        logger.info(
            f"[CourseStudentProgressAPI] Checking permissions for user {self.request.user.id} with role '{user_role}'"
        )
        if user_role == "student":
            return [permissions.IsAuthenticated(), IsEnrolledInCourse()]
        elif user_role in ["instructor", "admin"]:
            return [permissions.IsAuthenticated(), IsInstructorOrAdmin()]
        return [permissions.IsAuthenticated()]

    def get(self, request, pk=None):
        logger.info(
            f"[CourseStudentProgressAPI] Received request for course progress. User: {request.user.id}, Course ID: {pk}"
        )
        try:
            course = get_object_or_404(Course, pk=pk)
            logger.info(
                f"[CourseStudentProgressAPI] Course found: {course.title} (ID: {course.id})"
            )

            # If the user is a student, ensure they are enrolled in the course
            if request.user.role == "student":
                logger.info(
                    f"[CourseStudentProgressAPI] User {request.user.id} is a student. Checking enrollment."
                )
                if not CourseEnrollment.objects.filter(
                    user=request.user, course=course
                ).exists():
                    logger.warning(
                        f"[CourseStudentProgressAPI] Permission denied for user {request.user.id}. "
                        f"User is not enrolled in course {course.id}."
                    )
                    return Response(
                        {
                            "error": "You do not have permission to view this course's progress."
                        },
                        status=403,
                    )

                logger.info(
                    f"[CourseStudentProgressAPI] User {request.user.id} is enrolled in course {course.id}. Retrieving progress."
                )
                # Return only the student's own progress
                user_task_progress = TaskProgress.objects.filter(
                    user=request.user, task__course=course
                ).select_related("task")
                total_tasks = LearningTask.objects.filter(course=course).count()
                completed_tasks = user_task_progress.filter(status="completed").count()
                completion_percentage = (
                    (completed_tasks / total_tasks) * 100 if total_tasks > 0 else 0
                )

                student_progress_data = {
                    "student_info": {
                        "id": request.user.id,
                        "username": request.user.username,
                        "email": request.user.email,
                        "full_name": f"{getattr(request.user, 'first_name', '')} {getattr(request.user, 'last_name', '')}".strip(),
                    },
                    "progress_summary": {
                        "completion_percentage": round(completion_percentage, 2),
                        "completed_tasks": completed_tasks,
                        "total_tasks": total_tasks,
                    },
                    "task_completion": [
                        {
                            "task_id": task.id,
                            "task_title": task.title,
                            "task_type": task.type,
                            "status": progress.status if progress else "not_started",
                            "completion_date": (
                                progress.completion_date if progress else None
                            ),
                        }
                        for task in LearningTask.objects.filter(course=course)
                        for progress in [user_task_progress.filter(task=task).first()]
                    ],
                }

                logger.info(
                    f"[CourseStudentProgressAPI] Progress data retrieved successfully for user {request.user.id}."
                )
                return Response(student_progress_data)

            # For instructors/admins, return progress for all students
            logger.info(
                f"[CourseStudentProgressAPI] User {request.user.id} is an instructor/admin. Retrieving progress for all students."
            )
            enrollments = CourseEnrollment.objects.filter(course=course).select_related(
                "user"
            )
            student_progress_data = []

            for enrollment in enrollments:
                user = enrollment.user
                user_task_progress = TaskProgress.objects.filter(
                    user=user, task__course=course
                ).select_related("task")
                total_tasks = LearningTask.objects.filter(course=course).count()
                completed_tasks = user_task_progress.filter(status="completed").count()
                completion_percentage = (
                    (completed_tasks / total_tasks) * 100 if total_tasks > 0 else 0
                )

                student_data = {
                    "student_info": {
                        "id": user.id,
                        "username": user.username,
                        "email": user.email,
                        "full_name": f"{getattr(user, 'first_name', '')} {getattr(user, 'last_name', '')}".strip(),
                    },
                    "progress_summary": {
                        "completion_percentage": round(completion_percentage, 2),
                        "completed_tasks": completed_tasks,
                        "total_tasks": total_tasks,
                    },
                    "task_completion": [
                        {
                            "task_id": task.id,
                            "task_title": task.title,
                            "task_type": task.type,
                            "status": progress.status if progress else "not_started",
                            "completion_date": (
                                progress.completion_date if progress else None
                            ),
                        }
                        for task in LearningTask.objects.filter(course=course)
                        for progress in [user_task_progress.filter(task=task).first()]
                    ],
                }

                student_progress_data.append(student_data)

            # Sort by completion percentage (descending)
            student_progress_data.sort(
                key=lambda x: x["progress_summary"]["completion_percentage"],
                reverse=True,
            )

            logger.info(
                f"[CourseStudentProgressAPI] Progress data retrieved successfully for course {course.id}."
            )
            return Response(student_progress_data)
        except Course.DoesNotExist:
            logger.error(
                f"[CourseStudentProgressAPI] Course with ID {pk} does not exist."
            )
            return Response({"error": "Course not found."}, status=404)
        except Exception as e:
            logger.error(
                f"[CourseStudentProgressAPI] Error fetching student progress for course {pk}: {str(e)}"
            )
            return Response(
                {"error": f"An unexpected error occurred: {str(e)}"}, status=500
            )


class CourseTaskAnalyticsAPI(APIView):
    """
    API endpoint for retrieving analytics data for tasks within a specific course.
    Provides statistics about task completion rates, time spent, and student performance.
    """

    permission_classes = [permissions.IsAuthenticated, IsInstructorOrAdmin]

    def get(self, request, pk=None):
        """
        Get analytics data for all tasks in a course

        Parameters:
            pk (int): The course ID

        Returns:
            - tasks: List of tasks with analytics data
              - completion_stats: completion rates and times
              - difficulty_assessment: estimated difficulty based on completion time
              - student_performance: aggregated performance metrics
        """
        course = get_object_or_404(Course, pk=pk)

        # Try to get cached data first
        cache_key = f"course_task_analytics_{pk}"
        cached_data = cache.get(cache_key)

        if cached_data:
            return Response(cached_data)

        # Get all tasks for this course
        tasks = LearningTask.objects.filter(course=course)

        task_analytics = []

        for task in tasks:
            # Get all progress records for this task
            task_progress_records = TaskProgress.objects.filter(task=task)

            # Calculate completion statistics
            total_attempts = task_progress_records.count()
            completed = task_progress_records.filter(status="completed").count()
            in_progress = task_progress_records.filter(status="in_progress").count()
            not_started = task_progress_records.filter(status="not_started").count()

            completion_rate = (
                (completed / total_attempts) * 100 if total_attempts > 0 else 0
            )

            # Average time to completion (for completed tasks with both start and completion dates)
            avg_completion_time = None
            completion_times = []

            for progress in task_progress_records.filter(
                status="completed",
                start_date__isnull=False,
                completion_date__isnull=False,
            ):
                completion_time = (
                    progress.completion_date - progress.start_date
                ).total_seconds() / 3600  # in hours
                completion_times.append(completion_time)

            if completion_times:
                avg_completion_time = sum(completion_times) / len(completion_times)

            # Additional analytics for quiz tasks
            quiz_data = None

            if task.type == "quiz":
                try:
                    quiz_task = QuizTask.objects.get(id=task.id)
                    quiz_attempts = QuizAttempt.objects.filter(
                        quiz=quiz_task, completion_status="completed"
                    )
                    avg_quiz_score = (
                        quiz_attempts.aggregate(Avg("score"))["score__avg"] or 0
                    )

                    # Question-level analysis
                    question_analysis = []

                    for question in QuizQuestion.objects.filter(quiz=quiz_task):
                        responses = QuizResponse.objects.filter(question=question)
                        total_responses = responses.count()
                        correct_responses = responses.filter(is_correct=True).count()

                        success_rate = (
                            (correct_responses / total_responses) * 100
                            if total_responses > 0
                            else 0
                        )

                        question_analysis.append(
                            {
                                "question_id": question.id,
                                "text": question.text,
                                "success_rate": round(success_rate, 2),
                                "total_responses": total_responses,
                            }
                        )

                    quiz_data = {
                        "average_score": round(avg_quiz_score, 2),
                        "total_attempts": quiz_attempts.count(),
                        "question_analysis": sorted(
                            question_analysis, key=lambda x: x["success_rate"]
                        ),
                    }

                except QuizTask.DoesNotExist:
                    pass

            # Compile task analytics
            task_data = {
                "task_id": task.id,
                "title": task.title,
                "type": task.type,
                "completion_stats": {
                    "total_students": total_attempts,
                    "completed": completed,
                    "in_progress": in_progress,
                    "not_started": not_started,
                    "completion_rate": round(completion_rate, 2),
                    "avg_completion_time_hours": (
                        round(avg_completion_time, 2) if avg_completion_time else None
                    ),
                },
                "difficulty_assessment": {
                    "estimated_difficulty": (
                        "high"
                        if completion_rate < 50
                        else ("medium" if completion_rate < 80 else "low")
                    ),
                    "avg_attempts_to_complete": (
                        round(total_attempts / completed, 2) if completed > 0 else None
                    ),
                },
            }

            # Add quiz data if available
            if quiz_data:
                task_data["quiz_analysis"] = quiz_data

            task_analytics.append(task_data)

        # Sort by completion rate (ascending, to highlight problematic tasks)
        task_analytics.sort(key=lambda x: x["completion_stats"]["completion_rate"])

        # Cache the analytics data for 1 hour
        cache.set(cache_key, task_analytics, 60 * 60)

        return Response(task_analytics)


class StudentProgressAPI(APIView):
    """
    API endpoint for retrieving a student's progress across all enrolled courses.
    Students can view their own progress, while instructors and admins can view any student's progress.
    """

    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, pk=None):
        """
        Get a student's progress across all enrolled courses.

        Parameters:
            pk (int): The user ID (optional for students viewing their own progress)

        Returns:
            - overall_stats: aggregated statistics across all courses
            - courses: detailed progress for each enrolled course
        """
        # Determine which user's progress to retrieve
        if pk is None:
            # No user ID provided, use the current user
            user = request.user
            logger.info(
                f"[StudentProgressAPI] No user ID provided. Using current user: {user.id}"
            )
        else:
            # User ID provided, check permissions
            user = get_object_or_404(User, pk=pk)

            # Check if the requesting user has permission to view this user's progress
            if request.user.id != user.id:
                # Check if the requesting user is an instructor or admin
                user_role = getattr(request.user, "role", "")
                is_staff = getattr(request.user, "is_staff", False)

                if not (user_role in ["instructor", "admin"] or is_staff):
                    return Response(
                        {
                            "error": "You do not have permission to view this user's progress"
                        },
                        status=403,
                    )

        # Try to get cached data first
        cache_key = f"student_progress_{user.id}"
        cached_data = cache.get(cache_key)

        if cached_data:
            return Response(cached_data)

        # Get all course enrollments for this user
        enrollments = CourseEnrollment.objects.filter(user=user).select_related(
            "course"
        )

        # Initialize aggregated statistics
        total_courses = enrollments.count()
        completed_courses = enrollments.filter(status="completed").count()
        active_courses = enrollments.filter(status="active").count()
        dropped_courses = enrollments.filter(status="dropped").count()

        total_tasks = 0
        completed_tasks = 0

        # Detailed progress for each course
        course_progress = []

        for enrollment in enrollments:
            course = enrollment.course

            # Get task progress for this course
            course_task_progress = TaskProgress.objects.filter(
                user=user, task__course=course
            ).select_related("task")

            # Course-specific task counts
            course_total_tasks = LearningTask.objects.filter(course=course).count()
            course_completed_tasks = course_task_progress.filter(
                status="completed"
            ).count()

            # Update aggregated counts
            total_tasks += course_total_tasks
            completed_tasks += course_completed_tasks

            # Calculate completion percentage
            completion_percentage = (
                (course_completed_tasks / course_total_tasks) * 100
                if course_total_tasks > 0
                else 0
            )

            # Get quiz performance
            quiz_attempts = QuizAttempt.objects.filter(
                user=user, quiz__course=course, completion_status="completed"
            )

            avg_quiz_score = quiz_attempts.aggregate(Avg("score"))["score__avg"] or 0

            # Recent activity in this course
            recent_activity = course_task_progress.order_by("-updated_at")[:3].values(
                "task__title", "status", "updated_at"
            )

            # Compile course data
            course_data = {
                "course_id": course.id,
                "course_title": course.title,
                "enrollment_status": enrollment.status,
                "enrollment_date": enrollment.enrollment_date,
                "progress_summary": {
                    "completion_percentage": round(completion_percentage, 2),
                    "completed_tasks": course_completed_tasks,
                    "total_tasks": course_total_tasks,
                },
                "assessment_performance": {
                    "average_quiz_score": round(avg_quiz_score, 2),
                    "quiz_attempts": quiz_attempts.count(),
                },
                "recent_activity": list(recent_activity),
                "last_access": (
                    course_task_progress.order_by("-updated_at").first().updated_at
                    if course_task_progress.exists()
                    else None
                ),
            }

            course_progress.append(course_data)

        # Calculate overall completion percentage
        overall_completion_percentage = (
            (completed_tasks / total_tasks) * 100 if total_tasks > 0 else 0
        )

        # Get overall quiz performance"completed")
        all_quiz_attempts = QuizAttempt.objects.filter(
            user=user, completion_status="completed"
        )

        overall_avg_quiz_score = (
            all_quiz_attempts.aggregate(Avg("score"))["score__avg"] or 0
        )

        # Compile results
        student_progress_data = {
            "user_info": {
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "full_name": f"{getattr(user, 'first_name', '')} {getattr(user, 'last_name', '')}".strip(),
            },
            "overall_stats": {
                "total_courses": total_courses,
                "completed_courses": completed_courses,
                "active_courses": active_courses,
                "dropped_courses": dropped_courses,
                "overall_completion": round(overall_completion_percentage, 2),
                "total_tasks_completed": completed_tasks,
                "total_tasks": total_tasks,
                "average_quiz_score": round(overall_avg_quiz_score, 2),
            },
            "courses": sorted(
                course_progress, key=lambda x: x["enrollment_date"], reverse=True
            ),
        }

        # Cache the data for 15 minutes
        cache.set(cache_key, student_progress_data, 15 * 60)

        return Response(student_progress_data)


class StudentQuizPerformanceAPI(APIView):
    """
    API endpoint for retrieving detailed quiz performance data for a specific student.
    Provides analytics on quiz attempts, scores, and question-level performance.
    """

    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, pk=None):
        """
        Get detailed quiz performance data for a student

        Parameters:
            pk (int): The user ID (optional for students viewing their own performance)

        Returns:
            - overall_stats: aggregated quiz statistics
            - course_breakdown: quiz performance by course
            - recent_attempts: details of recent quiz attempts
            - performance_by_category: analysis by question category/tag
        """
        # Determine which user's performance to retrieve
        if pk is None:
            # No user ID provided, use the current user
            user = request.user
        else:
            # User ID provided, check permissions
            user = get_object_or_404(User, pk=pk)

            # Check if the requesting user has permission to view this user's performance
            if request.user.id != user.id:
                # Check if the requesting user is an instructor or admin
                user_role = getattr(request.user, "role", "")
                is_staff = getattr(request.user, "is_staff", False)

                if not (user_role in ["instructor", "admin"] or is_staff):
                    return Response(
                        {
                            "error": "You do not have permission to view this user's quiz performance"
                        },
                        status=403,
                    )

        # Try to get cached data first
        cache_key = f"student_quiz_performance_{user.id}"
        cached_data = cache.get(cache_key)

        if cached_data:
            return Response(cached_data)

        # Get all quiz attempts for this user
        quiz_attempts = QuizAttempt.objects.filter(
            user=user, completion_status="completed"
        ).select_related("quiz", "quiz__course")

        # Calculate overall statistics
        total_attempts = quiz_attempts.count()

        if total_attempts == 0:
            # No quiz attempts yet
            return Response(
                {
                    "user_info": {
                        "id": user.id,
                        "username": user.username,
                        "email": user.email,
                        "full_name": f"{getattr(user, 'first_name', '')} {getattr(user, 'last_name', '')}".strip(),
                    },
                    "overall_stats": {
                        "total_attempts": 0,
                        "average_score": 0,
                        "quizzes_passed": 0,
                        "quizzes_failed": 0,
                    },
                    "course_breakdown": [],
                    "recent_attempts": [],
                    "performance_by_category": [],
                }
            )

        # Calculate average score
        avg_score = quiz_attempts.aggregate(Avg("score"))["score__avg"] or 0

        # Count passed/failed quizzes (assuming 60% is passing)
        passed_quizzes = quiz_attempts.filter(score__gte=60).count()
        failed_quizzes = quiz_attempts.filter(score__lt=60).count()

        # Get quiz responses for detailed analysis
        quiz_responses = QuizResponse.objects.filter(
            quiz_attempt__in=quiz_attempts
        ).select_related("question", "selected_option", "quiz_attempt")

        # Performance by course
        course_breakdown = []

        # Group attempts by course
        course_attempts = {}
        for attempt in quiz_attempts:
            course_id = attempt.quiz.course.id
            course_title = attempt.quiz.course.title

            if course_id not in course_attempts:
                course_attempts[course_id] = {
                    "course_id": course_id,
                    "course_title": course_title,
                    "attempts": [],
                    "quizzes": set(),
                }

            course_attempts[course_id]["attempts"].append(attempt)
            course_attempts[course_id]["quizzes"].add(attempt.quiz.id)

        # Calculate course-specific statistics
        for course_id, data in course_attempts.items():
            attempts = data["attempts"]
            course_avg_score = sum(a.score for a in attempts) / len(attempts)

            course_breakdown.append(
                {
                    "course_id": data["course_id"],
                    "course_title": data["course_title"],
                    "total_quizzes": len(data["quizzes"]),
                    "total_attempts": len(attempts),
                    "average_score": round(course_avg_score, 2),
                    "highest_score": round(max(a.score for a in attempts), 2),
                    "lowest_score": round(min(a.score for a in attempts), 2),
                }
            )

        # Sort by average score (descending)
        course_breakdown.sort(key=lambda x: x["average_score"], reverse=True)

        # Recent quiz attempts (last 5)
        recent_attempts = []

        for attempt in quiz_attempts.order_by("-attempt_date")[:5]:
            # Get responses for this attempt
            attempt_responses = quiz_responses.filter(quiz_attempt=attempt)

            # Count correct/incorrect responses
            correct_responses = attempt_responses.filter(is_correct=True).count()
            total_responses = attempt_responses.count()

            recent_attempts.append(
                {
                    "attempt_id": attempt.id,
                    "quiz_id": attempt.quiz.id,
                    "quiz_title": attempt.quiz.title,
                    "course_title": attempt.quiz.course.title,
                    "score": round(attempt.score, 2),
                    "correct_answers": correct_responses,
                    "total_questions": total_responses,
                    "submission_time": attempt.attempt_date,
                    "time_spent": (
                        str(attempt.attempt_date - attempt.started_at)
                        if attempt.started_at
                        else None
                    ),
                }
            )

        # Performance by question category/tag (if available)
        performance_by_category = []

        # Analyze question categories (assuming questions have categories/tags)
        question_categories = {}

        for response in quiz_responses:
            # Get the question's category or tag (if available)
            category = getattr(response.question, "category", None) or getattr(
                response.question, "tag", None
            )

            if category:
                if category not in question_categories:
                    question_categories[category] = {"total": 0, "correct": 0}

                question_categories[category]["total"] += 1

                if response.is_correct:
                    question_categories[category]["correct"] += 1

        # Calculate success rate by category
        for category, data in question_categories.items():
            success_rate = (
                (data["correct"] / data["total"]) * 100 if data["total"] > 0 else 0
            )

            performance_by_category.append(
                {
                    "category": category,
                    "total_questions": data["total"],
                    "correct_answers": data["correct"],
                    "success_rate": round(success_rate, 2),
                }
            )

        # Sort by success rate (ascending, to highlight problematic categories)
        performance_by_category.sort(key=lambda x: x["success_rate"])

        # Compile results
        performance_data = {
            "user_info": {
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "full_name": f"{getattr(user, 'first_name', '')} {getattr(user, 'last_name', '')}".strip(),
            },
            "overall_stats": {
                "total_attempts": total_attempts,
                "average_score": round(avg_score, 2),
                "quizzes_passed": passed_quizzes,
                "quizzes_failed": failed_quizzes,
                "pass_rate": (
                    round((passed_quizzes / total_attempts) * 100, 2)
                    if total_attempts > 0
                    else 0
                ),
            },
            "course_breakdown": course_breakdown,
            "recent_attempts": recent_attempts,
            "performance_by_category": performance_by_category,
        }

        # Cache the data for 15 minutes
        cache.set(cache_key, performance_data, 15 * 60)

        return Response(performance_data)


class CourseProgressAPI(APIView):
    permission_classes = [IsAuthenticated, IsEnrolledInCourse]

    def get(self, request, course_id):
        """Calculate course progress on demand without storing progress data"""
        # Get all learning tasks for the course
        tasks = LearningTask.objects.filter(course_id=course_id).values(
            "id", "title", "type", "order"
        )

        # Get all completed tasks for this user in this course
        completed_tasks = set(
            TaskProgress.objects.filter(
                user=request.user, task__course_id=course_id, status="completed"
            ).values_list("task_id", flat=True)
        )

        # Calculate progress for each task
        progress = []
        for task in tasks:
            task_status = (
                "completed" if task["id"] in completed_tasks else "not_started"
            )
            progress.append(
                {
                    "task_id": task["id"],
                    "title": task["title"],
                    "type": task["type"],
                    "status": task_status,
                    "order": task["order"],
                }
            )

        # Calculate overall progress percentage
        total_tasks = len(tasks)
        completed_count = len(completed_tasks)
        progress_percentage = (
            (completed_count / total_tasks * 100) if total_tasks > 0 else 0
        )

        return Response(
            {
                "progress": sorted(progress, key=lambda x: x["order"]),
                "summary": {
                    "total_tasks": total_tasks,
                    "completed_tasks": completed_count,
                    "progress_percentage": round(progress_percentage, 2),
                },
            }
        )
