import { handleApiRequest } from "@/lib/requests";
import { BACKEND_URL } from "@/lib/urls";
import { StationWithMenusModel } from "@types";
import axios from "axios";

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
  return handleApiRequest<StationWithMenusModel[]>(() =>
    axios.post(`${BACKEND_URL}/filtered-stations`, body)
  );
};
