import Course, { ContentType, QuizContent } from "../database/models/course.model";
import { CourseDto, EvaluateQuizDto, QuizResultDto } from "../types/dto/course.dto";
import mongo from "../database/mongo";
import { ObjectId } from "mongodb";

export const courseService = {
    course_collection: mongo.db.collection("courses"),

    async create(data: CourseDto) {
        const lessonsWithIds = data.lessons.map(lesson => ({
            ...lesson,
            lessonId: new ObjectId()
        }));
        const course = new Course(
            data.title,
            data.description,
            data.category,
            new ObjectId(data.instructorId),
            lessonsWithIds as any
        );

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

    sanitizeForStudent(course: any) {
        if (!course || !course.lessons) return course;

        const sanitizedLessons = course.lessons.map((lesson: any) => ({
            ...lesson,
            content: lesson.content.map((block: any) => {
                if (block.type === ContentType.Quiz && block.questions) {
                    return {
                        ...block,
                        questions: block.questions.map((q: any) => {
                            const { correctOptionIndex, ...rest } = q;
                            return rest;
                        })
                    };
                }
                return block;
            })
        }));

        return { ...course, lessons: sanitizedLessons };
    },

    async evaluateQuiz(courseId: string, lessonId: string, submission: EvaluateQuizDto): Promise<QuizResultDto> {
        const course = await this.course_collection.findOne({ _id: new ObjectId(courseId) }) as unknown as Course;
        if (!course) throw new Error("Course not found");

        const lesson = course.lessons.find((l: any) => l.lessonId.toString() === lessonId);
        if (!lesson) throw new Error("Lesson not found");

        const quizBlock = lesson.content.find((b: any) => b.type === ContentType.Quiz) as QuizContent;
        if (!quizBlock || !quizBlock.questions) throw new Error("No quiz found in this lesson");

        if (submission.answers.length !== quizBlock.questions.length) {
            throw new Error("Invalid number of answers");
        }

        let correctCount = 0;
        quizBlock.questions.forEach((question, index) => {
            if (question.correctOptionIndex === submission.answers[index]) {
                correctCount++;
            }
        });

        const totalQuestions = quizBlock.questions.length;
        const passedPercent = (correctCount / totalQuestions) * 100;
        const minPass = quizBlock.minPassPercent || 50;
        const passed = passedPercent >= minPass;

        return {
            passed,
            score: correctCount,
            totalQuestions,
            passedPercent
        };
    }
};