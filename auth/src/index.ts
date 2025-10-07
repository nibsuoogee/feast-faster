import cors from "@elysiajs/cors";
import swagger from "@elysiajs/swagger";
import { Elysia } from "elysia";
import { registerRouter } from "./routes/registerRouter";
import { loginRouter } from "./routes/loginRouter";

const app = new Elysia()
  .use(swagger())
  .use(cors())
  .get("/", () => "Hello fom auth!")
  .use(registerRouter)
  .use(loginRouter)
  .listen(3001);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
