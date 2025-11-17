import cors from "@elysiajs/cors";
import swagger from "@elysiajs/swagger";
import { Elysia } from "elysia";
import { settingsRouter } from "./routes/settingsRouter";
import { notificationRouter } from "./routes/notificationRouter";
import { chargerRouter } from "./routes/chargerRouter";
import { stationsRouter } from "./routes/stationsRouter";

export const userNotifications = new Map<number, any[]>();

const app = new Elysia()
  .use(swagger())
  .use(cors())
  .get("/", () => "Hello Elysia")
  .use(settingsRouter)
  .use(notificationRouter)
  .use(chargerRouter)
  .use(stationsRouter)
  .listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
