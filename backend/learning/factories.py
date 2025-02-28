from factory import DjangoModelFactory, Faker, SubFactory
from factory.django import DjangoModelFactory
from .models import LearningTask
from courses.factories import CourseFactory
from django.contrib.auth.models import User

class LearningTaskFactory(DjangoModelFactory):
    class Meta:
        model = LearningTask

    title = Faker('sentence', nb_words=6)
    description = Faker('text')
    course = SubFactory(CourseFactory)
    status = Faker('random_element', elements=['Draft', 'Published', 'Archived'])
    created_by = SubFactory('users.factories.UserFactory')
    max_submissions = Faker('random_int', min=1, max=10)
    deadline = Faker('future_datetime', end_date='+30d')
    points = Faker('random_int', min=0, max=100)
    task_type = Faker('random_element', elements=['Text', 'File', 'Quiz'])
    submission_instructions = Faker('text')
