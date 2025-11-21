import {beforeEach, describe, expect, it} from "vitest";
import request from "../request";
import mongo from "../../src/database/mongo";
import {UserRole} from "../../src/database/models/user.model";
import {ObjectId} from "mongodb";
import {ContentType, CourseDto, LessonDto} from "../../src/types/dto/course.dto";

describe('Course Endpoints', () => {
    let instructorId: ObjectId;
    let courseId: ObjectId;

    beforeEach(async () => {
        await mongo.db.collection("users").deleteMany({});
        await mongo.db.collection("courses").deleteMany({});

        const instructor = {
            _id: new ObjectId("a00000000000000000000001"),
            name: 'Test Instructor',
            email: 'instructor@test.com',
            password: 'password',
            role: UserRole.Instructor
        };
        const result = await mongo.db.collection("users").insertOne(instructor);
        instructorId = result.insertedId;

        const course = {
            title: "Initial Course",
            description: "A course for testing purposes.",
            category: "Testing",
            instructorId: instructorId,
            lessons: []
        };
        const courseResult = await mongo.db.collection("courses").insertOne(course);
        courseId = courseResult.insertedId;
    });

    describe('GET /courses', () => {
        it('should return all courses', async () => {
            const res = await request.get('/courses');
            console.log(res.body)
            expect(res.status).toBe(200);
            expect(res.body).toBeInstanceOf(Array);
            expect(res.body.length).toBe(1);
            expect(res.body[0].title).toBe("Initial Course");
        });
    });

    describe('GET /courses/:id', () => {
        it('should return a course by id', async () => {
            const res = await request.get(`/courses/${courseId}`);
            console.log(res.body)
            expect(res.status).toBe(200);
            expect(res.body.title).toBe("Initial Course");
        });

        it('should return 404 for non-existent course', async () => {
            const nonExistentId = new ObjectId();
            const res = await request.get(`/courses/${nonExistentId}`);
            console.log(res.body)
            expect(res.status).toBe(404);
        });
    });

    describe('POST /courses', () => {
        it('should create a new course', async () => {
            const newCourse: CourseDto = {
                title: "New Test Course",
                description: "This is a brand new course for testing.",
                category: "Development",
                instructorId: instructorId,
                lessons: []
            };

            const res = await request.post('/courses').send(newCourse);
            console.log(res.body)
            expect(res.status).toBe(201);
            expect(res.body.title).toBe(newCourse.title);
            expect(res.body.instructorId).toBe(instructorId.toString());

            const courses = await mongo.db.collection("courses").find().toArray();
            expect(courses.length).toBe(2);
        });
    });

    describe('PUT /courses/:id', () => {
        it('should update a course', async () => {
            const updatedCourse: CourseDto = {
                title: "Updated Course Title",
                description: "A course for testing purposes.",
                category: "Testing",
                instructorId: instructorId,
                lessons: []
            };

            const res = await request.put(`/courses/${courseId}`).send(updatedCourse);
            console.log(res.body)
            expect(res.status).toBe(202);
            expect(res.body.title).toBe(updatedCourse.title);
        });
    });

    describe('DELETE /courses/:id', () => {
        it('should delete a course', async () => {
            const res = await request.delete(`/courses/${courseId}`);
            console.log(res.body)
            expect(res.status).toBe(204);

            const course = await mongo.db.collection("courses").findOne({_id: courseId});
            expect(course).toBeNull();
        });
    });

    describe('Lesson Endpoints', () => {
        const newLesson: LessonDto = {
            lessonId: new ObjectId(),
            title: "First Lesson",
            content: [{
                type: ContentType.Text,
                data: "Hello World"
            }],
            order: 1
        };

        describe('POST /courses/:id/lessons', () => {
            it('should add a lesson to a course', async () => {
                const res = await request.post(`/courses/${courseId}/lessons`).send(newLesson);
                console.log(res.body)
                expect(res.status).toBe(201);
                expect(res.body.lessons).toHaveLength(1);
                expect(res.body.lessons[0].title).toBe(newLesson.title);
            });
        });

        describe('PUT /courses/:id/lessons/:lessonId', () => {
            it('should update a lesson in a course', async () => {
                await request.post(`/courses/${courseId}/lessons`).send(newLesson);

                const updatedLesson = { ...newLesson, title: "Updated Lesson Title" };
                const res = await request.put(`/courses/${courseId}/lessons/${newLesson.lessonId}`).send(updatedLesson);
                console.log(res.body)
                expect(res.status).toBe(202);
                expect(res.body.lessons[0].title).toBe("Updated Lesson Title");
            });
        });

        describe('DELETE /courses/:id/lessons/:lessonId', () => {
            it('should delete a lesson from a course', async () => {
                await request.post(`/courses/${courseId}/lessons`).send(newLesson);

                const res = await request.delete(`/courses/${courseId}/lessons/${newLesson.lessonId}`);
                console.log(res.body)
                expect(res.status).toBe(202);
                expect(res.body.lessons).toHaveLength(0);
            });
        });
    });
});

