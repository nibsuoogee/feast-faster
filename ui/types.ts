export type {
  UserModelForRegistration,
  UserModelForLogin,
  AccessToken,
} from "../auth/dist/models/userModel";

export type { Reservation } from "../backend/dist/models/reservationModel";

export type {
  StationModel,
  StationWithMenusModel,
} from "../backend/dist/models/StationModel";

export type { StationsModel } from "../backend/dist/models/StationsModel";

export type { MenuItem } from "../backend/dist/models/MenuItemModel";

export type { Order, FoodStatus } from "../backend/dist/models/orderModel";

export type {
  CreateOrderBody,
  CreateOrderResponse,
} from "../backend/dist/models/orderRequestModel";

export type { OrderItem } from "../backend/dist/models/orderItemModel";

export type { RestaurantModel } from "../backend/dist/models/restaurantModel";

export type { RestaurantListItem } from "../backend/dist/models/restaurantList";

export type { RestaurantOrder } from "../backend/dist/models/restaurantModel";
