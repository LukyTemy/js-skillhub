import { beforeEach, describe, expect, it, vi, afterEach } from "vitest";
// 1. DŮLEŽITÉ: Mock musí být definován PŘED importem serveru/requestu!
vi.mock("../../src/middleware/auth.middleware", () => ({
    authenticate: (req: any, res: any, next: any) => {
        // Falešný middleware: Nastaví uživatele a pustí dál
        req.user = {
            sub: "mock-keycloak-uuid",
            email: "test@example.com",
            name: "Test User",
            roles: ["student", "instructor", "admin"] // Dáme plná práva pro testy
        };
        next();
    },
    // Mock pro hasAnyRole (aby prošly i checky na role)
    hasAnyRole: (...roles: string[]) => (req: any, res: any, next: any) => next()
}));

import request from "../request"; // Importujeme request AŽ PO mocku
import mongo from "../../src/database/mongo";
import { ObjectId } from "mongodb";

describe('Users endpoints', () => {
    beforeEach(async () => {
        await mongo.db.collection("users").deleteMany({});

        await mongo.db.collection("users").insertOne({
            _id: new ObjectId("b00000000000000000000001"),
            keycloakUuid: "mock-keycloak-uuid", // Musí odpovídat mocku výše
            name: 'Alice',
            email: 'alice@example.com',
            // Heslo v DB už není, role tam je
            role: 'student'
        });
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    it('GET /users should return list of users (200)', async () => {
        const res = await request.get('/users');
        expect(res.status).toBe(200);
        expect(res.body.length).toBe(1);
    });

    it('PUT /users/:id should update existing user (202)', async () => {
        // Heslo do update neposíláme, to řeší Keycloak
        const update = { name: 'Alice Updated', email: 'alice2@example.com', role: 'student' };
        const res = await request.put(`/users/b00000000000000000000001`).send(update);
        expect(res.status).toBe(202);
        expect(res.body.name).toBe('Alice Updated');
    });

    it('DELETE /users/:id should remove user (204)', async () => {
        const res = await request.delete(`/users/b00000000000000000000001`);
        expect(res.status).toBe(204);
    });
});