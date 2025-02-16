from typing import Any, Optional
from django.db import models
from django.db.models import Manager, QuerySet

class BaseTaskManager(Manager):
    def get_queryset(self) -> QuerySet: ...

class BaseTask(models.Model):
    title: str
    description: str
    created_at: Any
    updated_at: Any
    due_date: Optional[Any]
    objects: BaseTaskManager

    class DoesNotExist(Exception): ...

class LearningTask(BaseTask):
    difficulty_level: str
    objects: BaseTaskManager

    class DoesNotExist(Exception): ...

class AssessmentTask(BaseTask):
    max_score: Optional[float]
    passing_score: Optional[float]
    objects: BaseTaskManager

    class DoesNotExist(Exception): ...

class QuizTask(AssessmentTask):
    time_limit: Optional[int]
    is_randomized: bool
    objects: BaseTaskManager

    class DoesNotExist(Exception): ...