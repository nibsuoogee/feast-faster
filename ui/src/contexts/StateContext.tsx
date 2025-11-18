import { Reservation } from "@types";
import { createContext, ReactNode, useContext, useState } from "react";

/**
 * Add the state and setState types for a new global context variable
 * to be used in the UI.
 */
type StateContextType = {
  contextReservation: Reservation | undefined;
  setContextReservation: (value: Reservation) => void;
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
  const [contextReservation, setContextReservation] = useState<
    Reservation | undefined
  >(undefined);

  return (
    <StateContext.Provider
      value={{ contextReservation, setContextReservation }}
    >
      {children}
    </StateContext.Provider>
  );
};
