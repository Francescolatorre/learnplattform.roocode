// src/types/common/taskts

import {IUser} from '@/types/user';


export type TTaskStatus = 'not_started' | 'in_progress' | 'completed' | 'graded' | 'pending';


/**
 * Interface für Aufgabenfortschritt eines Studenten
 */
export interface ITaskProgress {
    id: number;
    user: number;
    task: number;
    status: TTaskStatus;
    time_spent: string | null;
    completion_date?: string | null;
    user_details?: IUser;
    task_details?: ILearningTask;

    // Erweiterte Felder für UI-Komponenten
    taskId?: number; // Geändert von string zu number für Typkonsistenz
    moduleId?: number; // Geändert von string zu number für Typkonsistenz
    title?: string;
    description?: string;
    taskType?: string;
    dueDate?: string;
    score?: number | null;
    maxScore?: number;
    attempts?: number;
    maxAttempts?: number;
    submissionDate?: string;
    timeSpent?: number | null; // Optional und separater Typ von time_spent
}

/**
 * Interface für Daten zur Aktualisierung des Aufgabenfortschritts
 */
export interface ITaskProgressUpdateData {
    status?: TTaskStatus;
    time_spent?: string | null;
    completion_date?: string | null;
    // Weitere relevante Felder
}

/**
 * Interface für Aufgabeneinreichungsdaten
 */
export interface ITaskSubmissionData {
    content: string;
    attachments?: string[];
    // Weitere relevante Felder
}

/**
 * Interface für Aufgabenerstellungsdaten
 */
export interface ITaskCreationData {
    readonly id: number;
    title: string;
    description: string;
    course?: number;
    order?: number;
    is_published?: boolean;
    created_at?: string;
    updated_at?: string;
}

/**
 * Interface für Quiz-Verlauf
 */
export interface IQuizHistory {
    quizId: string;
    moduleId?: string;
    quizTitle: string;
    score: number;
    maxScore: number;
    attempts: number;
    maxAttempts: number;
    date: string;
    timeSpent: number;
    answers: Array<{
        questionId: string;
        correct: boolean;
        timeSpent: number;
    }>;
}

// Aufgaben-bezogene Typen
export interface ILearningTask {
    readonly id: number;
    course: number;
    title: string;
    description: string;
    order: number;
    created_at: string;
    updated_at: string;
    is_published: boolean;
}

export interface ITaskCreationData {
    readonly id: number;
    title: string;
    description: string;
    course?: number;
    order?: number;
    is_published?: boolean;
    created_at?: string;
    updated_at?: string;
}

export interface IBaseTaskProgress {
    id: number;
    user: number;
    task: number;
    status: TTaskStatus;
    time_spent: string | null;
    completion_date?: string | null;
    user_details?: IUser;
    task_details?: ILearningTask;
}

// Erweiterte Version für TaskProgress mit I-Präfix
export interface ITaskProgress extends IBaseTaskProgress {
    // Zusätzliche UI-spezifische Felder
    taskId?: number;
    moduleId?: number;
    title?: string;
    description?: string;
    taskType?: string;
    dueDate?: string;
    score?: number | null;
    maxScore?: number;
    attempts?: number;
    maxAttempts?: number;
    submissionDate?: string;
    timeSpent?: number | null;
}

// Exportiere beide, um Abwärtskompatibilität zu gewährleisten
export type ITaskProgressBase = IBaseTaskProgress;


