export interface User {
    id: number;
    username: string;
    email: string;
    display_name?: string;
    role: string;
}

export interface Course {
    id: number;
    title: string;
    description: string;
    version?: number;
    status: string;
    visibility: string;
    learning_objectives?: string;
    prerequisites?: string;
    created_at?: string;
    updated_at?: string;
    creator?: number | null;
    creator_details?: User;
}

export interface CourseEnrollment {
    id: number;
    user: number;
    course: number;
    enrollment_date?: string;
    status: string;
    settings?: Record<string, any> | null;
    user_details?: User;
    course_details?: Course;
    progress_percentage?: string;
}

export interface CourseVersion {
    id: number;
    course: number;
    version_number: number;
    created_at?: string;
    content_snapshot: Record<string, any>;
    notes?: string;
    created_by?: number | null;
    created_by_details?: User;
}

export interface LearningTask {
    id: number;
    course: number;
    title: string;
    description: string;
    order?: number;
    is_published: boolean;
    created_at?: string;
    updated_at?: string;
}

export interface QuizOption {
    id: number;
    question: number;
    text: string;
    is_correct?: boolean;
    order?: number;
}

export interface QuizQuestion {
    id: number;
    quiz: string;
    text: string;
    explanation?: string;
    points?: number;
    order?: number;
    options?: QuizOption[];
}

export interface QuizTask {
    id: number;
    course: number;
    title: string;
    description: string;
    order?: number;
    is_published: boolean;
    created_at?: string;
    updated_at?: string;
    time_limit_minutes?: number;
    pass_threshold?: number;
    max_attempts?: number;
    randomize_questions?: boolean;
    questions?: QuizQuestion[];
}

export interface QuizResponse {
    id: number;
    attempt: number;
    question: number;
    selected_option: number;
    is_correct: boolean;
    time_spent: string;
    question_details?: QuizQuestion;
    selected_option_details?: QuizOption;
}

export interface QuizAttempt {
    id: number;
    user: number;
    quiz: string;
    score: number;
    time_taken: string;
    completion_status: string;
    attempt_date?: string;
    user_details?: User;
    quiz_details?: QuizTask;
    responses?: QuizResponse[];
}

export interface TaskProgress {
    id: number;
    user: number;
    task: number;
    status: string;
    time_spent?: string;
    completion_date?: string | null;
    user_details?: User;
    task_details?: LearningTask;
}

export interface CustomTokenObtainPair {
    username: string;
    password: string;
}

export interface Register {
    username: string;
    password: string;
    password2: string;
    email: string;
    display_name?: string;
    role?: string;
}

export interface TokenRefresh {
    refresh: string;
    access?: string;
}
