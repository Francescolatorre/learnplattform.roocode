from rest_framework import viewsets
from rest_framework.response import Response
from .models import Course
from .serializers import CourseSerializer


class CourseViewSet(viewsets.ModelViewSet):
    queryset = Course.objects.prefetch_related(
        "learningtasks"
    )  # Prefetch related learning tasks
    serializer_class = CourseSerializer

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        data = serializer.data
        data["learningTasks"] = instance.learningtasks.values(
            "id", "title", "description"
        )  # Include learning tasks
        return Response(data)
