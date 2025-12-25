import { ObjectId } from "mongodb";

export enum ContentType {
    Text = "text",
    Code = "code",
    Video = "video",
    Quiz = "quiz",
}

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

export interface QuizQuestion {
    text: string;
    options: string[];
    correctOptionIndex: number;
}

export interface QuizContent {
    type: ContentType.Quiz;
    questions: QuizQuestion[];
    minPassPercent?: number;
}

export type LessonContent = TextContent | CodeContent | VideoContent | QuizContent;

export interface Lesson {
    lessonId: ObjectId;
    title: string;
    content: LessonContent[];
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