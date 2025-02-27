from django.db import models

class Course(models.Model):
    class Status:
        DRAFT = 'DRAFT'
        PUBLISHED = 'PUBLISHED'
        ARCHIVED = 'ARCHIVED'
        DEPRECATED = 'DEPRECATED'
        
    class Visibility:
        PUBLIC = 'PUBLIC'
        PRIVATE = 'PRIVATE'
        
    STATUS_CHOICES = [
        (Status.DRAFT, 'Draft'),
        (Status.PUBLISHED, 'Published'),
        (Status.ARCHIVED, 'Archived'),
        (Status.DEPRECATED, 'Deprecated'),
    ]
    
    VISIBILITY_CHOICES = [
        (Visibility.PUBLIC, 'Public'),
        (Visibility.PRIVATE, 'Private'),
    ]
    
    title = models.CharField(max_length=255)
    description = models.TextField()
    instructor = models.ForeignKey('users.User', on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=Status.DRAFT)
    visibility = models.CharField(max_length=20, choices=VISIBILITY_CHOICES, default=Visibility.PRIVATE)
    learning_objectives = models.TextField(blank=True, null=True)
    prerequisites = models.TextField(blank=True, null=True)

    class Meta:
        app_label = 'courses'

    def __str__(self) -> str:
        return str(self.title)
