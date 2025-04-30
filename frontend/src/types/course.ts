import {IUser} from '@/types/userTypes';

export type TCourseStatus = 'draft' | 'published' | 'archived';

export interface ICourseVersion {
    readonly id: number;
    course: number;
    version_number: number;
    created_at?: string;

    content_snapshot: Record<string, unknown>;
    notes?: string;
    created_by?: number | null;
    created_by_details?: IUser;
}

// Kurs-bezogene Typen
export interface ICourse {
    category: string;
    difficulty_level: string;
    id: string;
    title: string;
    description?: string;
    description_html?: string;
    description_markdown?: string;
    image_url?: string;
    instructor_id?: string;
    instructor_name?: string;
    created_at?: string;
    updated_at?: string;
    status: TCourseStatus;
    learning_objectives?: string;
    prerequisites?: string;
    visibility?: 'public' | 'private';
    version?: number;
    is_published?: boolean;
    is_archived?: boolean;

    // Enrollment related fields
    student_count?: number;
    isEnrolled?: boolean;
    isCompleted?: boolean;
    enrollmentDate?: string;
    progress?: number;
    completionDate?: string;
}

export interface ICourseStructure {
    modules: {
        id: string;
        title: string;
    }[];
}

export interface ICourseCreationData {
    id: number;
    title: string;
    description: string;
    version: number;
    status: TCourseStatus;
    visibility: 'public' | 'private';
    learning_objectives: string;
    prerequisites: string;
    created_at: string;
    updated_at: string;
    creator: number;
    creator_details: IUser;
}
