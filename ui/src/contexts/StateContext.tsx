import { ChargingStatus } from "@/types/driver";
import { Order, OrderItem, Reservation, RestaurantModel } from "@types";
import { createContext, ReactNode, useContext, useState } from "react";

/**
 * Add the state and setState types for a new global context variable
 * to be used in the UI.
 */
type StateContextType = {
  // Reservation
  contextReservation: Reservation | undefined;
  setContextReservation: (value: Reservation | undefined) => void;
  // Order
  contextOrder: Order | undefined;
  setContextOrder: (value: Order | undefined) => void;
  // OrderItems
  contextOrderItems: OrderItem[] | undefined;
  setContextOrderItems: (value: OrderItem[] | undefined) => void;
  // Restaurant
  contextRestaurant: RestaurantModel | undefined;
  setContextRestaurant: (value: RestaurantModel | undefined) => void;
  // StationName
  contextStationName: string | undefined;
  setContextStationName: (value: string | undefined) => void;
  // ChargingState
  contextChargingState: ChargingStatus;
  setContextChargingState: (value: ChargingStatus) => void;

  resetContext: () => void;
};

const StateContext = createContext<StateContextType | undefined>(undefined);

export const useStateContext = () => {
  const context = useContext(StateContext);
  if (context) return context;

  throw new Error("useStateContext must be used within a DataProvider");
};

/**
 * Add a useState and the values in the StateContext.Provider when
 * you want to add a new global context variable.
 */
export const StateProvider = ({ children }: { children: ReactNode }) => {
  // Reservation
  const [contextReservation, setContextReservation] = useState<
    Reservation | undefined
  >(undefined);
  // Order
  const [contextOrder, setContextOrder] = useState<Order | undefined>(
    undefined
  );
  // OrderItems
  const [contextOrderItems, setContextOrderItems] = useState<
    OrderItem[] | undefined
  >(undefined);
  // Restaurant
  const [contextRestaurant, setContextRestaurant] = useState<
    RestaurantModel | undefined
  >(undefined);
  // StationName
  const [contextStationName, setContextStationName] = useState<
    string | undefined
  >(undefined);
  // Notification based charging active state
  const [contextChargingState, setContextChargingState] =
    useState<ChargingStatus>("not_started");

  async function resetContext() {
    setContextReservation(undefined);
    setContextOrder(undefined);
    setContextOrderItems(undefined);
    setContextRestaurant(undefined);
    setContextStationName(undefined);
    setContextChargingState("not_started");
  }

  return (
    <StateContext.Provider
      value={{
        // Reservation
        contextReservation,
        setContextReservation,
        // Order
        contextOrder,
        setContextOrder,
        // OrderItems
        contextOrderItems,
        setContextOrderItems,
        // Restaurant
        contextRestaurant,
        setContextRestaurant,
        // StationName
        contextStationName,
        setContextStationName,
        // ChargingState
        contextChargingState,
        setContextChargingState,

        resetContext,
      }}
    >
      {children}
    </StateContext.Provider>
  );
};
