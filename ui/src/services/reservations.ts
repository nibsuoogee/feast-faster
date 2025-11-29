import { handleApiRequest } from "@/lib/requests";
import { BACKEND_URL, PROCESSOR_URL } from "@/lib/urls";
import { Reservation, EtaRequestModel, EtaResponseModel } from "@types";
import axios from "axios";
import { z } from "zod";

export const routeRequestModel = z.object({
  source: z.tuple([z.number(), z.number()]),
  station_id: z.number(),
  interval: z.number(),
});
export type RouteRequestModel = z.infer<typeof routeRequestModel>;

export const routeResponseModel = z.array(
  z.object({
    lat: z.number(),
    lon: z.number(),
    time_min: z.number(),
  })
);
export type RouteResponseModel = z.infer<typeof routeResponseModel>;

export const extendReservationResponseModel = z.object({
  message: z.string(),
  extended: z.boolean(),
  reservation: z.custom<Reservation>().optional(),
});
export type ExtendReservationResponseModel = z.infer<
  typeof extendReservationResponseModel
>;

export const reservationService = {
  canExtendReservation: async (reservationId: number) => {
    return handleApiRequest<{ extension_allowed: boolean }>(() =>
      axios.get(`${BACKEND_URL}/reservations/can-extend/${reservationId}`)
    );
  },

  extendReservation: async (reservationId: number) => {
    return handleApiRequest<ExtendReservationResponseModel>(() =>
      axios.patch(`${BACKEND_URL}/reservations/extend/${reservationId}`)
    );
  },

  finishCharging: async (chargerId: number, reservationId: number) => {
    return handleApiRequest<string>(() =>
      axios.post(`${BACKEND_URL}/finish-charging`, {
        charger_id: chargerId,
        reservation_id: reservationId,
      })
    );
  },

  getRoute: async (body: RouteRequestModel) => {
    return handleApiRequest<RouteResponseModel>(() =>
      axios.post(`${PROCESSOR_URL}/api/get-route`, body)
    );
  },

  myEta: async (body: EtaRequestModel) => {
    return handleApiRequest<EtaResponseModel>(() =>
      axios.post(`${BACKEND_URL}/my-eta`, body)
    );
  },
};
