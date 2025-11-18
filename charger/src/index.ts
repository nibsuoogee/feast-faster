import cors from "@elysiajs/cors";
import swagger from "@elysiajs/swagger";
import { Elysia } from "elysia";
import { sessionRouter } from "./routes/sessionRouter";

const app = new Elysia()
  .use(swagger())
  .use(cors())
  .get("/", () => "Hello fom charger!")
  .use(sessionRouter)
  .listen(3002);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
