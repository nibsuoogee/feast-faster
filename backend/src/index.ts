import cors from "@elysiajs/cors";
import swagger from "@elysiajs/swagger";
import { Elysia } from "elysia";
import { settingsRouter } from "./routes/settingsRouter";
import { menuItemsRouter } from "./routes/menuItemsRouter"; 
import { notificationRouter } from "./routes/notificationRouter";
import { chargerRouter } from "./routes/chargerRouter";
import { stationsRouter } from "./routes/stationsRouter";
import { orderRouter } from "./routes/orderRouter";

export const userNotifications = new Map<number, any[]>();
import { orderRouter } from "./routes/orderRouter";

const app = new Elysia()
  .use(swagger())
  .use(cors({
    origin: /^https?:\/\/(.*\.)?localhost(:\d+)?$/, // matches all your localhost subdomains and ports
    credentials: true, // needed for Authorization header or cookies
  }))  .get("/", () => "Hello Elysia")
  .use(settingsRouter)
  .use(menuItemsRouter)
  .use(notificationRouter)
  .use(chargerRouter)
  .use(stationsRouter)
  .use(orderRouter)
  .listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
