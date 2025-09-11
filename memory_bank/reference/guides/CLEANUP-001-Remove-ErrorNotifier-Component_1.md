# CLEANUP-001: Remove ErrorNotifier Component

## Metadata

- Status: DRAFT
- Created: 2025-06-23
- Author: Roo
- Priority: Medium

## Context

The ErrorNotifier component's functionality has been successfully migrated to the new Notifications system. The new system provides a more comprehensive notification management solution through the NotificationProvider, NotificationToast components, and useNotification hook. To maintain code clarity and prevent confusion, we need to remove the now-deprecated ErrorNotifier component and its related files.

### Current State

- The new Notifications system is fully implemented and functional
- Old ErrorNotifier component files still exist but are no longer actively used
- All error notification functionality is now handled by the Notifications system

## Files to be Removed

1. `frontend/src/components/ErrorNotifier/ErrorToast.tsx`
2. `frontend/src/components/ErrorNotifier/ErrorNotifier.test.tsx`
3. `frontend/src/components/ErrorNotifier/useErrorNotifier.ts`
4. Any additional ErrorNotifier-related files discovered during implementation

## Implementation Steps

### 1. Validation

- Run a full codebase search to confirm no remaining imports or references to ErrorNotifier components
- Verify all error notifications are using the new Notifications system
- Run the full test suite to ensure no tests depend on ErrorNotifier

### 2. Removal

- Remove identified ErrorNotifier component files
- Remove any import statements referencing these files
- Remove any configuration entries related to ErrorNotifier if they exist

### 3. Testing

- Run the complete test suite to verify no regressions
- Verify error notifications still work correctly in the application
- Check build process completes successfully

## Success Criteria

1. All ErrorNotifier component files successfully removed
2. No references to ErrorNotifier remain in the codebase
3. All tests pass successfully
4. Application builds without errors
5. Error notification functionality continues to work as expected through the new Notifications system

## Validation Requirements

1. Complete test coverage showing error notifications work correctly
2. No TypeScript errors or build warnings
3. No runtime errors related to missing ErrorNotifier components
4. Successful QA verification of error notification functionality

## Dependencies

- Notifications system must be fully functional
- All components must be using the new notification system

## Risk Assessment

- Low risk as the functionality has already been migrated
- Main risk is missing references that could cause runtime errors

## Notes

- This is a cleanup task following the successful migration to the Notifications system
- No new functionality is being added, only removing deprecated code
