import random

from django.core.management.base import BaseCommand

from core.models import Course, LearningTask, QuizOption, QuizQuestion, QuizTask, User


class Command(BaseCommand):
    help = "Creates sample data for the learning platform"

    def _create_task_description(self, task_number, course_title):
        """Creates a rich markdown description for learning tasks"""
        return f"""
## Learning Objectives
- Understand the core concepts of {course_title}
- Practice implementing solutions using real-world examples
- Build confidence in your skills

### Task Overview
This is task {task_number} in the {course_title} course.

#### Steps to Complete
1. Read the provided materials
2. Watch the video demonstration
3. Complete the practice exercises
4. Submit your solution

```python
# Example code snippet
def example():
    print("Hello from {course_title}")
```

> **Note**: Remember to test your code before submitting.

**Additional Resources:**
- [Documentation](https://docs.example.com)
- [Tutorial Video](https://video.example.com)
"""

    def _create_quiz_description(self, course_title):
        """Creates a rich markdown description for quizzes"""
        return f"""
## Quiz Instructions

This assessment will test your knowledge of {course_title}.

### Important Information:
- Time limit: 30 minutes
- Pass threshold: 70%
- Maximum attempts: 3

#### Guidelines:
1. Read each question carefully
2. Select the best answer
3. Review your answers before submitting

> **Tip**: Focus on understanding concepts rather than memorizing details.

**Good luck!**
"""

    def handle(self, *args, **kwargs):
        # Create admin superuser if it doesn't exist
        admin, created = User.objects.get_or_create(
            username="admin",
            defaults={
                "email": "admin@example.com",
                "role": "admin",
                "display_name": "Admin User",
                "is_staff": True,
                "is_superuser": True,
            },
        )
        if created:
            admin.set_password("adminpassword")
            admin.save()
            self.stdout.write(
                "Created admin superuser (username: admin, password: adminpassword)"
            )
        else:
            self.stdout.write("Admin superuser already exists (username: admin)")
        self.stdout.write("Creating sample data...")

        # Create instructor if it doesn't exist
        instructor, created = User.objects.get_or_create(
            username="instructor",
            defaults={
                "email": "instructor@example.com",
                "role": "instructor",
                "display_name": "Dr. Smith",
                "is_staff": True,
            },
        )

        if created:
            instructor.set_password("instructor123")
            instructor.save()
            self.stdout.write("Created instructor user")

        # Create student if it doesn't exist
        student, created = User.objects.get_or_create(
            username="student",
            defaults={
                "email": "student@example.com",
                "role": "student",
                "display_name": "John Doe",
            },
        )

        if created:
            student.set_password("student123")
            student.save()
            self.stdout.write(self.style.SUCCESS("Created student user"))

        # Create courses
        course_data = [
            {
                "title": "Introduction to Python Programming",
                "description": "Learn the basics of Python programming language",
                "status": "published",
                "visibility": "public",
                "learning_objectives": "Understand basic programming concepts and Python syntax",
                "prerequisites": "None, this is a beginner-friendly course",
            },
            {
                "title": "Web Development with Django",
                "description": "Build web applications using Django framework",
                "status": "published",
                "visibility": "public",
                "learning_objectives": "Build a fully functional web application",
                "prerequisites": "Basic Python knowledge",
            },
            {
                "title": "Advanced Machine Learning",
                "description": "Dive deep into machine learning algorithms",
                "status": "draft",
                "visibility": "private",
                "learning_objectives": "Implement and understand complex ML algorithms",
                "prerequisites": "Python, statistics, and basic ML knowledge",
            },
            {
                "title": "Project Management Fundamentals",
                "description": """Master the essentials of project management including Agile,
                Scrum, and traditional methodologies. Learn to lead teams, manage resources,
                and deliver successful projects.""",
                "status": "published",
                "visibility": "public",
                "learning_objectives": """
- Understand project management methodologies
- Master project planning and execution
- Learn team leadership and stakeholder management
- Practice risk assessment and mitigation
- Develop project documentation skills""",
                "prerequisites": "Basic team collaboration experience",
            },
        ]

        for course_info in course_data:
            course, created = Course.objects.get_or_create(
                title=course_info["title"],
                defaults={
                    "description": course_info["description"],
                    "status": course_info["status"],
                    "visibility": course_info["visibility"],
                    "learning_objectives": course_info["learning_objectives"],
                    "prerequisites": course_info["prerequisites"],
                    "creator": instructor,
                },
            )

            if created:
                self.stdout.write(self.style.SUCCESS(f"Created course: {course.title}"))

                # Create regular learning tasks first
                for i in range(1, 4):
                    task = LearningTask.objects.create(
                        course=course,
                        title=f"Task {i}: {course.title} Basics",
                        description=self._create_task_description(i, course.title),
                        order=i,
                        is_published=True,
                    )
                    self.stdout.write(
                        self.style.SUCCESS(f"Created learning task: {task.title}")
                    )

                # Create quiz as a separate task
                quiz = QuizTask.objects.create(
                    course=course,
                    title=f"Quiz: {course.title} Assessment",
                    description=self._create_quiz_description(course.title),
                    order=4,
                    is_published=True,
                    time_limit_minutes=30,
                    pass_threshold=70,
                    max_attempts=3,
                    randomize_questions=True,
                )
                self.stdout.write(f"Created quiz: {quiz.title}")

                # Create questions for the quiz
                question_types = [
                    "Define the concept of",
                    "Explain how to use",
                    "What is the purpose of",
                    "How would you implement",
                    "Compare and contrast",
                ]

                for j, question_type in enumerate(question_types, 1):
                    question = QuizQuestion.objects.create(
                        quiz=quiz,
                        text=f"{question_type} {course.title.split()[-1]}?",
                        explanation=f"This tests understanding of core {course.title} concepts",
                        points=1,
                        order=j,
                    )

                    # Create options for the question
                    correct_option = random.randint(1, 4)
                    for k in range(1, 5):
                        QuizOption.objects.create(
                            question=question,
                            text=f"Option {k} for {question.text}",
                            is_correct=(k == correct_option),
                            order=k,
                            explanation=f'{"Correct answer" if k == correct_option else "Incorrect"}',
                        )

                    self.stdout.write(f"Created question with options: {question.text}")

                # Customize questions for Project Management course
                if course.title == "Project Management Fundamentals":
                    question_types = [
                        (
                            "What is the purpose of",
                            [
                                "To track project progress and identify bottlenecks",
                                "To create unnecessary documentation",
                                "To delay project completion",
                                "To increase project costs",
                            ],
                        ),
                        (
                            "How would you handle",
                            [
                                "Communicate with stakeholders and adjust the project plan",
                                "Ignore the issue and hope it resolves itself",
                                "Blame team members for the situation",
                                "Cancel the project immediately",
                            ],
                        ),
                        (
                            "Explain the concept of",
                            [
                                "A measurable achievement that contributes to project success",
                                "An optional task that can be ignored",
                                "A way to extend project deadlines",
                                "A method to increase project budget",
                            ],
                        ),
                        (
                            "What is the best approach for",
                            [
                                "Regular team meetings and clear communication channels",
                                "Letting team members work in isolation",
                                "Avoiding documentation of decisions",
                                "Skipping project planning phases",
                            ],
                        ),
                        (
                            "How do you manage",
                            [
                                "Through systematic identification and mitigation strategies",
                                "By ignoring potential problems",
                                "By hiding issues from stakeholders",
                                "By avoiding project planning",
                            ],
                        ),
                    ]

                    for j, (question_type, options) in enumerate(question_types, 1):
                        question = QuizQuestion.objects.create(
                            quiz=quiz,
                            text=f"{question_type} project risk management?",
                            explanation="Understanding project management principles is crucial for success",
                            points=1,
                            order=j,
                        )

                        # Create options with predefined correct answer
                        for k, option_text in enumerate(options, 1):
                            QuizOption.objects.create(
                                question=question,
                                text=option_text,
                                is_correct=(k == 1),  # First option is always correct
                                order=k,
                                explanation=f'{"Correct - Best practice in project management" if k == 1 else "Incorrect - This approach is not recommended"}',
                            )

        self.stdout.write("Sample data creation completed!")
