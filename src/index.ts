import { Elysia } from "elysia";
import { usersRoute } from "./routes/users-route";
import { authRoute } from "./routes/auth-route";

const port = Number(process.env.PORT) || 3000;

const app = new Elysia()
  .get("/", () => ({
    status: "ok",
    message: "Welcome to Elysia + Bun + Drizzle + MySQL API",
  }))
  .get("/health", () => ({ status: "healthy", timestamp: new Date().toISOString() }))
  .use(usersRoute)
  .use(authRoute)
  .listen(port);

console.log(`🦊 Elysia server is running at ${app.server?.hostname}:${app.server?.port}`);

export type App = typeof app;
