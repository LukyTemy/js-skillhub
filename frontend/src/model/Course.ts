export interface QuizQuestion {
    text: string;
    options: string[];
    correctOptionIndex: number;
}

export interface LessonContent {
    type: 'text' | 'code' | 'video' | 'quiz';
    text?: string;
    code?: string;
    language?: string;
    filename?: string;
    url?: string;
    caption?: string;
    questions?: QuizQuestion[];
    minPassPercent?: number;
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
    description: string;
    category: string;
    instructorId: string;

    createdAt?: string | Date;
    updatedAt?: string | Date;

    lessons: Lesson[];
}