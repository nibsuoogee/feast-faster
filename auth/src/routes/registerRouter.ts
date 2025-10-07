import Elysia, { t } from "elysia";
import {
  accessToken,
  UserDTO,
  userModelForRegistration,
  UserModelForRegistration,
} from "../models/userModel";
import { jwtConfig } from "../config/jwtConfig";

export const registerRouter = new Elysia().use(jwtConfig).post(
  "/register",
  async ({ body, error, jwt_auth }) => {
    // 1. Ensure the user does not exist yet.
    const foundUser = await UserDTO.findUserByEmail(body.email);

    // 2. If the user already exists, return an error.
    if (foundUser) return error(400, "User already exists");

    // 3. Otherwise, create a new user.
    const newUser = await UserDTO.createUser({
      username: body.username,
      email: body.email,
      password: await Bun.password.hash(body.password),
    });

    // 4. If there's an error creating the user, handle it.
    if (!newUser) return error(400, "Problems creating user");

    // 5. Tokenize the results with JWT.
    const token = await jwt_auth.sign({
      id: newUser.id,
      //permissions: newUser.permissions?.join(",") ?? "",
    });

    if (!token) return error(400, "Problems creating token");

    // 6. Return the token.
    return { access_token: token };
  },
  {
    body: userModelForRegistration,
    response: {
      200: accessToken,
      400: t.String(),
    },
  }
);
