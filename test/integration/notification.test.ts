import { beforeEach, describe, expect, it } from "vitest";
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
            name: 'Notified User',
            email: 'notify@test.com',
            password: 'password',
            role: 'student'
        };
        const userRes = await mongo.db.collection("users").insertOne(user);
        userId = userRes.insertedId;
    });

    it('GET /notifications/:user_id should return notifications (200)', async () => {
        await mongo.db.collection("notifications").insertOne({
            userId: userId,
            message: 'Hello',
            read: false,
            timestamp: new Date()
        });

        const res = await request.get(`/notifications/${userId}`);
        console.log(res.body)
        expect(res.status).toBe(200);
        expect(res.body.length).toBe(1);
        expect(res.body[0].message).toBe('Hello');
    });

    it('PUT /notifications/:id/read should mark notification read (202)', async () => {
        const ins = await mongo.db.collection("notifications").insertOne({
            userId: new ObjectId("c00000000000000000000001"),
            message: 'To Read',
            read: false,
            timestamp: new Date()
        });

        const id = ins.insertedId;
        const res = await request.put(`/notifications/${id}/read`);
        console.log(res.body)
        expect(res.status).toBe(202);
        expect(res.body).toBeDefined();
        expect(res.body.read).toBe(true);
    });
});
