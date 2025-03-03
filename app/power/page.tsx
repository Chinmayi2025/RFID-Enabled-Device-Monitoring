'use client';

import { useState, useEffect } from 'react';
import { Battery, Zap, DollarSign, Gauge } from 'lucide-react';
import DashboardCard from '../components/DashboardCard';
import PowerChart from '../components/PowerChart';

interface PowerData {
  current: {
    power: number;
    energy: number;
    cost: number;
    peak: number;
  };
  hourly_data: Array<{
    hour: string;
    power: number;
    energy: number;
  }>;
}

export default function Power() {
  const [powerData, setPowerData] = useState<PowerData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('http://localhost:5000/power-analytics');
        if (!response.ok) {
          throw new Error('Failed to fetch power data');
        }
        const data = await response.json();
        setPowerData(data);
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

  if (!powerData) {
    return (
      <div className="text-gray-600 p-4">
        No power data available
      </div>
    );
  }

  const currentPower = powerData.current.power / 1000; // Convert to kW
  const previousPower = powerData.hourly_data[0]?.power / 1000 || currentPower;
  const powerChange = ((currentPower - previousPower) / previousPower) * 100;

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold">Power Analysis</h1>
        <p className="text-gray-500">Monitor power consumption from INA219 sensor</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <DashboardCard
          title="Current Power"
          value={`${currentPower.toFixed(2)} kW`}
          change={{ 
            value: Math.abs(powerChange), 
            type: powerChange >= 0 ? 'increase' : 'decrease' 
          }}
          icon={<Zap className="w-6 h-6" />}
        />
        <DashboardCard
          title="Energy Consumed"
          value={`${powerData.current.energy.toFixed(2)} kWh`}
          change={{ value: 0, type: 'increase' }}
          icon={<Battery className="w-6 h-6" />}
        />
        <DashboardCard
          title="Peak Power"
          value={`${(powerData.current.peak / 1000).toFixed(2)} kW`}
          change={{ value: 0, type: 'increase' }}
          icon={<Gauge className="w-6 h-6" />}
        />
        <DashboardCard
          title="Cost"
          value={`$${powerData.current.cost.toFixed(2)}`}
          change={{ value: 0, type: 'increase' }}
          icon={<DollarSign className="w-6 h-6" />}
        />
      </div>

      <div className="grid grid-cols-1 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h3 className="text-lg font-medium mb-4">Power Consumption History</h3>
          <div className="h-96">
            <PowerChart data={powerData.hourly_data} />
          </div>
        </div>
      </div>
    </div>
  );
}