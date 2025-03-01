from django.core.management.base import BaseCommand

from learning.models import Course


class Command(BaseCommand):
    help = 'Updates the status of all courses to PUBLISHED'

    def handle(self, *args, **options):
        for course in Course.objects.all():
            course.status = Course.Status.PUBLISHED
            course.save()
        self.stdout.write(self.style.SUCCESS('Successfully updated course statuses to PUBLISHED'))
