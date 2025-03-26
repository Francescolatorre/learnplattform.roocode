from rest_framework import viewsets
from django.contrib.auth.models import AnonymousUser


class BaseViewSet(viewsets.ModelViewSet):
    """
    Base viewset with common filtering and permission logic.
    """

    def _is_admin_or_instructor(self, user):
        """Safely check if user is admin or instructor."""
        user_role = getattr(user, "role", "")
        is_staff = getattr(user, "is_staff", False)
        return user_role in ["admin", "instructor"] or is_staff

    def get_queryset(self):
        """
        Filter queryset based on user role.
        """
        # Handle schema generation for Swagger
        if getattr(self, "swagger_fake_view", False):
            return self.queryset.none()

        # Handle AnonymousUser
        if isinstance(self.request.user, AnonymousUser):
            return self.queryset.none()

        # Admins and instructors can see all data
        if self._is_admin_or_instructor(self.request.user):
            return self.queryset

        # Regular users can only see their own data
        return self.queryset.filter(user=self.request.user)

    def filter_queryset_by_params(self, queryset, params):
        """
        Filter the queryset based on provided query parameters.
        """
        for key, value in params.items():
            if value:
                queryset = queryset.filter(**{key: value})
        return queryset
