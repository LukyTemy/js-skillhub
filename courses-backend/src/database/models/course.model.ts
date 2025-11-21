import { ObjectId } from "mongodb";

export enum ContentType {
    Text = "text",
    Code = "code",
    Video = "video",
}

export interface LessonContent {
    type: ContentType;
    data: string;
}

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