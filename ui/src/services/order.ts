import axios from "axios";
import { BACKEND_URL } from "@/lib/urls";
import { handleApiRequest } from "@/lib/requests";

export const orderService = {
  createOrder: async (orderData: any) => {

    return handleApiRequest(() =>
      axios.post(`${BACKEND_URL}/orders`, orderData, {
      })
    );
  },
};
