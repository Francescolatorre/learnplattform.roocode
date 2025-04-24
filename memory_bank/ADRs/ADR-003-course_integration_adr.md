# ADR-003: Integration of Course Class Across Modules

## Status

Accepted

## Context

The `Course` class is defined in the `courses` module and is used across various parts of the application, including the `learning` module. There was a need to clarify and streamline the usage of the `Course` class to avoid redundancy and ensure consistency.

## Decision

We decided to use the `Course` class from the `courses` module as the central model for all course-related functionalities. This class will be the only `Course` class used across the application, and any other redundant class or functionality should be refactored to utilize this central class.

## Consequences

- **Positive**: Centralizing the course management in one class simplifies the codebase, making it easier to maintain and develop further.
- **Negative**: Some refactoring may be required in parts of the application where course-related data is managed differently.
- **Neutral**: Documentation and communication efforts will be needed to ensure all team members are aware of this standard.

This decision aligns with our goals to maintain a clean and efficient codebase and ensures that all course-related operations are streamlined and consistent.

## Date

2025-03-02
