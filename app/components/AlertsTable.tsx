'use client';

import { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle } from 'lucide-react';

interface Alert {
  id: number;
  temperature: number;
  timestamp: string;
  resolved: boolean;
  resolved_at: string | null;
}

export default function AlertsTable() {
  const [alerts, setAlerts] = useState<Alert[]>([]);

  const fetchAlerts = async () => {
    try {
      const response = await fetch('http://localhost:5000/alerts');
      const data = await response.json();
      setAlerts(data);
    } catch (error) {
      console.error('Error fetching alerts:', error);
    }
  };

  const resolveAlert = async (alertId: number) => {
    try {
      await fetch(`http://localhost:5000/resolve-alert/${alertId}`, {
        method: 'POST',
      });
      fetchAlerts(); // Refresh alerts after resolving
    } catch (error) {
      console.error('Error resolving alert:', error);
    }
  };

  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white rounded-lg shadow">
        <thead>
          <tr className="bg-gray-100">
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Temperature</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {alerts.map((alert) => (
            <tr key={alert.id}>
              <td className="px-6 py-4 whitespace-nowrap">
                {alert.resolved ? (
                  <CheckCircle className="text-green-500" size={20} />
                ) : (
                  <AlertTriangle className="text-red-500" size={20} />
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {alert.temperature.toFixed(1)}°C
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {new Date(alert.timestamp).toLocaleString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {!alert.resolved && (
                  <button
                    onClick={() => resolveAlert(alert.id)}
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                  >
                    Resolve
                  </button>
                )}
                {alert.resolved && (
                  <span className="text-green-500">
                    Resolved at {new Date(alert.resolved_at!).toLocaleString()}
                  </span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
