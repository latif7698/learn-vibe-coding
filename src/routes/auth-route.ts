import { Elysia, t } from "elysia";
import { loginUserService } from "../services/users-service";

export const authRoute = new Elysia({ prefix: "/api/login" }).post(
  "/",
  async ({ body, set }) => {
    try {
      const result = await loginUserService(body);
      set.status = 200;
      return result;
    } catch (error: any) {
      if (error.message === "Email atau password salah") {
        set.status = 401;
        return { error: "Email atau password salah" };
      }
      set.status = 500;
      return { error: error.message || "Internal Server Error" };
    }
  },
  {
    body: t.Object({
      email: t.String(),
      password: t.String(),
    }),
  }
);
