# ProgressIndicator Component

The `ProgressIndicator` is a versatile and intelligent progress visualization component supporting both linear and circular progress representations.

## Key Features

- **Flexible Variants**:
  - Linear progress bar
  - Circular progress indicator
- **Intelligent Color Coding**:
  - Automatic color changes based on progress thresholds
  - Color mapping: Low (Red), Medium (Yellow), High (Green)
- **Customizable Display**:
  - Optional percentage display
  - Configurable progress thresholds
  - Adjustable size and thickness
- **Responsive Design**: Integrates seamlessly with Material-UI theme

## Variants

### Linear Progress

```typescript
<ProgressIndicator
  value={65}
  variant="linear"
  label="Course Completion"
/>
```

### Circular Progress

```typescript
<ProgressIndicator
  value={45}
  variant="circular"
  size={60}
  thickness={5}
/>
```

## Advanced Usage

### Custom Thresholds

```typescript
<ProgressIndicator
  value={75}
  thresholds={{
    low: 20,    // Red below 20%
    medium: 50, // Yellow between 20-50%
    high: 100   // Green above 50%
  }}
/>
```

### Hiding Percentage

```typescript
<ProgressIndicator
  value={85}
  showPercentage={false}
/>
```

## Props Interface

- `value`: number (0-100) - Progress percentage
- `label?`: Optional text label
- `showPercentage?`: Display percentage (default: true)
- `progressHeight?`: Height of linear progress bar
- `thresholds?`: Custom progress color thresholds
- `variant?`: 'linear' | 'circular' (default: 'linear')
- `size?`: Circular progress size
- `thickness?`: Circular progress thickness

## Color Mapping

- **0-33%**: Error (Red)
- **33-66%**: Warning (Yellow)
- **66-100%**: Success (Green)

## Benefits

- **Consistency**: Standardized progress representation
- **Flexibility**: Highly configurable
- **Readability**: Clear visual progress indication
- **Theming**: Seamless Material-UI integration
