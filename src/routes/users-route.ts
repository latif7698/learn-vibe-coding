import { Elysia, t } from "elysia";
import { registerUserService, getCurrentUserService } from "../services/users-service";

export const usersRoute = new Elysia({ prefix: "/api/users" })
  .post(
    "/",
    async ({ body, set }) => {
      try {
        const result = await registerUserService(body);
        set.status = 200;
        return result;
      } catch (error: any) {
        if (error.message === "Email sudah terdaftar") {
          set.status = 400;
          return { error: "Email sudah terdaftar" };
        }
        set.status = 500;
        return { error: error.message || "Internal Server Error" };
      }
    },
    {
      body: t.Object({
        name: t.String(),
        email: t.String(),
        password: t.String(),
      }),
    }
  )
  .post(
    "/current",
    async ({ headers, set }) => {
      const authHeader = headers["authorization"] || headers["Authorization"];
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        set.status = 401;
        return { error: "Unauthorize" };
      }

      const token = authHeader.slice(7).trim();
      if (!token) {
        set.status = 401;
        return { error: "Unauthorize" };
      }

      try {
        const result = await getCurrentUserService(token);
        set.status = 200;
        return result;
      } catch (error: any) {
        set.status = 401;
        return { error: "Unauthorize" };
      }
    }
  );

