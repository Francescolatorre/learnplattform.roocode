from rest_framework.permissions import BasePermission


class IsStudentOrReadOnly(BasePermission):
    """
    Custom permission to allow students to access their own data.
    """

    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == "student"
