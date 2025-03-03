'use client';

import { useState, useEffect } from 'react';
import DataTable from '../components/DataTable';
import { AlertTriangle, CheckCircle } from 'lucide-react';

interface Alert {
  id: number;
  type: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
  status: 'active' | 'resolved';
  timestamp: string;
}

export default function Alerts() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAlerts = async () => {
    try {
      const response = await fetch('http://localhost:5000/get-alerts');
      if (!response.ok) {
        throw new Error('Failed to fetch alerts');
      }
      const data = await response.json();
      setAlerts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const handleResolveAlert = async (alertId: number) => {
    try {
      const response = await fetch(`http://localhost:5000/resolve-alert/${alertId}`, {
        method: 'POST',
      });
      
      if (!response.ok) {
        throw new Error('Failed to resolve alert');
      }
      
      // Refresh alerts after resolving
      fetchAlerts();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to resolve alert');
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'text-red-600 bg-red-50';
      case 'medium':
        return 'text-yellow-600 bg-yellow-50';
      case 'low':
        return 'text-blue-600 bg-blue-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const columns = [
    {
      header: 'Type',
      accessorKey: 'type',
      cell: (info: any) => (
        <div className="flex items-center">
          <AlertTriangle className="w-4 h-4 mr-2" />
          {info.getValue().charAt(0).toUpperCase() + info.getValue().slice(1)}
        </div>
      ),
    },
    {
      header: 'Description',
      accessorKey: 'description',
    },
    {
      header: 'Severity',
      accessorKey: 'severity',
      cell: (info: any) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(info.getValue())}`}>
          {info.getValue().toUpperCase()}
        </span>
      ),
    },
    {
      header: 'Time',
      accessorKey: 'timestamp',
      cell: (info: any) => new Date(info.getValue()).toLocaleString(),
    },
    {
      header: 'Status',
      accessorKey: 'status',
      cell: (info: any) => (
        <div className="flex items-center">
          {info.getValue() === 'active' ? (
            <button
              onClick={() => handleResolveAlert(info.row.original.id)}
              className="px-3 py-1 text-sm text-green-700 bg-green-100 rounded-full hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
            >
              <div className="flex items-center">
                <CheckCircle className="w-4 h-4 mr-1" />
                Resolve
              </div>
            </button>
          ) : (
            <span className="px-2 py-1 text-gray-600 bg-gray-100 rounded-full text-sm">
              Resolved
            </span>
          )}
        </div>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold">Maintenance Alerts</h1>
        <p className="text-gray-500">Monitor and manage system alerts</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h3 className="text-gray-500 text-sm font-medium mb-2">Active Alerts</h3>
          <p className="text-3xl font-semibold text-red-600">
            {alerts.filter(alert => alert.status === 'active').length}
          </p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h3 className="text-gray-500 text-sm font-medium mb-2">High Priority</h3>
          <p className="text-3xl font-semibold text-yellow-600">
            {alerts.filter(alert => alert.severity === 'high' && alert.status === 'active').length}
          </p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h3 className="text-gray-500 text-sm font-medium mb-2">Resolved Today</h3>
          <p className="text-3xl font-semibold text-green-600">
            {alerts.filter(alert => 
              alert.status === 'resolved' && 
              new Date(alert.timestamp).toDateString() === new Date().toDateString()
            ).length}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm">
        <div className="p-6 border-b">
          <h2 className="text-lg font-medium">Alert History</h2>
        </div>
        {error ? (
          <div className="text-red-600 p-4">{error}</div>
        ) : (
          <DataTable columns={columns} data={alerts} />
        )}
      </div>
    </div>
  );
}
