import Course from "../database/models/course.model";
import { CourseDto } from "../types/dto/course.dto";
import mongo from "../database/mongo";
import { ObjectId } from "mongodb";

export const courseService = {
    course_collection: mongo.db.collection("courses"),

    async create(data: CourseDto) {
        const course = new Course(data.title, data.description, data.category, new ObjectId(data.instructorId), data.lessons);
        course.createdAt = new Date();
        course.updatedAt = new Date();
        await this.course_collection.insertOne(course);
        return course;
    },

    async getAll(filters: any = {}, sort: any = {}) {
        return this.course_collection.find(filters).sort(sort).toArray();
    },

    async getById(id: string) {
        return this.course_collection.findOne({ _id: new ObjectId(id) });
    },

    async update(id: string, data: Partial<CourseDto>) {
        return this.course_collection.findOneAndUpdate(
            { _id: new ObjectId(id) },
            { $set: data },
            { returnDocument: "after" }
        );
    },

    async delete(id: string) {
        return this.course_collection.deleteOne({ _id: new ObjectId(id) });
    },

    async getByInstructor(instructorId: string) {
        return this.course_collection.find({ instructorId: new ObjectId(instructorId) }).toArray();
    },

    async addLesson(courseId: string, lesson: any) {
        const updatedLesson = {
            ...lesson,
            lessonId: new ObjectId(lesson.lessonId)
        }

        return this.course_collection.findOneAndUpdate(
            { _id: new ObjectId(courseId) },
            { $push: { lessons: updatedLesson } },
            { returnDocument: "after" }
        );
    },

    async updateLesson(courseId: string, lessonId: string, lessonData: any) {
        const updatedLessonData = {
            ...lessonData,
            lessonId: new ObjectId(lessonId)
        }

        return this.course_collection.findOneAndUpdate(
            {
                _id: new ObjectId(courseId),
                "lessons.lessonId": new ObjectId(lessonId)
            },
            { $set: { "lessons.$": updatedLessonData } },
            { returnDocument: "after" }
        );
    },

    async deleteLesson(courseId: string, lessonId: string) {
        return this.course_collection.findOneAndUpdate(
            { _id: new ObjectId(courseId) },
            { $pull: { lessons: { lessonId: new ObjectId(lessonId) } } },
            { returnDocument: "after" }
        );
    },
};