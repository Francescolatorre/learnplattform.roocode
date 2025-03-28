# API Resource Hooks

## useApiResource Hook

### Overview

The `createApiHook` is a powerful, generic hook factory that creates reusable API hooks for different resources, providing a consistent and type-safe approach to data fetching, manipulation, and state management.

## Key Features

- **Generic Type Support**: Works with any resource type
- **Automatic State Management**:
  - Loading states
  - Error handling
  - Data caching
- **CRUD Operations**:
  - Fetch collections
  - Fetch single resources
  - Create new resources
  - Update existing resources
  - Delete resources
- **Authentication Handling**:
  - Automatic token injection
  - Secure request management

## Usage Examples

### Fetching a Collection

```typescript
// Create a hook for a specific resource
const { useCourses } = createApiHook<Course>('courses');

function CourseList() {
  const { data, loading, error, refetch } = useCourses.useCollection();

  if (loading) return <Spinner />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <DataTable
      data={data || []}
      columns={courseColumns}
    />
  );
}
```

### Fetching a Single Resource

```typescript
function CourseDetails({ courseId }) {
  const { data, loading, error, update, remove } = useCourses.useResource(courseId);

  if (loading) return <Spinner />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <CourseCard
      course={data}
      onUpdate={(updatedData) => update(courseId, updatedData)}
      onDelete={() => remove(courseId)}
    />
  );
}
```

### Creating a Resource

```typescript
function CreateCourseForm() {
  const { create, error } = useCourses.useCollection();

  const handleSubmit = async courseData => {
    const newCourse = await create(courseData);
    if (newCourse) {
      // Handle successful creation
    }
  };
}
```

## Advanced Usage

### Custom Configuration

```typescript
// Add custom Axios config
const { data, loading } = useCourses.useCollection({
  params: { status: 'active' },
  headers: { 'X-Custom-Header': 'value' },
});
```

### Error Handling

```typescript
const {
  data,
  loading,
  error, // Detailed error message
  refetch, // Retry the request
} = useCourses.useCollection();
```

## Hook Methods

### useCollection

- `data`: Array of resources
- `loading`: Fetch in progress
- `error`: Error message
- `refetch()`: Reload data
- `create()`: Add new resource
- `update()`: Modify existing resource
- `remove()`: Delete a resource

### useResource

- `data`: Single resource
- `loading`: Fetch in progress
- `error`: Error message
- `refetch()`: Reload data
- `create()`: Add new resource
- `update()`: Modify resource
- `remove()`: Delete resource

## Benefits

- **Consistency**: Uniform API interaction
- **Flexibility**: Adaptable to different resources
- **Type Safety**: TypeScript generics
- **State Management**: Built-in loading/error states
- **Caching**: Automatic local state updates
- **Authentication**: Seamless token handling

## Best Practices

- Use type-specific generics
- Handle loading and error states
- Leverage refetch and update methods
- Use for most CRUD operations
- Combine with other hooks and components
