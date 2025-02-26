# Django Best Practices

## 1. Correct Imports
✅ **Modules should be correctly imported and exist**
- Ensure that `core.services.course_status_service` and `core.services.version_control_service` exist.
- Avoid **circular imports** and **self-referencing imports (`import-self`)**.

**Good Example:**
```python
from backend.core.services.course_status_service import CourseStatusService
```

---

## 2. Use Django’s Built-in Exceptions
✅ **Django provides `DoesNotExist` automatically**
- Use `ModelName.DoesNotExist` instead of defining a custom `DoesNotExist` exception.

**Good Example:**
```python
from django.core.exceptions import ObjectDoesNotExist

try:
    course = Course.objects.get(id=course_id)
except Course.DoesNotExist:
    print("Course not found")
```

---

## 3. Optimize Query Performance
✅ **Use `select_related()` and `prefetch_related()` to optimize queries**
- `select_related()` for **ForeignKey** relationships.
- `prefetch_related()` for **ManyToMany** relationships.

**Good Example:**
```python
course_versions = CourseVersion.objects.select_related("course").all()
```

---

## 4. Use `get_queryset()` Effectively
✅ **Extend `get_queryset()` only if additional logic is needed**

**Good Example:**
```python
class CourseManager(models.Manager):
    def get_queryset(self):
        return super().get_queryset().filter(status="PUBLISHED")
```

---

## 5. Remove Unused Imports
✅ **Only import what is necessary**

**Good Example:**
```python
from django.db import models
```

---

## 6. Use Unique Constraints Properly
✅ **Use `UniqueConstraint` instead of `unique_together`**

**Good Example:**
```python
class Meta:
    constraints = [
        models.UniqueConstraint(fields=["course", "version_number"], name="unique_course_version")
    ]
```

---

## 7. Use Meaningful `__str__()` Methods
✅ **Provide useful string representations**

**Good Example:**
```python
def __str__(self) -> str:
    creator = self.created_by.get_full_name() if self.created_by else "Unknown"
    return f"{self.course.title} v{self.version_number} (Created by: {creator})"
```

---

## 8. Use `.first()` Instead of `.latest()` to Avoid Exceptions
✅ **Use `.first()` to avoid handling `DoesNotExist` exceptions**

**Good Example:**
```python
previous = CourseVersion.objects.filter(
    course=self.course, version_number__lt=self.version_number
).order_by('-version_number').first()

if previous:
    changes = compare_snapshots(previous.content_snapshot, self.content_snapshot)
```

---

## 9. Avoid Accessing Protected Methods
✅ **Use public methods instead of `_protected_methods`**

**Good Example:**
```python
# Instead of calling _compare_snapshots(), request a public method
changes = version_control_service.compare_snapshots(old_version, new_version)
```

---

## 10. Remove Unnecessary `pass` Statements
✅ **Use `...` for empty blocks instead of `pass`**

**Good Example:**
```python
class CourseManager(models.Manager):
    ...
```

