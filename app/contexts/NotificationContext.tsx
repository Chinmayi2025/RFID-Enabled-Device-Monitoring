'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';

interface NotificationContextType {
  showAlert: boolean;
  setShowAlert: (show: boolean) => void;
  temperature: number | null;
  setTemperature: (temp: number | null) => void;
}

const NotificationContext = createContext<NotificationContextType>({
  showAlert: false,
  setShowAlert: () => {},
  temperature: null,
  setTemperature: () => {},
});

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [showAlert, setShowAlert] = useState(false);
  const [temperature, setTemperature] = useState<number | null>(null);

  useEffect(() => {
    // Request notification permission
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    if (temperature && temperature > 60) {
      setShowAlert(true);
      // Show browser notification
      if (Notification.permission === 'granted') {
        new Notification('Temperature Alert', {
          body: `Temperature has exceeded 60°C: Current temperature is ${temperature.toFixed(1)}°C`,
          icon: '/alert-icon.png'
        });
      }
    }
  }, [temperature]);

  return (
    <NotificationContext.Provider value={{ showAlert, setShowAlert, temperature, setTemperature }}>
      {showAlert && (
        <div className="fixed top-4 right-4 z-50">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg shadow-lg" role="alert">
            <div className="flex items-center">
              <AlertTriangle className="mr-2" />
              <strong className="font-bold">Alert!</strong>
              <span className="block sm:inline ml-2">
                Temperature has exceeded 60°C!
                {temperature && ` Current: ${temperature.toFixed(1)}°C`}
              </span>
              <button
                className="ml-4 text-red-700 hover:text-red-900"
                onClick={() => setShowAlert(false)}
              >
                <span className="text-2xl">&times;</span>
              </button>
            </div>
          </div>
        </div>
      )}
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  return useContext(NotificationContext);
}
