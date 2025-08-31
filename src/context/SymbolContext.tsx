import React, { createContext, useContext, useState } from "react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const SymbolContext = createContext<any>(null);

export function SymbolProvider({ children }: { children: React.ReactNode }) {
  const [symbol, setSymbol] = useState("IBM");

  return (
    <SymbolContext.Provider value={{ symbol, setSymbol }}>
      {children}
    </SymbolContext.Provider>
  );
}

export function useSymbol() {
  return useContext(SymbolContext);
}