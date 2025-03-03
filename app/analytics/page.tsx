'use client';

import { useState, useEffect } from 'react';
import DataTable from '../components/DataTable';

interface RFIDLog {
  id: number;
  rfid_tag: string;
  username: string;
  access_time: string;
  access_granted: boolean;
}

export default function Analytics() {
  const [rfidLogs, setRfidLogs] = useState<RFIDLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('http://localhost:5000/get-rfid-logs');
        if (!response.ok) {
          throw new Error('Failed to fetch RFID logs');
        }
        const data = await response.json();
        setRfidLogs(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const columns = [
    {
      header: 'Username',
      accessorKey: 'username',
    },
    {
      header: 'RFID Tag',
      accessorKey: 'rfid_tag',
    },
    {
      header: 'Access Time',
      accessorKey: 'access_time',
      cell: (info: any) => new Date(info.getValue()).toLocaleString(),
    },
    {
      header: 'Access Status',
      accessorKey: 'access_granted',
      cell: (info: any) => (
        <span className={info.getValue() ? 'text-green-600' : 'text-red-600'}>
          {info.getValue() ? 'Granted' : 'Denied'}
        </span>
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

  if (error) {
    return (
      <div className="text-red-600 p-4">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold">User Access Analytics</h1>
        <p className="text-gray-500">Track and analyze RFID access patterns</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h3 className="text-gray-500 text-sm font-medium mb-2">Total Access Attempts</h3>
          <p className="text-3xl font-semibold">{rfidLogs.length}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h3 className="text-gray-500 text-sm font-medium mb-2">Access Granted</h3>
          <p className="text-3xl font-semibold text-green-600">
            {rfidLogs.filter(log => log.access_granted).length}
          </p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h3 className="text-gray-500 text-sm font-medium mb-2">Access Denied</h3>
          <p className="text-3xl font-semibold text-red-600">
            {rfidLogs.filter(log => !log.access_granted).length}
          </p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h3 className="text-gray-500 text-sm font-medium mb-2">Unique Users</h3>
          <p className="text-3xl font-semibold">
            {new Set(rfidLogs.map(log => log.username)).size}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm">
        <div className="p-6 border-b">
          <h2 className="text-lg font-medium">Recent Access Logs</h2>
        </div>
        <DataTable columns={columns} data={rfidLogs} />
      </div>
    </div>
  );
}
