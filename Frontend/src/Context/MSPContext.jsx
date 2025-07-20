import React, { createContext, useContext, useState } from "react";

const MSPContext = createContext();

export const MSPProvider = ({ children }) => {
  const [currentMSP, setCurrentMSP] = useState(9537);

  return (
    <MSPContext.Provider value={{ currentMSP, setCurrentMSP }}>
      {children}
    </MSPContext.Provider>
  );
};

export const useMSP = () => useContext(MSPContext);