import cors from "@elysiajs/cors";
import swagger from "@elysiajs/swagger";
import { Elysia } from "elysia";
import { settingsRouter } from "./routes/settingsRouter";
import { menuItemsRouter } from "./routes/menuItemsRouter"; 
import { restaurantsRouter } from "./routes/restaurantsRouter";

const app = new Elysia()
  .use(swagger())
  .use(cors())
  .get("/", () => "Hello Elysia")
  .use(settingsRouter)
  .use(menuItemsRouter) 
  .use(restaurantsRouter) 
  .listen({ port: 3000, hostname: "0.0.0.0" }); 

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
