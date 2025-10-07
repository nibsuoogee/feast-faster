import Elysia, { t } from "elysia";
import { jwtConfig } from "../config/jwtConfig";
import {
  accessToken,
  UserDTO,
  userModelForLogin,
  UserModelForLogin,
} from "../models/userModel";

export const loginRouter = new Elysia().use(jwtConfig).post(
  "/login",
  async ({ body, error, jwt_auth }) => {
    try {
      // 1. Ensure the user already exists.
      const foundUser = await UserDTO.findUserByEmail(body.email);

      // 2. If not, return an error; otherwise, authenticate.
      if (!foundUser) return error(400, "User does not exist");

      // 3. Verify the password.
      const isPasswordCorrect = await UserDTO.verifyPassword(
        body.password,
        foundUser.password
      );

      // 4. If the password doesn't match, return an error.
      if (!isPasswordCorrect) error(400, "Password is incorrect");

      // 5. Tokenize the results with JWT and return the token.
      const token = await jwt_auth.sign({
        id: foundUser.id,
        //permissions: foundUser.permissions.toString(),
      });

      if (!token) return error(400, "Problems creating token");

      // 6. Return the token.
      return { access_token: token };
    } catch (err) {
      console.log(err);
      return error(500, `Server error: ${err}`);
    }
  },
  {
    body: userModelForLogin,
    response: {
      200: accessToken,
      400: t.String(),
      500: t.String(),
    },
  }
);
