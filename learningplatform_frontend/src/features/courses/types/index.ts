export interface Course {
    id: number;
    title: string;
    description: string;
    instructor: string;
    created_at: string;
    updated_at: string;
    enrollment_count?: number;
    is_enrolled?: boolean;
    progress?: number;
}
