import cors from "@elysiajs/cors";
import swagger from "@elysiajs/swagger";
import { Elysia } from "elysia";
import { settingsRouter } from "./routes/settingsRouter";
import { menuItemsRouter } from "./routes/menuItemsRouter"; // new import

const app = new Elysia()
  .use(swagger())
  .use(cors())
  .get("/", () => "Hello Elysia")
  .use(settingsRouter)
  .use(menuItemsRouter) // added this line
  .listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
