import axios from "axios";
import { handleApiRequest } from "@/lib/requests";
import { BACKEND_URL } from "@/lib/urls";

export type StationRequestBody = {
  current_location: [number, number];
  destination: [number, number];
  ev_model: string;
  current_car_range: number;
  current_soc: number;
  desired_soc: number;
  connector_type: string;
  cuisines: string[];
};

export const getFilteredStations = async (body: StationRequestBody) => {
  return handleApiRequest(() =>
    axios.post(`${BACKEND_URL}/filtered-stations`, body)
  );
};
