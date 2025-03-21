# Shared UI Components

## DataTable Component

The `DataTable` is a flexible, generic table component designed to reduce code duplication and provide a consistent data display experience across the application.

### Key Features

- **Generic Type Support**: Works with any data type
- **Configurable Columns**:
  - Custom column definitions
  - Optional formatting
  - Alignment control
- **Built-in States**:
  - Loading indicator
  - Error handling
  - Empty state messaging
- **Pagination**:
  - Optional pagination
  - Configurable rows per page
- **Interaction**:
  - Optional row click handlers
  - Customizable row styling

### Usage Example

```typescript
// Define columns
const columns: Column<CourseType>[] = [
  {
    id: 'name',
    label: 'Course Name',
    minWidth: 170,
    format: (value) => <strong>{value}</strong>
  },
  {
    id: 'instructor.name',
    label: 'Instructor',
    align: 'right'
  }
];

// In your component
<DataTable
  columns={columns}
  data={courses}
  loading={isLoading}
  error={error}
  pagination
  keyExtractor={(course) => course.id}
  onRowClick={(course) => navigateToCourseDetails(course.id)}
/>
```

### Props Interface

- `columns`: Column[] - Define table columns
- `data`: T[] - Data to display
- `loading?`: boolean - Show loading state
- `error?`: string | null - Display error message
- `emptyMessage?`: string - Message when no data
- `keyExtractor`: (item: T) => string | number - Unique key for each row
- `onRowClick?`: (item: T) => void - Handle row click
- `pagination?`: boolean - Enable pagination
- `title?`: string - Optional table title
- `sx?`: Styling overrides
- `rowSx?`: Per-row styling function

### Benefits

- **Reusability**: Use across different views and data types
- **Consistency**: Standardized table rendering
- **Flexibility**: Highly configurable
- **Performance**: Efficient rendering with pagination
