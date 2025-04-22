import {IUser} from './user';


export type TCourseStatus = 'published' | 'draft' | 'private';

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
