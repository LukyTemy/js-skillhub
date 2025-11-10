import { beforeEach, describe, expect, it } from "vitest";
import request from "../request";
import mongo from "../../src/database/mongo";
import { ObjectId } from "mongodb";


describe('Users endpoints', () => {
    beforeEach(async () => {
        await mongo.db.collection("users").deleteMany({});

        await mongo.db.collection("users").insertOne({
            _id: new ObjectId("b00000000000000000000001"),
            name: 'Alice',
            email: 'alice@example.com',
            password: 'verysecure',
            role: 'student'
        });
    });

    it('GET /users should return list of users (200)', async () => {
        const res = await request.get('/users');
        console.log(res.body)
        expect(res.status).toBe(200);
        expect(res.body.length).toBe(1);
    });

    it('PUT /users/:id should update existing user (202)', async () => {
        const update = { name: 'Alice Updated', email: 'alice2@example.com', password: 'anotherpwd', role: 'student' };
        const res = await request.put(`/users/b00000000000000000000001`).send(update);
        console.log(res.body)
        expect(res.status).toBe(202);
        expect(res.body.name).toBe('Alice Updated');
    });

    it('DELETE /users/:id should remove user (204)', async () => {
        const res = await request.delete(`/users/b00000000000000000000001`);
        console.log(res.body)
        expect(res.status).toBe(204);
    });
});
