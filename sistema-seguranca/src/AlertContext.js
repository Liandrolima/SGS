import { createContext, useContext, useState } from 'react';

// Criar o contexto
const AlertContext = createContext();

// Criar o provedor de alerta
export const AlertProvider = ({ children }) => {
  const [alerts, setAlerts] = useState([]);

  // Função para adicionar alertas
  const addAlert = (message, level) => {
    setAlerts(prevAlerts => [...prevAlerts, { message, level }]);
  };

  // Função para limpar alertas
  const clearAlerts = () => {
    setAlerts([]);
  };

  return (
    <AlertContext.Provider value={{ alerts, addAlert, clearAlerts }}>
      {children}
    </AlertContext.Provider>
  );
};

// Hook para usar o contexto
export const useAlerts = () => useContext(AlertContext);
