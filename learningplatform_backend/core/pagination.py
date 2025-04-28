import logging
from django.core.paginator import EmptyPage
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response

logger = logging.getLogger(__name__)


class SafePageNumberPagination(PageNumberPagination):
    """
    Custom pagination class that handles invalid page numbers gracefully by
    returning the last available page instead of a 500 error.
    """

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
        Enhanced response that includes total pages information.
        """
        return Response(
            {
                "count": self.page.paginator.count,
                "next": self.get_next_link(),
                "previous": self.get_previous_link(),
                "total_pages": self.page.paginator.num_pages,
                "current_page": self.page.number,
                "results": data,
            }
        )
