# ADR 0001: Reorganize Dashboard Files

## Status

Accepted

## Context

The `frontend/src/features/dashboard` directory contained multiple files that were not well-organized. This made it difficult to navigate and maintain the codebase.

## Decision

We decided to reorganize the files within the `frontend/src/features/dashboard` directory into subdirectories based on their functionality or purpose. This will improve the organization and maintainability of the codebase.

## Rationale

- **Improved Organization**: By categorizing files into subdirectories, we can easily locate and manage related files.
- **Maintainability**: A well-organized directory structure makes it easier to understand and modify the codebase.
- **Scalability**: This approach allows the codebase to scale more easily as new features are added.

## Consequences

- **Positive**: Improved code organization and maintainability.
- **Negative**: Initial effort required to reorganize the files.

## Implementation

- Moved `UpcomingTasksList.tsx` to `frontend/src/features/dashboard/tasks/UpcomingTasksList.tsx`.

## Log

- **File**: `frontend/src/features/dashboard/UpcomingTasksList.tsx`
  - **Moved to**: `frontend/src/features/dashboard/tasks/UpcomingTasksList.tsx`
  - **Rationale**: `UpcomingTasksList.tsx` is a component related to tasks, so it was moved to the `tasks` subdirectory.
