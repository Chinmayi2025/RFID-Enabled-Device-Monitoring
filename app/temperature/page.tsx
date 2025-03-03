'use client';

import { useState, useEffect } from 'react';
import { Thermometer, Droplets } from 'lucide-react';
import DashboardCard from '../components/DashboardCard';
import SensorChart from '../components/SensorChart';

interface SensorData {
  temperature: number;
  humidity: number;
  timestamp: string;
}

export default function Temperature() {
  const [sensorData, setSensorData] = useState<SensorData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('http://localhost:5000/view-sensor-data');
        if (!response.ok) {
          throw new Error('Failed to fetch sensor data');
        }
        const data = await response.json();
        setSensorData(data.map((row: any) => ({
          temperature: row[1],
          humidity: row[2],
          timestamp: row[3]
        })));
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

  if (sensorData.length === 0) {
    return (
      <div className="text-gray-600 p-4">
        No sensor data available
      </div>
    );
  }

  const currentTemp = sensorData[0].temperature;
  const previousTemp = sensorData[1]?.temperature ?? currentTemp;
  const tempChange = ((currentTemp - previousTemp) / previousTemp) * 100;

  const currentHumidity = sensorData[0].humidity;
  const previousHumidity = sensorData[1]?.humidity ?? currentHumidity;
  const humidityChange = ((currentHumidity - previousHumidity) / previousHumidity) * 100;

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold">Temperature & Humidity</h1>
        <p className="text-gray-500">Monitor environmental conditions from DHT11 sensor</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <DashboardCard
          title="Temperature"
          value={`${currentTemp.toFixed(1)}°C`}
          change={{ 
            value: Math.abs(tempChange), 
            type: tempChange >= 0 ? 'increase' : 'decrease' 
          }}
          icon={<Thermometer className="w-6 h-6" />}
        />
        <DashboardCard
          title="Humidity"
          value={`${currentHumidity.toFixed(1)}%`}
          change={{ 
            value: Math.abs(humidityChange), 
            type: humidityChange >= 0 ? 'increase' : 'decrease' 
          }}
          icon={<Droplets className="w-6 h-6" />}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h3 className="text-lg font-medium mb-4">Temperature History</h3>
          <div className="h-96">
            <SensorChart data={sensorData} type="temperature" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h3 className="text-lg font-medium mb-4">Humidity History</h3>
          <div className="h-96">
            <SensorChart data={sensorData} type="humidity" />
          </div>
        </div>
      </div>
    </div>
  );
}
