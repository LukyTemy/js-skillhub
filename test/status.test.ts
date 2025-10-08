import {describe, it} from "vitest";
import request from "./request";

describe("status", () => {
    it("returns 200 on /", async () => {
        await request.get("/").expect(200);
    });
});
