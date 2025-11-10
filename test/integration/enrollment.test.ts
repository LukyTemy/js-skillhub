import { beforeEach, describe, expect, it } from "vitest";
import request from "../request";
import mongo from "../../src/database/mongo";
import { ObjectId } from "mongodb";

describe('Enrollment Endpoints', () => {
    let userId: ObjectId;
    let courseId: ObjectId;
    let enrollmentId: ObjectId;

    beforeEach(async () => {
        await mongo.db.collection("users").deleteMany({});
        await mongo.db.collection("courses").deleteMany({});
        await mongo.db.collection("enrollments").deleteMany({});

        const user = {
            _id: new ObjectId("b00000000000000000000001"),
            name: 'Student One',
            email: 'student1@test.com',
            password: 'password',
            role: 'student'
        };
        const userRes = await mongo.db.collection("users").insertOne(user);
        userId = userRes.insertedId;

        const course = {
            title: "Course for Enrollment",
            description: "Course desc",
            category: "Testing",
            instructorId: new ObjectId("c00000000000000000000001"),
            lessons: []
        };
        const courseRes = await mongo.db.collection("courses").insertOne(course);
        courseId = courseRes.insertedId;
    });

    it('POST /enrollments should create an enrollment (201)', async () => {
        const payload = {
            userId: userId.toString(),
            courseId: courseId.toString(),
            status: 'active'
        };

        const res = await request.post('/enrollments').send(payload);
        console.log(res.body)
        expect(res.status).toBe(201);
        expect(res.body.userId).toBe(userId.toString());
        expect(res.body.courseId).toBe(courseId.toString());

        const enrollments = await mongo.db.collection("enrollments").find().toArray();
        expect(enrollments.length).toBe(1);

        enrollmentId = enrollments[0]._id;
    });

    it('GET /enrollments/:userId should return enrollments for user (200)', async () => {
        const insert = {
            userId: userId,
            courseId: courseId,
            status: 'active',
            enrolledAt: new Date()
        };
        await mongo.db.collection("enrollments").insertOne(insert);

        const res = await request.get(`/enrollments/${userId}`);
        console.log(res.body)
        expect(res.status).toBe(200);
        expect(res.body).toBeInstanceOf(Array);
        expect(res.body.length).toBe(1);
        expect(res.body[0].userId).toBe(userId.toString());
    });

    it('DELETE /enrollments/:id should remove enrollment (204)', async () => {
        const ins = await mongo.db.collection("enrollments").insertOne({
            userId: userId,
            courseId: courseId,
            status: 'active',
            enrolledAt: new Date()
        });

        const id = ins.insertedId;
        const res = await request.delete(`/enrollments/${id}`);
        console.log(res.body)
        expect(res.status).toBe(204);

        const found = await mongo.db.collection("enrollments").findOne({ _id: id });
        expect(found).toBeNull();
    });
});

