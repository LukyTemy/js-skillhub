import { beforeEach, describe, expect, it, vi, afterEach } from "vitest";

// 1. MOCK AUTH MIDDLEWARE
vi.mock("../../src/middleware/auth.middleware", () => ({
    authenticate: (req: any, res: any, next: any) => {
        req.user = {
            sub: "mock-user-uuid",
            email: "notify@test.com",
            roles: ["student"]
        };
        next();
    },
    hasAnyRole: (...roles: string[]) => (req: any, res: any, next: any) => next()
}));

import request from "../request";
import mongo from "../../src/database/mongo";
import { ObjectId } from "mongodb";

describe('Notification Endpoints', () => {
    let userId: ObjectId;

    beforeEach(async () => {
        await mongo.db.collection("users").deleteMany({});
        await mongo.db.collection("notifications").deleteMany({});

        const user = {
            _id: new ObjectId("c00000000000000000000001"),
            keycloakUuid: "mock-user-uuid",
            name: 'Notified User',
            email: 'notify@test.com',
            role: 'student'
        };
        const userRes = await mongo.db.collection("users").insertOne(user);
        userId = userRes.insertedId;
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    it('GET /notifications/:user_id should return notifications (200)', async () => {
        await mongo.db.collection("notifications").insertOne({
            userId: userId,
            message: 'Hello',
            read: false,
            timestamp: new Date()
        });

        const res = await request.get(`/notifications/${userId}`);
        expect(res.status).toBe(200);
        expect(res.body.length).toBe(1);
        expect(res.body[0].message).toBe('Hello');
    });

    it('PUT /notifications/:id/read should mark notification read (202)', async () => {
        const ins = await mongo.db.collection("notifications").insertOne({
            userId: userId, // Použijeme userId z beforeEach
            message: 'To Read',
            read: false,
            timestamp: new Date()
        });

        const id = ins.insertedId;
        const res = await request.put(`/notifications/${id}/read`);
        expect(res.status).toBe(202);
        expect(res.body).toBeDefined();
        expect(res.body.read).toBe(true);
    });
});