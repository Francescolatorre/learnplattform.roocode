/**
 * Test Data Builders for Educational Platform
 *
 * Provides builder pattern implementations for creating realistic test data
 * with educational context. Focuses on educational domain relationships
 * and realistic data patterns for comprehensive testing.
 *
 * ## Key Features
 * - Educational domain-specific builders (Course, Task, User, Enrollment)
 * - Realistic data relationships and constraints
 * - Configurable data scenarios for different test cases
 * - Performance optimized with data caching
 * - Consistent data patterns across all test suites
 *
 * ## Usage Example
 * ```typescript
 * // Create a course with enrolled students and tasks
 * const course = new CourseBuilder()
 *   .withTitle('Advanced Algorithms')
 *   .withInstructor(TestDataBuilder.instructor())
 *   .withEnrolledStudents(25)
 *   .withTasks(5)
 *   .build();
 *
 * // Create a student with progress
 * const student = new UserBuilder()
 *   .asStudent()
 *   .withProgress(course.id, 75)
 *   .build();
 * ```
 *
 * @since 2025-09-20 (TASK-059 Test Suite Modernization)
 */

import { ICourse, TCourseStatus } from '@/types/course';
import { ILearningTask, ITaskCreationData } from '@/types/Task';
import { IUser, UserRoleEnum } from '@/types/userTypes';
import { ICourseEnrollment } from '@/types/entities';

/**
 * Base interface for all test data builders
 */
interface ITestDataBuilder<T> {
  build(): T;
  reset(): this;
}

/**
 * Educational context for realistic test data
 */
interface EducationalContext {
  institutionName: string;
  academicYear: string;
  semester: string;
  subjects: string[];
  difficultyLevels: string[];
}

/**
 * Default educational context for consistent test data
 */
const DEFAULT_EDUCATIONAL_CONTEXT: EducationalContext = {
  institutionName: 'Test University',
  academicYear: '2025-2026',
  semester: 'Fall 2025',
  subjects: [
    'Computer Science',
    'Mathematics',
    'Physics',
    'Biology',
    'Chemistry',
    'English Literature',
    'History',
    'Psychology',
  ],
  difficultyLevels: ['Beginner', 'Intermediate', 'Advanced', 'Expert'],
};

/**
 * Test data generation utilities
 */
class DataGenerationUtils {
  private static idCounters: Record<string, number> = {};

  /**
   * Generate unique ID for given prefix
   */
  static generateId(prefix: string): string {
    if (!this.idCounters[prefix]) {
      this.idCounters[prefix] = 0;
    }
    return `${prefix}-${++this.idCounters[prefix]}`;
  }

  /**
   * Generate random element from array
   */
  static randomFromArray<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)];
  }

  /**
   * Generate random number between min and max
   */
  static randomBetween(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  /**
   * Generate random date within range
   */
  static randomDateBetween(start: Date, end: Date): Date {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  }

  /**
   * Generate educational email address
   */
  static generateEducationalEmail(firstName: string, lastName: string, domain: string = 'test-university.edu'): string {
    return `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${domain}`;
  }

  /**
   * Generate realistic course titles
   */
  static generateCourseTitle(subject?: string): string {
    const subjects = subject ? [subject] : DEFAULT_EDUCATIONAL_CONTEXT.subjects;
    const selectedSubject = this.randomFromArray(subjects);

    const coursePrefixes = {
      'Computer Science': ['Introduction to', 'Advanced', 'Fundamentals of', 'Modern', 'Applied'],
      'Mathematics': ['Calculus', 'Linear Algebra', 'Statistics', 'Discrete Mathematics', 'Applied Mathematics'],
      'Physics': ['General Physics', 'Modern Physics', 'Quantum Mechanics', 'Thermodynamics', 'Electromagnetism'],
      'Biology': ['General Biology', 'Molecular Biology', 'Genetics', 'Ecology', 'Microbiology'],
      'Chemistry': ['General Chemistry', 'Organic Chemistry', 'Physical Chemistry', 'Analytical Chemistry', 'Biochemistry'],
      'English Literature': ['American Literature', 'British Literature', 'World Literature', 'Contemporary Literature', 'Classical Literature'],
      'History': ['World History', 'American History', 'European History', 'Ancient History', 'Modern History'],
      'Psychology': ['General Psychology', 'Cognitive Psychology', 'Social Psychology', 'Developmental Psychology', 'Clinical Psychology'],
    };

    const prefix = this.randomFromArray(coursePrefixes[selectedSubject as keyof typeof coursePrefixes] || ['Introduction to']);
    return `${prefix} ${selectedSubject}`;
  }

  /**
   * Reset all ID counters for test isolation
   */
  static resetCounters(): void {
    this.idCounters = {};
  }
}

/**
 * Course Builder for educational course test data
 */
export class CourseBuilder implements ITestDataBuilder<ICourse> {
  private course: Partial<ICourse> = {};
  private shouldGenerateDefaults = true;

  /**
   * Set course title
   */
  withTitle(title: string): this {
    this.course.title = title;
    return this;
  }

  /**
   * Set course description
   */
  withDescription(description: string): this {
    this.course.description = description;
    return this;
  }

  /**
   * Set course instructor
   */
  withInstructor(instructor: IUser): this {
    this.course.instructor = instructor;
    return this;
  }

  /**
   * Set course status
   */
  withStatus(status: TCourseStatus): this {
    this.course.status = status;
    return this;
  }

  /**
   * Configure course as published and active
   */
  asPublished(): this {
    this.course.status = 'published';
    return this;
  }

  /**
   * Configure course as draft
   */
  asDraft(): this {
    this.course.status = 'draft';
    return this;
  }

  /**
   * Configure course as archived
   */
  asArchived(): this {
    this.course.status = 'archived';
    return this;
  }

  /**
   * Add enrolled students to course
   */
  withEnrolledStudents(count: number): this {
    const enrollments: ICourseEnrollment[] = [];
    for (let i = 0; i < count; i++) {
      const student = new UserBuilder().asStudent().build();
      enrollments.push(
        new EnrollmentBuilder()
          .forCourse(this.course.id || 'temp-course-id')
          .forStudent(student.id)
          .withStatus('active')
          .build()
      );
    }
    (this.course as any).enrollments = enrollments;
    return this;
  }

  /**
   * Add learning tasks to course
   */
  withTasks(count: number): this {
    const tasks: ILearningTask[] = [];
    for (let i = 0; i < count; i++) {
      tasks.push(
        new TaskBuilder()
          .forCourse(this.course.id || 'temp-course-id')
          .withRandomTitle()
          .build()
      );
    }
    (this.course as any).tasks = tasks;
    return this;
  }

  /**
   * Configure course for specific subject area
   */
  inSubject(subject: string): this {
    this.course.title = DataGenerationUtils.generateCourseTitle(subject);
    this.course.description = `Comprehensive ${subject} course covering fundamental and advanced concepts.`;
    return this;
  }

  /**
   * Configure course duration
   */
  withDuration(weeks: number): this {
    const startDate = new Date();
    const endDate = new Date(startDate.getTime() + weeks * 7 * 24 * 60 * 60 * 1000);
    (this.course as any).start_date = startDate.toISOString();
    (this.course as any).end_date = endDate.toISOString();
    return this;
  }

  /**
   * Build the course with defaults if needed
   */
  build(): ICourse {
    if (this.shouldGenerateDefaults) {
      this.applyDefaults();
    }

    return {
      id: this.course.id || DataGenerationUtils.generateId('course'),
      title: this.course.title || DataGenerationUtils.generateCourseTitle(),
      description: this.course.description || 'A comprehensive course designed to provide students with essential knowledge and practical skills.',
      status: this.course.status || 'published',
      instructor: this.course.instructor || new UserBuilder().asInstructor().build(),
      created_at: (this.course as any).created_at || new Date().toISOString(),
      updated_at: (this.course as any).updated_at || new Date().toISOString(),
      ...this.course,
    } as ICourse;
  }

  /**
   * Reset builder to initial state
   */
  reset(): this {
    this.course = {};
    this.shouldGenerateDefaults = true;
    return this;
  }

  /**
   * Apply default values for realistic course data
   */
  private applyDefaults(): void {
    if (!this.course.id) {
      this.course.id = DataGenerationUtils.generateId('course');
    }
    if (!this.course.instructor) {
      this.course.instructor = new UserBuilder().asInstructor().build();
    }
  }
}

/**
 * User Builder for educational platform users
 */
export class UserBuilder implements ITestDataBuilder<IUser> {
  private user: Partial<IUser> = {};
  private shouldGenerateDefaults = true;

  /**
   * Configure user as student
   */
  asStudent(): this {
    this.user.role = UserRoleEnum.STUDENT;
    return this;
  }

  /**
   * Configure user as instructor
   */
  asInstructor(): this {
    this.user.role = UserRoleEnum.INSTRUCTOR;
    return this;
  }

  /**
   * Configure user as admin
   */
  asAdmin(): this {
    this.user.role = UserRoleEnum.ADMIN;
    return this;
  }

  /**
   * Set user's first name
   */
  withFirstName(firstName: string): this {
    this.user.first_name = firstName;
    return this;
  }

  /**
   * Set user's last name
   */
  withLastName(lastName: string): this {
    this.user.last_name = lastName;
    return this;
  }

  /**
   * Set user's username
   */
  withUsername(username: string): this {
    this.user.username = username;
    return this;
  }

  /**
   * Set user's email
   */
  withEmail(email: string): this {
    this.user.email = email;
    return this;
  }

  /**
   * Configure user with progress in specific course
   */
  withProgress(courseId: string, progressPercentage: number): this {
    (this.user as any).courseProgress = {
      [courseId]: {
        percentage: progressPercentage,
        lastAccessed: new Date().toISOString(),
        tasksCompleted: Math.floor(progressPercentage / 20), // Rough estimation
      },
    };
    return this;
  }

  /**
   * Configure user with multiple course enrollments
   */
  withEnrollments(courseIds: string[]): this {
    (this.user as any).enrollments = courseIds.map(courseId =>
      new EnrollmentBuilder()
        .forCourse(courseId)
        .forStudent(this.user.id || 'temp-user-id')
        .withStatus('active')
        .build()
    );
    return this;
  }

  /**
   * Build the user with defaults if needed
   */
  build(): IUser {
    if (this.shouldGenerateDefaults) {
      this.applyDefaults();
    }

    return {
      id: this.user.id || DataGenerationUtils.generateId('user'),
      username: this.user.username || this.generateUsername(),
      email: this.user.email || this.generateEmail(),
      first_name: this.user.first_name || this.generateFirstName(),
      last_name: this.user.last_name || this.generateLastName(),
      role: this.user.role || UserRoleEnum.STUDENT,
      is_active: true,
      date_joined: (this.user as any).date_joined || new Date().toISOString(),
      ...this.user,
    } as IUser;
  }

  /**
   * Reset builder to initial state
   */
  reset(): this {
    this.user = {};
    this.shouldGenerateDefaults = true;
    return this;
  }

  /**
   * Apply default values for realistic user data
   */
  private applyDefaults(): void {
    if (!this.user.role) {
      this.user.role = UserRoleEnum.STUDENT;
    }
  }

  /**
   * Generate realistic username
   */
  private generateUsername(): string {
    const firstNames = ['john', 'jane', 'alex', 'sam', 'taylor', 'jordan', 'casey', 'riley'];
    const lastNames = ['smith', 'doe', 'johnson', 'brown', 'wilson', 'davis', 'miller', 'garcia'];

    const firstName = DataGenerationUtils.randomFromArray(firstNames);
    const lastName = DataGenerationUtils.randomFromArray(lastNames);
    const number = DataGenerationUtils.randomBetween(1, 999);

    return `${firstName}${lastName}${number}`;
  }

  /**
   * Generate realistic email
   */
  private generateEmail(): string {
    const firstName = this.user.first_name || this.generateFirstName();
    const lastName = this.user.last_name || this.generateLastName();
    return DataGenerationUtils.generateEducationalEmail(firstName, lastName);
  }

  /**
   * Generate realistic first name
   */
  private generateFirstName(): string {
    const names = ['John', 'Jane', 'Alex', 'Sam', 'Taylor', 'Jordan', 'Casey', 'Riley', 'Morgan', 'Avery'];
    return DataGenerationUtils.randomFromArray(names);
  }

  /**
   * Generate realistic last name
   */
  private generateLastName(): string {
    const names = ['Smith', 'Doe', 'Johnson', 'Brown', 'Wilson', 'Davis', 'Miller', 'Garcia', 'Martinez', 'Anderson'];
    return DataGenerationUtils.randomFromArray(names);
  }
}

/**
 * Task Builder for learning tasks and assignments
 */
export class TaskBuilder implements ITestDataBuilder<ILearningTask> {
  private task: Partial<ILearningTask> = {};
  private shouldGenerateDefaults = true;

  /**
   * Set task title
   */
  withTitle(title: string): this {
    this.task.title = title;
    return this;
  }

  /**
   * Generate random realistic task title
   */
  withRandomTitle(): this {
    const taskTypes = [
      'Assignment', 'Project', 'Quiz', 'Exam', 'Lab Report',
      'Essay', 'Discussion', 'Presentation', 'Research Paper', 'Case Study'
    ];
    const numbers = DataGenerationUtils.randomBetween(1, 10);
    const type = DataGenerationUtils.randomFromArray(taskTypes);
    this.task.title = `${type} ${numbers}`;
    return this;
  }

  /**
   * Set task description
   */
  withDescription(description: string): this {
    this.task.description = description;
    return this;
  }

  /**
   * Set course for this task
   */
  forCourse(courseId: string): this {
    this.task.course = courseId;
    return this;
  }

  /**
   * Set task due date
   */
  withDueDate(dueDate: Date): this {
    (this.task as any).due_date = dueDate.toISOString();
    return this;
  }

  /**
   * Set task due in X days from now
   */
  dueInDays(days: number): this {
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + days);
    return this.withDueDate(dueDate);
  }

  /**
   * Configure task as overdue
   */
  asOverdue(): this {
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - DataGenerationUtils.randomBetween(1, 7));
    return this.withDueDate(pastDate);
  }

  /**
   * Set task points/weight
   */
  withPoints(points: number): this {
    (this.task as any).points = points;
    return this;
  }

  /**
   * Configure task as quiz
   */
  asQuiz(): this {
    this.task.title = `Quiz ${DataGenerationUtils.randomBetween(1, 10)}`;
    this.task.description = 'Complete the quiz by the due date. Multiple attempts may be allowed.';
    (this.task as any).task_type = 'quiz';
    (this.task as any).points = DataGenerationUtils.randomBetween(10, 50);
    return this;
  }

  /**
   * Configure task as assignment
   */
  asAssignment(): this {
    this.task.title = `Assignment ${DataGenerationUtils.randomBetween(1, 10)}`;
    this.task.description = 'Complete the assignment according to the provided instructions and rubric.';
    (this.task as any).task_type = 'assignment';
    (this.task as any).points = DataGenerationUtils.randomBetween(50, 100);
    return this;
  }

  /**
   * Configure task as published
   */
  asPublished(): this {
    this.task.is_published = true;
    return this;
  }

  /**
   * Configure task as draft
   */
  asDraft(): this {
    this.task.is_published = false;
    return this;
  }

  /**
   * Build the task with defaults if needed
   */
  build(): ILearningTask {
    if (this.shouldGenerateDefaults) {
      this.applyDefaults();
    }

    return {
      id: Number(this.task.id) || DataGenerationUtils.generateId('task'),
      title: this.task.title || 'Sample Task',
      description: this.task.description || 'Complete this task according to the provided instructions.',
      course: Number(this.task.course) || 1,
      order: this.task.order || 1,
      is_published: this.task.is_published !== undefined ? this.task.is_published : true,
      created_at: (this.task as any).created_at || new Date().toISOString(),
      updated_at: (this.task as any).updated_at || new Date().toISOString(),
      ...this.task,
    } as ILearningTask;
  }

  /**
   * Reset builder to initial state
   */
  reset(): this {
    this.task = {};
    this.shouldGenerateDefaults = true;
    return this;
  }

  /**
   * Apply default values for realistic task data
   */
  private applyDefaults(): void {
    if (!(this.task as any).due_date) {
      this.dueInDays(DataGenerationUtils.randomBetween(1, 14));
    }
    if (!(this.task as any).points) {
      (this.task as any).points = DataGenerationUtils.randomBetween(10, 100);
    }
  }
}

/**
 * Enrollment Builder for course enrollments
 */
export class EnrollmentBuilder implements ITestDataBuilder<ICourseEnrollment> {
  private enrollment: Partial<ICourseEnrollment> = {};
  private shouldGenerateDefaults = true;

  /**
   * Set course for enrollment
   */
  forCourse(courseId: string): this {
    this.enrollment.course = Number(courseId) || courseId as any;
    return this;
  }

  /**
   * Set student for enrollment
   */
  forStudent(studentId: string): this {
    this.enrollment.user = Number(studentId) || studentId as any;
    return this;
  }

  /**
   * Set enrollment status
   */
  withStatus(status: string): this {
    this.enrollment.status = status;
    return this;
  }

  /**
   * Set enrollment date
   */
  withEnrollmentDate(date: Date): this {
    this.enrollment.enrollment_date = date.toISOString();
    return this;
  }

  /**
   * Configure as active enrollment
   */
  asActive(): this {
    this.enrollment.status = 'active';
    return this;
  }

  /**
   * Configure as dropped enrollment
   */
  asDropped(): this {
    this.enrollment.status = 'dropped';
    return this;
  }

  /**
   * Configure as pending enrollment
   */
  asPending(): this {
    this.enrollment.status = 'pending';
    return this;
  }

  /**
   * Build the enrollment with defaults if needed
   */
  build(): ICourseEnrollment {
    if (this.shouldGenerateDefaults) {
      this.applyDefaults();
    }

    return {
      id: this.enrollment.id || Number(DataGenerationUtils.generateId('enrollment').replace('enrollment-', '')),
      course: this.enrollment.course || 1,
      user: this.enrollment.user || 1,
      status: this.enrollment.status || 'active',
      enrollment_date: this.enrollment.enrollment_date || new Date().toISOString(),
      ...this.enrollment,
    } as ICourseEnrollment;
  }

  /**
   * Reset builder to initial state
   */
  reset(): this {
    this.enrollment = {};
    this.shouldGenerateDefaults = true;
    return this;
  }

  /**
   * Apply default values for realistic enrollment data
   */
  private applyDefaults(): void {
    if (!this.enrollment.enrollment_date) {
      const enrollmentDate = DataGenerationUtils.randomDateBetween(
        new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), // 90 days ago
        new Date() // now
      );
      this.enrollment.enrollment_date = enrollmentDate.toISOString();
    }
  }
}

/**
 * Main TestDataBuilder class - provides convenient static methods
 */
export class TestDataBuilder {
  /**
   * Create a course builder
   */
  static course(): CourseBuilder {
    return new CourseBuilder();
  }

  /**
   * Create a user builder
   */
  static user(): UserBuilder {
    return new UserBuilder();
  }

  /**
   * Create a student user
   */
  static student(): IUser {
    return new UserBuilder().asStudent().build();
  }

  /**
   * Create an instructor user
   */
  static instructor(): IUser {
    return new UserBuilder().asInstructor().build();
  }

  /**
   * Create an admin user
   */
  static admin(): IUser {
    return new UserBuilder().asAdmin().build();
  }

  /**
   * Create a task builder
   */
  static task(): TaskBuilder {
    return new TaskBuilder();
  }

  /**
   * Create an enrollment builder
   */
  static enrollment(): EnrollmentBuilder {
    return new EnrollmentBuilder();
  }

  /**
   * Create multiple students
   */
  static students(count: number): IUser[] {
    const students: IUser[] = [];
    for (let i = 0; i < count; i++) {
      students.push(this.student());
    }
    return students;
  }

  /**
   * Create a complete course with students and tasks
   */
  static completeCourse(studentCount: number = 15, taskCount: number = 5): ICourse {
    return new CourseBuilder()
      .withInstructor(this.instructor())
      .withEnrolledStudents(studentCount)
      .withTasks(taskCount)
      .asPublished()
      .build();
  }

  /**
   * Reset all data generation counters for test isolation
   */
  static reset(): void {
    DataGenerationUtils.resetCounters();
  }

  /**
   * Get educational context for test scenarios
   */
  static getEducationalContext(): EducationalContext {
    return { ...DEFAULT_EDUCATIONAL_CONTEXT };
  }
}