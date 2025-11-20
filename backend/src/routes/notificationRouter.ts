import Elysia, { sse, t } from "elysia";
import { jwtConfig } from "../config/jwtConfig";
import { authorizationMiddleware } from "../middleware/authorization";
import { userNotifications } from "..";
import { sendToUser } from "@utils/notification";

export const notificationRouter = new Elysia()
  .use(jwtConfig)
  .derive(authorizationMiddleware)
  .get("/notifications", async function* ({ headers, jwt_auth, status }) {
    // Authentication in route because SSE doesn't work with guards
    const { user } = await authorizationMiddleware({ headers, jwt_auth });
    if (!user) return status(401, "Not Authorized");

    const userId = user.user_id;

    // Initialize queue for this user
    userNotifications.set(userId, []);

    // Send welcome message
    yield sse({ event: "connected", data: { message: `Welcome ${userId}!` } });

    while (true) {
      await Bun.sleep(5000); // short interval to flush messages

      const queue = userNotifications.get(userId);
      if (!queue) continue;

      // Flush all pending notifications
      while (queue.length > 0) {
        const { event, data } = queue.shift();
        yield sse({ event, data });
      }

      // Optional heartbeat
      yield sse({ event: "ping", data: { time: new Date().toISOString() } });
    }
  });
