"""
Pagination classes for the Learning Platform API.

This module provides custom pagination classes that handle large datasets
in a consistent and efficient manner across all API endpoints. These classes
extend Django REST Framework's pagination classes with additional features
and safeguards.

Features:
- Configurable page sizes
- Safe handling of invalid page numbers
- Consistent response format
- Performance optimizations for large datasets
"""

import logging
from django.core.paginator import EmptyPage
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response

logger = logging.getLogger(__name__)


class SafePageNumberPagination(PageNumberPagination):
    """
    A safe implementation of page number pagination.

    This pagination class extends the standard PageNumberPagination to provide:
    - Customizable page size via query parameter
    - Maximum page size limits
    - Graceful handling of out-of-range page numbers
    - Consistent response format with metadata

    Query Parameters:
        page_size: Number of items per page (default: 10, max: 100)
        page: Page number to retrieve

    Response Format:
        {
            "count": Total number of items,
            "next": URL for next page,
            "previous": URL for previous page,
            "results": List of items for current page,
            "current_page": Current page number,
            "total_pages": Total number of pages
        }
    """

    page_size = 10
    page_size_query_param = "page_size"
    max_page_size = 100

    def paginate_queryset(self, queryset, request, view=None):
        """
        Override the default paginate_queryset method to handle EmptyPage exceptions.
        If a page beyond the valid range is requested, return the last page instead.
        """
        # Get the requested page number
        page_number = request.query_params.get(self.page_query_param, 1)
        if page_number in self.last_page_strings:
            # If the page number is "last", use the last page
            page_number = 1  # Default to page 1

        # Calculate page size
        page_size = self.get_page_size(request)
        if page_size is None:
            return None

        # Create a paginator instance
        paginator = self.django_paginator_class(queryset, page_size)

        try:
            # Try to get the requested page
            page_number = int(page_number)
            self.page = paginator.page(page_number)
        except (EmptyPage, ValueError) as e:
            # If the page doesn't exist or is not a valid integer, get the last page
            logger.warning(
                f"Invalid page {page_number} requested. Returning last page instead. Error: {str(e)}"
            )
            self.page = paginator.page(paginator.num_pages)

            # Update request query params for consistent pagination links
            request.query_params._mutable = True
            request.query_params[self.page_query_param] = paginator.num_pages
            request.query_params._mutable = False

        # Return the result as expected by DRF
        if paginator.num_pages > 1 and self.template is not None:
            # The browsable API should display pagination controls.
            self.display_page_controls = True

        self.request = request
        return list(self.page)

    def get_paginated_response(self, data):
        """
        Returns a paginated response with enhanced metadata.

        Args:
            data: The page of results to include in the response

        Returns:
            Response: A REST framework response object with pagination metadata
        """
        return Response(
            {
                "count": self.page.paginator.count,
                "next": self.get_next_link(),
                "previous": self.get_previous_link(),
                "results": data,
                "current_page": self.page.number,
                "total_pages": self.page.paginator.num_pages,
            }
        )


class LargeSetPagination(SafePageNumberPagination):
    """
    Pagination class optimized for large datasets.

    This class is designed for endpoints that return large amounts of data,
    such as course listings or student progress reports. It implements:
    - Larger default page size
    - Higher maximum page size
    - Additional performance optimizations

    Used for endpoints that typically return more than 100 items.
    """

    page_size = 50
    max_page_size = 200


class SmallSetPagination(SafePageNumberPagination):
    """
    Pagination class optimized for small datasets.

    This class is designed for endpoints that return smaller amounts of data,
    such as quiz questions or course enrollments. Features:
    - Smaller default page size
    - Lower maximum page size
    - Optimized for frequent updates

    Used for endpoints that typically return fewer than 20 items.
    """

    page_size = 5
    max_page_size = 20
