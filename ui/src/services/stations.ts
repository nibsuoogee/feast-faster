import axios from "axios";
import { handleApiRequest } from "@/lib/requests";
import { PROCESSOR_URL } from "@/lib/urls";

export type StationRequestBody = {
  current_location: [number, number];
  destination: string;
  ev_model: string;
  current_car_range: number;
  current_soc: number;
  desired_soc: number;
};

export const getStationsRestaurantsMock = async (body: StationRequestBody) => {
  return handleApiRequest(() =>
    axios.post(`${PROCESSOR_URL}/api/stations-restaurants-MOCK`, body)
  );
};
