# ADR-017: Dashboard Integration Plan

## Context

The current dashboard implementation does not fully utilize the data provided by the `getStudentDashboard` method from `progressService`. This ADR outlines the plan to refactor the dashboard to align with the `IDashboardResponse` structure.

## Decision

To refactor the `DashboardPage.tsx` for full integration with the `getStudentDashboard` data, we will:

1. **Update Type Imports**:
   - Ensure `IDashboardResponse` is imported from the correct module.

2. **Adjust Data Fetching**:
   - Use `getStudentDashboard` method from `progressService` to fetch data.

3. **Align Data Structures**:
   - Update the component logic to handle the `IDashboardResponse` structure, including properties like `courses`, `progress`, and any other relevant fields.

4. **Modify UI Components**:
   - Ensure UI components display data according to the new structure, such as course titles, progress percentages, and other dashboard metrics.

5. **Test and Validate**:
   - Run tests to ensure the dashboard displays data correctly and handles edge cases.

## Consequences

This refactoring will ensure that the dashboard is fully aligned with the data provided by `getStudentDashboard`, improving data consistency and user experience.

## Diagram

```mermaid
graph TD;
    A[DashboardPage.tsx] --> B[Import IDashboardResponse];
    A --> C[Use getStudentDashboard];
    A --> D[Align Data Structures];
    A --> E[Modify UI Components];
    A --> F[Test and Validate];
