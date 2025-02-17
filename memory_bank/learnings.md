## Pylint Learnings for Django ManyToManyField and Model Methods

### ManyToManyField Challenges

1. **Direct Method Limitations**
   - Pylint often flags `.count()`, `.all()`, and `.filter()` as unsupported methods on ManyToManyField
   - Recommended solutions:
     * Use `ModelName.objects.filter(field=instance).count()`
     * Use `ModelName.objects.filter(field=instance)` instead of `.all()`
     * Leverage the through model or related manager for complex queries

2. **Through Model Access**
   - When using `through` parameter in ManyToManyField, access related data via:
     ```python
     # Instead of self.tasks.count()
     self.tasks.through.objects.filter(course=self).count()
     ```

### Model Method Best Practices

1. **Role Display Names**
   - For models with choices, create an explicit `get_role_name_display()` method
   - Use dictionary lookup for more robust display name retrieval
     ```python
     def get_role_name_display(self) -> str:
         return dict(self.StandardRoles.choices).get(self.role_name, self.role_name)
     ```

2. **Exception Handling**
   - Use `objects.model.DoesNotExist` for more generic exception handling
     ```python
     try:
         # Your query
     except ModelName.objects.model.DoesNotExist:
         # Handle exception
     ```

### Type Hinting and Imports

1. **Dynamic Model Access**
   - Use `django.apps.apps.get_model()` for dynamic model retrieval
   - Helpful for avoiding circular imports and dynamic model access

2. **Type Checking Imports**
   - Use `TYPE_CHECKING` for type hint imports to avoid circular dependencies
     ```python
     from typing import TYPE_CHECKING
     if TYPE_CHECKING:
         from users.models import User
     ```

### Performance Considerations

1. **QuerySet Methods**
   - Prefer `values_list()` for efficient data retrieval
   - Use `flat=True` to get simple lists instead of tuples
     ```python
     list(self.tasks.values_list('id', flat=True))
     ```

### Debugging Tips

1. Always add explicit managers to models
2. Implement `__str__` methods for better debugging
3. Use type hints to improve code clarity and catch potential issues early

### Common Pylint Workarounds

1. For methods flagged as not existing, create wrapper methods
2. Use `getattr()` with default values for dynamic attribute access
3. Leverage Django's model managers for complex queries

## Version Control System Implementation Learnings

### Content Snapshot Management

1. **JSON Field for Snapshots**
   - Use JSONField for flexible content snapshots
   - Include only serializable data
   - Document snapshot structure for maintainability

2. **Version History Tracking**
   - Implement version comparison at the model level
   - Use dedicated service layer for version operations
   - Maintain clear version numbering scheme

### Data Integrity Patterns

1. **Atomic Operations**
   - Use `transaction.atomic()` for version operations
   - Ensure rollback operations maintain referential integrity
   - Validate version state before operations

2. **Version Validation**
   - Implement version operation validation
   - Check status constraints before version changes
   - Prevent invalid version transitions

### Service Layer Design

1. **Separation of Concerns**
   - Keep version logic in dedicated service
   - Use model managers for version-specific queries
