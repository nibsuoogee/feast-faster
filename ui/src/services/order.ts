import axios from "axios";
import { BACKEND_URL } from "@/lib/urls";
import { handleApiRequest } from "@/lib/requests";
import { RestaurantOrder } from "@/types/driver";

export const orderService = {
  createOrder: async (orderData: RestaurantOrder) => {
    return handleApiRequest(() =>
      axios.post(`${BACKEND_URL}/orders`, orderData, {})
    );
  },
};
