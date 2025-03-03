'use client';

import { useState, useEffect } from 'react';
import { Thermometer, Droplets, Battery, AlertTriangle } from 'lucide-react';
import DashboardCard from './components/DashboardCard';
import SensorChart from './components/SensorChart';
import PowerChart from './components/PowerChart';

interface SensorData {
  temperature: number;
  humidity: number;
  timestamp: string;
}

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

export default function Home() {
  const [sensorData, setSensorData] = useState<SensorData[]>([]);
  const [powerData, setPowerData] = useState<PowerData | null>(null);
  const [alerts, setAlerts] = useState({ count: 0, change: 0 });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch sensor data
        const sensorResponse = await fetch('http://localhost:5000/view-sensor-data');
        const sensorResult = await sensorResponse.json();
        setSensorData(sensorResult.map((row: any) => ({
          temperature: row[1],
          humidity: row[2],
          timestamp: row[3]
        })));

        // Fetch power data
        const powerResponse = await fetch('http://localhost:5000/power-analytics');
        const powerResult = await powerResponse.json();
        setPowerData(powerResult);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 1000); // Update every second

    return () => clearInterval(interval);
  }, []);

  // Calculate changes from previous readings
  const getChange = (current: number, previous: number): number => {
    if (!previous) return 0;
    return Number(((current - previous) / previous * 100).toFixed(1));
  };

  const currentTemp = sensorData[0]?.temperature ?? 24;
  const previousTemp = sensorData[1]?.temperature ?? currentTemp;
  const tempChange = getChange(currentTemp, previousTemp);

  const currentHumidity = sensorData[0]?.humidity ?? 65;
  const previousHumidity = sensorData[1]?.humidity ?? currentHumidity;
  const humidityChange = getChange(currentHumidity, previousHumidity);

  const currentPower = powerData?.current.power ?? 0;
  const previousPower = powerData?.hourly_data[0]?.power ?? currentPower;
  const powerChange = getChange(currentPower, previousPower);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold">Dashboard Overview</h1>
        <p className="text-gray-500">Welcome to your sensor monitoring dashboard</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <DashboardCard
          title="Temperature"
          value={`${currentTemp.toFixed(1)}°C`}
          change={{ value: Math.abs(tempChange), type: tempChange >= 0 ? 'increase' : 'decrease' }}
          icon={<Thermometer className="w-6 h-6" />}
        />
        <DashboardCard
          title="Humidity"
          value={`${currentHumidity.toFixed(1)}%`}
          change={{ value: Math.abs(humidityChange), type: humidityChange >= 0 ? 'increase' : 'decrease' }}
          icon={<Droplets className="w-6 h-6" />}
        />
        <DashboardCard
          title="Power Usage"
          value={`${(currentPower / 1000).toFixed(2)} kW`}
          change={{ value: Math.abs(powerChange), type: powerChange >= 0 ? 'increase' : 'decrease' }}
          icon={<Battery className="w-6 h-6" />}
        />
        <DashboardCard
          title="Active Alerts"
          value={alerts.count}
          change={{ value: Math.abs(alerts.change), type: alerts.change >= 0 ? 'increase' : 'decrease' }}
          icon={<AlertTriangle className="w-6 h-6" />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="chart-container">
          <h3 className="text-lg font-medium mb-6 text-gray-800">
            <div className="flex items-center">
              <Thermometer className="w-5 h-5 mr-2 text-primary" />
              Temperature Trend
            </div>
          </h3>
          <div className="h-[350px]">
            <SensorChart data={sensorData} type="temperature" />
          </div>
        </div>
        <div className="chart-container">
          <h3 className="text-lg font-medium mb-6 text-gray-800">
            <div className="flex items-center">
              <Battery className="w-5 h-5 mr-2 text-primary" />
              Power Consumption
            </div>
          </h3>
          <div className="h-[350px]">
            {powerData?.hourly_data && <PowerChart data={powerData.hourly_data} />}
          </div>
        </div>
      </div>
    </div>
  );
}
