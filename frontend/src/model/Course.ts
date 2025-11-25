// Explanation: Add a minimal Course type to be used by the frontend views
export interface Course {
    _id: string;
    title: string;
    description?: string;
    category?: string;
    instructorId?: string;
    createdAt?: string | Date;
    updatedAt?: string | Date;
    lessons?: Array<any>;
}

