from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils.translation import gettext_lazy as _

class User(AbstractUser):
    ROLE_CHOICES = [
        ('admin', _('Admin')),
        ('user', _('User')),
    ]

    display_name = models.CharField(
        _('Display Name'), 
        max_length=100, 
        blank=True
    )
    role = models.CharField(
        _('User Role'),
        max_length=20, 
        choices=ROLE_CHOICES, 
        default='user'
    )

    def __str__(self):
        return str(self.username or self.email or self.pk)

    class Meta:
        verbose_name = _('User')
        verbose_name_plural = _('Users')
