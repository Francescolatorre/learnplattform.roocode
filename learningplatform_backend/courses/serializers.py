from rest_framework import serializers
from .models import Course, CourseEnrollment


class CourseSerializer(serializers.ModelSerializer):
    enrollment_status = serializers.SerializerMethodField()

    class Meta:
        model = Course
        fields = [
            "id",
            "title",
            "description",
            "status",
            "visibility",
            "created_at",
            "updated_at",
            "version",
            "enrollment_status",
        ]

    def get_enrollment_status(self, obj):
        user = self.context["request"].user
        if not user.is_authenticated:
            return None
        enrollment = CourseEnrollment.objects.filter(course=obj, user=user).first()
        if enrollment:
            return enrollment.status  # e.g., 'active', 'completed', 'dropped'
        return "not_enrolled"
