// src/types/common/tasks.ts

import {IUser} from '@/types/userTypes';

/**
 * Aufgabenstatus-Typ
 */
export type TTaskStatus = 'not_started' | 'in_progress' | 'completed' | 'graded' | 'pending';

/**
 * Interface für Lernaufgaben
 */
export interface ILearningTask {
    readonly id: string;
    course: number;
    course_id: string;
    title: string;
    description: string;
    description_html?: string;
    order: number;
    created_at: string;
    updated_at: string;
    is_published: boolean;
    points?: number;
    due_date?: string;
    status: 'draft' | 'published' | 'archived';
}

/**
 * Interface für Aufgabenerstellungsdaten
 * Teilmenge von ILearningTask für die Erstellung neuer Aufgaben
 */
export interface ITaskCreationData {
    readonly id?: string; // Optional bei der Erstellung, wird vom Server generiert
    title: string;
    description: string;
    description_html?: string;
    course?: number;
    course_id?: string;
    order?: number;
    is_published?: boolean;
    status?: 'draft' | 'published' | 'archived';
    points?: number;
    due_date?: string;
    created_at?: string;
    updated_at?: string;
}

/**
 * Basis-Interface für Aufgabenfortschritt eines Studenten
 */
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

/**
 * Erweiterte Version für TaskProgress mit UI-spezifischen Feldern
 */
export interface ITaskProgress extends IBaseTaskProgress {
    // UI-spezifische Felder
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
    timeSpent?: number | null; // Optional und separater Typ von time_spent
}

/**
 * Interface für Daten zur Aktualisierung des Aufgabenfortschritts
 */
export interface ITaskProgressUpdateData {
    status?: TTaskStatus;
    time_spent?: string | null;
    completion_date?: string | null;
}

/**
 * Interface für Aufgabeneinreichungsdaten
 */
export interface ITaskSubmissionData {
    content: string;
    attachments?: string[];
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

// Exportiere ITaskProgressBase für Abwärtskompatibilität
export type ITaskProgressBase = IBaseTaskProgress;
