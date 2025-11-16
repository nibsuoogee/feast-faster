import { Reservation } from "@types";
import { createContext, ReactNode, useContext, useState } from "react";

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
