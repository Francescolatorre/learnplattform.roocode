# StatusChip Component

The `StatusChip` is a flexible and intelligent component for displaying status indicators with consistent styling and color coding.

## Key Features

- **Automatic Color Mapping**: Intelligent color assignment based on status
- **Customizable Styling**: Supports custom color and label mappings
- **Flexible Labeling**: Automatic label formatting
- **Consistent Theming**: Integrates with Material-UI theme

## Supported Status Types

- `success`: Green (completed, approved, active)
- `warning`: Yellow (in progress, waiting)
- `error`: Red (failed, rejected)
- `info`: Blue (pending)
- `default`: Neutral gray
- `primary`: Primary theme color
- `secondary`: Secondary theme color

## Usage Examples

```typescript
// Basic usage
<StatusChip status="completed" />
<StatusChip status="in_progress" />
<StatusChip status="rejected" />

// Custom color mapping
<StatusChip
  status="custom_status"
  colorMapping={{
    'custom_status': 'primary'
  }}
/>

// Custom label mapping
<StatusChip
  status="in_progress"
  labelMapping={{
    'in_progress': 'Ongoing'
  }}
/>

// Advanced custom color and label
<StatusChip
  status="special_status"
  getColor={(status) => 'secondary'}
  getLabel={(status) => 'Special Label'}
/>
```

## Props Interface

- `status`: string - The status to display
- `colorMapping?`: Custom color mapping for statuses
- `labelMapping?`: Custom label mapping for statuses
- `getColor?`: Custom function to determine color
- `getLabel?`: Custom function to determine label
- All other ChipProps are supported

## Default Status Mappings

### Task/Submission Statuses

- `completed`: success
- `graded`: success
- `in_progress`: warning
- `not_started`: default
- `pending`: info

### Course Statuses

- `draft`: default
- `published`: success
- `archived`: secondary

### Progress Statuses

- `high`: success
- `medium`: warning
- `low`: error

### Other Common Statuses

- `active`: success
- `inactive`: default
- `approved`: success
- `rejected`: error
- `waiting`: warning
- `failed`: error

## Benefits

- **Consistency**: Standardized status representation
- **Flexibility**: Easily customizable
- **Readability**: Clear, at-a-glance status understanding
- **Theming**: Seamless integration with Material-UI
