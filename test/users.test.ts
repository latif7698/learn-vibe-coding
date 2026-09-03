import { describe, expect, it } from "bun:test";
import { Elysia } from "elysia";
import { usersRoute } from "../src/routes/users-route";

const app = new Elysia().use(usersRoute);

describe("POST /api/users/current", () => {
  it("should return 401 Unauthorize when Authorization header is missing", async () => {
    const response = await app.handle(
      new Request("http://localhost/api/users/current", {
        method: "POST",
      })
    );

    expect(response.status).toBe(401);
    const body = await response.json();
    expect(body).toEqual({ error: "Unauthorize" });
  });

  it("should return 401 Unauthorize when token is invalid", async () => {
    const response = await app.handle(
      new Request("http://localhost/api/users/current", {
        method: "POST",
        headers: {
          Authorization: "Bearer invalid-token-123",
        },
      })
    );

    expect(response.status).toBe(401);
    const body = await response.json();
    expect(body).toEqual({ error: "Unauthorize" });
  });
});
