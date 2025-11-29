// FRONTEND: src/model/Course.ts

export interface LessonContent {
    type: 'text' | 'code' | 'video';
    // Volitelné vlastnosti podle typu obsahu
    text?: string;
    code?: string;
    language?: string;
    filename?: string;
    url?: string;
    caption?: string;
}

export interface Lesson {
    lessonId: string;
    title: string;
    order: number;
    content: LessonContent[];
}

export interface Course {
    _id: string;
    title: string;
    description: string; // ZDE BYL PROBLÉM: odstraněn otazník (?)
    category: string;    // ZDE BYL PROBLÉM: odstraněn otazník (?)
    instructorId: string;

    createdAt?: string | Date;
    updatedAt?: string | Date;

    lessons: Lesson[];
}