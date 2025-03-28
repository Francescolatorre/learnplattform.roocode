# useCourseData Hook

## Overview

The `useCourseData` hook is a comprehensive, feature-rich React hook for managing course-related data and operations. Built with React Query, it provides a robust solution for fetching, creating, updating, and managing courses with built-in state management and caching.

## Key Features

- **Comprehensive Course Management**:

  - Fetch course lists
  - Retrieve individual course details
  - Create, update, and delete courses
  - Course enrollment and unenrollment

- **State Management**:

  - Loading states for all operations
  - Error handling
  - Automatic query invalidation
  - Caching with stale-time configuration

- **Flexible Querying**:
  - Selective course selection
  - Automatic data refreshing
  - Performance-optimized queries

## Usage Examples

### Fetching and Displaying Courses

```typescript
function CourseList() {
  const {
    courses,
    isLoadingCourses,
    coursesError,
    refreshCourses
  } = useCourseData();

  if (isLoadingCourses) return <Spinner />;
  if (coursesError) return <ErrorMessage message={coursesError.message} />;

  return (
    <DataTable
      data={courses}
      columns={courseColumns}
      onRefresh={refreshCourses}
    />
  );
}
```

### Course Details and Operations

```typescript
function CourseManagement() {
  const {
    selectedCourse,
    isLoadingCourse,
    selectCourse,
    updateCourse,
    deleteCourse,
    isUpdating,
    isDeleting
  } = useCourseData();

  const handleUpdateCourse = async (courseData) => {
    const updatedCourse = await updateCourse(selectedCourse.id, courseData);
  };

  const handleDeleteCourse = async () => {
    const success = await deleteCourse(selectedCourse.id);
  };

  return (
    <CourseDetailsForm
      course={selectedCourse}
      onSelect={selectCourse}
      onUpdate={handleUpdateCourse}
      onDelete={handleDeleteCourse}
      isUpdating={isUpdating}
      isDeleting={isDeleting}
    />
  );
}
```

### Course Enrollment

```typescript
function CourseEnrollment() {
  const {
    enrollInCourse,
    unenrollFromCourse,
    isEnrolling,
    isUnenrolling
  } = useCourseData();

  const handleEnroll = async (courseId) => {
    try {
      await enrollInCourse(courseId);
      // Handle successful enrollment
    } catch (error) {
      // Handle enrollment error
    }
  };

  return (
    <EnrollmentButton
      onEnroll={handleEnroll}
      isEnrolling={isEnrolling}
    />
  );
}
```

## Hook Methods and Properties

### Course List

- `courses`: Array of courses
- `isLoadingCourses`: Loading state for course list
- `coursesError`: Error during course list fetch
- `refreshCourses()`: Manually refresh course list

### Single Course

- `selectedCourse`: Currently selected course details
- `isLoadingCourse`: Loading state for single course
- `courseError`: Error during single course fetch
- `selectCourse(id)`: Select a specific course

### Course Operations

- `createCourse(data)`: Create a new course
- `updateCourse(id, data)`: Update an existing course
- `deleteCourse(id)`: Delete a course
- `isCreating`: Creating course loading state
- `isUpdating`: Updating course loading state
- `isDeleting`: Deleting course loading state

### Enrollment Operations

- `enrollInCourse(courseId)`: Enroll in a course
- `unenrollFromCourse(courseId)`: Unenroll from a course
- `isEnrolling`: Enrollment loading state
- `isUnenrolling`: Unenrollment loading state

## Performance Optimizations

- 5-minute query cache (stale time)
- Automatic query invalidation
- Disabled refetching on window focus
- Selective query enabling

## Benefits

- **Comprehensive**: All course-related operations in one hook
- **Type-Safe**: TypeScript generics
- **Performant**: React Query caching
- **Flexible**: Easily customizable
- **Error Handling**: Built-in error management
- **State Management**: Automatic loading states

## Best Practices

- Always handle loading and error states
- Use selective course selection
- Leverage built-in refresh and invalidation methods
- Combine with other hooks and components
