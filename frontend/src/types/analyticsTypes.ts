// src/types/common/analyticsTypes.ts

/**
 * Interface für Fortschrittsanalysen eines Kurses
 * Basierend auf der API-Endpunkt: /api/v1/courses/{id}/analytics/
 */
export interface IProgressAnalytics {
    // Allgemeine Kursinformationen
    course_id: number;
    course_title: string;
    total_students: number;

    // Fortschrittsstatistiken
    completion_rate: number;
    average_score: number;
    time_spent_average: string; // Format: "HH:MM:SS"

    // Aufgabenaufschlüsselung
    task_completion_breakdown: Record<string, number>; // Aufgaben-ID zu Abschlussrate
    task_average_times: Record<string, string>; // Aufgaben-ID zu Durchschnittszeit

    // Teilnehmerinformationen
    student_participation: {
        active: number;
        inactive: number;
        total: number;
    };
}

/**
 * Interface für die Zusammenfassung des Studentenfortschritts
 * Basierend auf der API-Endpunkt: /api/v1/students/{id}/progress/
 */
export interface IStudentProgressSummary {
    user_id: number;
    username: string;
    overall_progress: number; // Prozentsatz (0-100)
    courses_enrolled: number;
    courses_completed: number;

    // Fortschrittsinformationen nach Kurs
    courses: Array<{
        course_id: number;
        course_title: string;
        enrollment_date: string;
        progress_percentage: number;
        tasks_completed: number;
        total_tasks: number;
    }>;

    // Letzte Aktivitäten
    recent_activities: Array<{
        course_id: number;
        course_title: string;
        activity_type: string;
        task_id?: number;
        task_title?: string;
        timestamp: string;
    }>;
}

/**
 * Interface für Instructor-Dashboard-Daten
 * Basierend auf der API-Endpunkt: /api/v1/instructor/dashboard/
 */
export interface IInstructorDashboardData {
    instructor_id: number;
    instructor_name: string;

    // Kurszusammenfassung
    active_courses: number;
    total_students: number;
    average_course_completion: number;

    // Kursaktivitätszusammenfassung
    course_activity_summary: Array<{
        course_id: number;
        course_title: string;
        student_count: number;
        average_progress: number;
        last_updated: string;
    }>;

    // Aufgabenzusammenfassung
    tasks_requiring_attention: Array<{
        course_id: number;
        course_title: string;
        task_id: number;
        task_title: string;
        students_pending: number;
    }>;

    // Leistungsstatistiken
    performance_analytics: {
        best_performing_course: {
            course_id: number;
            course_title: string;
            average_score: number;
        };
        most_engaged_course: {
            course_id: number;
            course_title: string;
            engagement_score: number;
        };
    };
}

/**
 * Interface für Kursstrukturanalysen
 * Basierend auf der API-Endpunkt: /api/v1/courses/{id}/task-analytics/
 */
export interface ICourseStructureAnalytics {
    course_id: number;
    course_title: string;

    // Aufgabenstatistiken
    total_tasks: number;
    published_tasks: number;

    // Verteilung nach Aufgabentyp
    task_types_distribution: Record<string, number>; // Typ zu Anzahl

    // Zeitschätzungen
    estimated_completion_time: string; // Format: "HH:MM:SS"
    average_time_per_task: string; // Format: "HH:MM:SS"

    // Aufgabenspezifische Daten
    tasks: Array<{
        task_id: number;
        task_title: string;
        completion_rate: number;
        average_time: string;
        difficulty_score: number;
    }>;
}

/**
 * Interface für Bewertungsdaten
 * Basierend auf dem API-Endpunkt für das Bewerten von Einreichungen
 */
export interface IGradingData {
    student_id: number;
    task_id: number;
    score: number;
    max_score: number;
    feedback?: string;
    graded_by?: number;
    graded_at?: string;
    status: 'graded' | 'pending';
}

/**
 * Interface für die Aufgabeneinreichung
 */
export interface ITaskSubmissionData {
    task_id: number;
    student_id: number;
    content: string;
    attachments?: string[];
    submitted_at?: string;
    time_spent?: string; // Format: "HH:MM:SS"
}

/**
 * Interface für die Aktualisierung des Aufgabenfortschritts
 */
export interface ITaskProgressUpdateData {
    status?: 'not_started' | 'in_progress' | 'completed' | 'graded' | 'pending';
    time_spent?: string | null;
    completion_date?: string | null;
    score?: number | null;
    feedback?: string | null;
}
