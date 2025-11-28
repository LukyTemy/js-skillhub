import { beforeEach, describe, expect, it, vi, afterEach } from "vitest";

// 1. MOCK AUTH MIDDLEWARE
vi.mock("../../src/middleware/auth.middleware", () => ({
    authenticate: (req: any, res: any, next: any) => {
        req.user = {
            sub: "mock-cert-uuid",
            email: "cert@test.com",
            roles: ["student"]
        };
        next();
    },
    hasAnyRole: (...roles: string[]) => (req: any, res: any, next: any) => next()
}));

import request from "../request";
import mongo from "../../src/database/mongo";
import { ObjectId } from "mongodb";

describe('Certificate Endpoints', () => {
    let userId: ObjectId;
    let courseId: ObjectId;

    beforeEach(async () => {
        await mongo.db.collection("users").deleteMany({});
        await mongo.db.collection("courses").deleteMany({});
        await mongo.db.collection("certificates").deleteMany({});

        const user = {
            _id: new ObjectId("c00000000000000000000001"),
            keycloakUuid: "mock-cert-uuid",
            name: 'Cert User',
            email: 'cert@test.com',
            role: 'student'
        };
        const userRes = await mongo.db.collection("users").insertOne(user);
        userId = userRes.insertedId;

        const course = {
            title: "Cert Course",
            description: "desc",
            category: "Testing",
            instructorId: new ObjectId("c00000000000000000000001"),
            lessons: []
        };
        const courseRes = await mongo.db.collection("courses").insertOne(course);
        courseId = courseRes.insertedId;
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    it('GET /certificates should return list of certificates (200)', async () => {
        await mongo.db.collection("certificates").insertOne({
            userId: userId,
            courseId: courseId,
            issuedAt: new Date(),
            fileUrl: 'http://example.com/cert.pdf'
        });

        const res = await request.get(`/certificates/${userId}/${courseId}`);
        expect(res.status).toBe(200);
        expect(res.body).toBeDefined();
        expect(res.body.fileUrl).toBe('http://example.com/cert.pdf');
        expect(res.body.userId).toBe(userId.toString());
        expect(res.body.courseId).toBe(courseId.toString());
    });
});