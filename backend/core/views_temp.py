@action(
    detail=False,
    methods=["get"],
    url_path="instructor/courses",
    permission_classes=[IsInstructorOrAdmin],  # Apply IsInstructorOrAdmin
)
def instructor_courses(self, request):
    """
    Fetch courses created by the instructor or all courses for admin.
    Supports search filtering through query parameter 'search'.
    """
    try:
        # Allow access for both instructors and admins
        if request.user.role not in ["instructor", "admin"]:
            return Response(
                {"error": "You do not have permission to access this resource."},
                status=403,
            )

        # Add detailed logging to help diagnose user ID mismatch issues
        logger.info(
            "Fetching instructor courses for user ID: %s, username: %s, role: %s",
            request.user.id,
            request.user.username,
            request.user.role,
        )

        # Start with base queryset
        queryset = self.get_queryset()

        # Apply search filter if provided
        search_query = request.query_params.get("search", "").strip()
        if search_query:
            logger.info(
                "Applying search filter '%s' for instructor courses", search_query
            )
            queryset = queryset.filter(
                models.Q(title__icontains=search_query)
                | models.Q(description__icontains=search_query)
            )

        # Log how many courses were found
        course_count = queryset.count()
        logger.info(
            "Found %d courses for instructor with ID %s",
            course_count,
            request.user.id,
        )

        # Debug log to check for specific creator IDs
        creator_2_count = queryset.filter(creator_id=2).count()
        creator_3_count = queryset.filter(creator_id=3).count()
        logger.info(
            "Debug counts - Creator ID 2: %d courses, Creator ID 3: %d courses",
            creator_2_count,
            creator_3_count,
        )

        # Use the viewset's paginate_queryset method to paginate results
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        # If pagination is not configured, still serialize all data
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    except Exception as e:
        # Log the error for debugging
        logger.error(
            "Error fetching instructor courses for user ID %s: %s",
            (
                request.user.id
                if hasattr(request, "user") and hasattr(request.user, "id")
                else "unknown"
            ),
            str(e),
            exc_info=True,
        )
        return Response(
            {"error": "An unexpected error occurred while fetching courses."},
            status=500,
        )
