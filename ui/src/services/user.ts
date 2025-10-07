import { AUTH_URL } from "@/lib/urls";
import { handleApiRequest } from "@/lib/requests";
import axios from "axios";
import {
  AccessToken,
  UserModelForLogin,
  UserModelForRegistration,
} from "@types";

export const userService = {
  postRegister: async (body: UserModelForRegistration) => {
    return handleApiRequest<AccessToken>(() =>
      axios.post(`${AUTH_URL}/register/`, body)
    );
  },
  postLogin: async (body: UserModelForLogin) => {
    return handleApiRequest<AccessToken>(() =>
      axios.post(`${AUTH_URL}/login/`, body)
    );
  },
};
