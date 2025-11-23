import { handleApiRequest } from "@/lib/requests";
import { BACKEND_URL } from "@/lib/urls";
import { CreateOrderBody, CreateOrderResponse } from "@types";
import axios from "axios";

export const orderService = {
  createOrder: async (orderData: CreateOrderBody) => {
    return handleApiRequest<CreateOrderResponse>(() =>
      axios.post(`${BACKEND_URL}/orders`, orderData, {})
    );
  },
};
