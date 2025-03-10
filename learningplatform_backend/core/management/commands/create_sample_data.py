from django.core.management.base import BaseCommand
from django.utils import timezone
from core.models import User, Course, LearningTask, QuizTask, QuizQuestion, QuizOption
import random


class Command(BaseCommand):
    help = 'Creates sample data for the learning platform'

    def handle(self, *args, **kwargs):
        self.stdout.write(self.style.SUCCESS('Creating sample data...'))

        # Create instructor if it doesn't exist
        instructor, created = User.objects.get_or_create(
            username='instructor',
            defaults={
                'email': 'instructor@example.com',
                'role': 'instructor',
                'display_name': 'Dr. Smith',
                'is_staff': True
            }
        )

        if created:
            instructor.set_password('instructor123')
            instructor.save()
            self.stdout.write(self.style.SUCCESS('Created instructor user'))

        # Create student if it doesn't exist
        student, created = User.objects.get_or_create(
            username='student',
            defaults={
                'email': 'student@example.com',
                'role': 'student',
                'display_name': 'John Doe'
            }
        )

        if created:
            student.set_password('student123')
            student.save()
            self.stdout.write(self.style.SUCCESS('Created student user'))

        # Create courses
        course_data = [
            {
                'title': 'Introduction to Python Programming',
                'description': 'Learn the basics of Python programming language',
                'status': 'published',
                'visibility': 'public',
                'learning_objectives': 'Understand basic programming concepts and Python syntax',
                'prerequisites': 'None, this is a beginner-friendly course'
            },
            {
                'title': 'Web Development with Django',
                'description': 'Build web applications using Django framework',
                'status': 'published',
                'visibility': 'public',
                'learning_objectives': 'Build a fully functional web application',
                'prerequisites': 'Basic Python knowledge'
            },
            {
                'title': 'Advanced Machine Learning',
                'description': 'Dive deep into machine learning algorithms',
                'status': 'draft',
                'visibility': 'private',
                'learning_objectives': 'Implement and understand complex ML algorithms',
                'prerequisites': 'Python, statistics, and basic ML knowledge'
            }
        ]

        for course_info in course_data:
            course, created = Course.objects.get_or_create(
                title=course_info['title'],
                defaults={
                    'description': course_info['description'],
                    'status': course_info['status'],
                    'visibility': course_info['visibility'],
                    'learning_objectives': course_info['learning_objectives'],
                    'prerequisites': course_info['prerequisites'],
                    'creator': instructor
                }
            )

            if created:
                self.stdout.write(self.style.SUCCESS(f'Created course: {course.title}'))

                # Create learning tasks for each course
                for i in range(1, 4):
                    task = LearningTask.objects.create(
                        course=course,
                        title=f'Learning Task {i} for {course.title}',
                        description=f'This is a learning task for {course.title}',
                        order=i,
                        is_published=True
                    )
                    self.stdout.write(self.style.SUCCESS(f'Created learning task: {task.title}'))

                # Create a quiz for the course
                quiz = QuizTask.objects.create(
                    course=course,
                    title=f'Quiz for {course.title}',
                    description=f'Test your knowledge of {course.title}',
                    order=4,
                    is_published=True,
                    time_limit_minutes=30,
                    pass_threshold=70,
                    max_attempts=3,
                    randomize_questions=True
                )
                self.stdout.write(self.style.SUCCESS(f'Created quiz: {quiz.title}'))

                # Create questions for the quiz
                for j in range(1, 6):
                    question = QuizQuestion.objects.create(
                        quiz=quiz,
                        text=f'Sample question {j} for {quiz.title}',
                        explanation=f'This is an explanation for question {j}',
                        points=1,
                        order=j
                    )

                    # Create options for the question
                    correct_option = random.randint(1, 4)
                    for k in range(1, 5):
                        QuizOption.objects.create(
                            question=question,
                            text=f'Option {k} for question {j}',
                            is_correct=(k == correct_option),
                            order=k
                        )

                    self.stdout.write(self.style.SUCCESS(f'Created question with options: {question.text}'))

        self.stdout.write(self.style.SUCCESS('Sample data creation completed!'))
