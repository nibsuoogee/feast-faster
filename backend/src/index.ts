import cors from "@elysiajs/cors";
import swagger from "@elysiajs/swagger";
import { Elysia } from "elysia";
import { settingsRouter } from "./routes/settingsRouter";

const app = new Elysia()
  .use(swagger())
  .use(cors())
  .get("/", () => "Hello Elysia")
  .use(settingsRouter)
  .listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
