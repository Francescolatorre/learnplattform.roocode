// src/types/common/gradingTypes.ts

/**
 * Interface für Bewertungsdaten
 */
export interface IGradingData {
    score: number;
    feedback?: string;
    graded_by?: number;
    graded_at?: string;
    // Weitere relevante Felder
}

/**
 * Interface für Fortschrittsanalyse-Daten
 */
export interface IProgressAnalytics {
    completion_rate: number;
    average_score: number;
    student_count: number;
    task_completion_stats: Record<string, number>;
    // Weitere relevante Felder
}
