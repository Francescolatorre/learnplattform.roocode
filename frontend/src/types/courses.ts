export interface ICourse {
    id: number;
    title: string;
    description: string;
    learning_objectives: string;
    prerequisites: string;
    creator: {
        display_name: string;
    };
    status: string;
    visibility: string;
    created_at: string;
    enrolled?: boolean;
}
