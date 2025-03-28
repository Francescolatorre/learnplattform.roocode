from rest_framework.viewsets import ModelViewSet
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly
from .models import Course, CourseEnrollment
from .serializers import CourseSerializer


class CourseViewSet(ModelViewSet):
    queryset = Course.objects.all()
    serializer_class = CourseSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context["request"] = self.request
        return context


class UserCourseProgressView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        enrollments = CourseEnrollment.objects.filter(user=user).select_related(
            "course"
        )
        progress_data = [
            {
                "course_id": enrollment.course.id,
                "course_title": enrollment.course.title,
                "enrollment_status": enrollment.status,  # e.g., 'active', 'completed', 'dropped'
                "progress": enrollment.progress,  # Assuming progress is tracked
            }
            for enrollment in enrollments
        ]
        return Response(progress_data)


class UserEnrollmentsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        enrollments = CourseEnrollment.objects.filter(user=user).select_related(
            "course"
        )
        enrollment_data = [
            {
                "course_id": enrollment.course.id,
                "enrollment_status": enrollment.status,  # e.g., 'active', 'completed', 'dropped'
            }
            for enrollment in enrollments
        ]
        return Response(enrollment_data)  # Ensure this is a list
