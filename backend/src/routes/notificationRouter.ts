import Elysia, { sse, t } from "elysia";
import { jwtConfig } from "../config/jwtConfig";
import { authorizationMiddleware } from "../middleware/authorization";

const clients = new Set<WritableStreamDefaultWriter>();

export const notificationRouter = new Elysia()
  .use(jwtConfig)
  .derive(authorizationMiddleware)
  .get("/notifications", async function* ({ headers, jwt_auth, status }) {
    const { user } = await authorizationMiddleware({ headers, jwt_auth });
    if (!user) return status(401, "Not Authorized");

    let i = 0;
    while (i < 3) {
      yield sse({
        event: "tick",
        data: { count: ++i, time: new Date().toISOString() },
      });
      await new Promise((r) => setTimeout(r, 1_000));
    }
  });
