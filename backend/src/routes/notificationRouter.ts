import Elysia, { sse, t } from "elysia";
import { jwtConfig } from "../config/jwtConfig";
import { authorizationMiddleware } from "../middleware/authorization";

const userNotifications = new Map<string, any[]>();

export function sendToUser(userId: string, event: string, data: any) {
  const queue = userNotifications.get(userId);
  if (!queue) return false;

  queue.push({ event, data });
  return true;
}

export const notificationRouter = new Elysia()
  .use(jwtConfig)
  .derive(authorizationMiddleware)
  .get("/notifications", async function* ({ headers, jwt_auth, status }) {
    const { user } = await authorizationMiddleware({ headers, jwt_auth });
    if (!user) return status(401, "Not Authorized");

    const userId = String(user.user_id);

    // Initialize queue for this user
    userNotifications.set(userId, []);

    console.log(`✅ ${userId} connected (${userNotifications.size} total)`);

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
  })
  .post(
    "/notify",
    async ({ query, body, status }) => {
      const userId = query.user_id;
      const messages = userNotifications.get(userId);

      console.log("trying to reach user " + userId);

      if (!messages) return status(404, `User ${userId} not connected`);

      sendToUser(userId, "notification", {
        message: `Hello user ${userId}!`,
        time: new Date().toISOString(),
      });

      return { delivered: true };
    },
    { body: t.Object({ message: t.String() }) }
  );
