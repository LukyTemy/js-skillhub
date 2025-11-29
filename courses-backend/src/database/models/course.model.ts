// BACKEND: src/database/models/course.model.ts
import { ObjectId } from "mongodb";

export enum ContentType {
    Text = "text",
    Code = "code",
    Video = "video",
}

// Definice pro jednotlivé typy obsahu (musí sedět s DTO)
export interface TextContent {
    type: ContentType.Text;
    text: string;
}

export interface CodeContent {
    type: ContentType.Code;
    code: string;
    language: string;
    filename?: string;
}

export interface VideoContent {
    type: ContentType.Video;
    url: string;
    caption?: string;
}

export type LessonContent = TextContent | CodeContent | VideoContent;

export interface Lesson {
    lessonId: ObjectId;
    title: string;
    content: LessonContent[]; // Tady používáme nový typ
    order: number;
}

export default class Course {
    constructor(
        public title: string,
        public description: string,
        public category: string,
        public instructorId: ObjectId,
        public lessons: Lesson[]
    ) {}

    _id?: ObjectId;
    createdAt?: Date;
    updatedAt?: Date;
}