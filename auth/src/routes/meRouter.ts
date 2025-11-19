import Elysia, { t } from "elysia";
import { jwtConfig } from "../config/jwtConfig";
import { authorizationMiddleware } from "../middleware/authorization";
import { UserDTO, userModel } from "../models/userModel";

export const meRouter = new Elysia()
  .use(jwtConfig)
  .derive(authorizationMiddleware)
  .guard(
    {
      beforeHandle: async ({ headers, jwt_auth, status }) => {
        const { user } = await authorizationMiddleware({ headers, jwt_auth });
        if (!user) return status(401, "Not Authorized");
      },
    },
    (app) =>
      app.get(
        "/me",
        async ({ user, status }) => {
          // user is injected by the authorization middleware and contains user_id
          try {
            const found = await UserDTO.findUserById(user.user_id);
            if (!found) return status(404, "User not found");

            // Return only safe public fields
            return {
              user: {
                user_id: found.user_id,
                username: found.username,
                email: found.email,
              },
            };
          } catch (err) {
            return status(500, `Server error: ${err}`);
          }
        },
        {
          response: {
            200: t.Object({ user: t.Object({ user_id: t.Number(), username: t.String(), email: t.String() }) }),
            401: t.String(),
            404: t.String(),
            500: t.String(),
          },
        }
      )
  );
