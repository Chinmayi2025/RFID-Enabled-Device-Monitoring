'use client';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { useEffect, useRef } from 'react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface SensorData {
  temperature: number;
  humidity: number;
  timestamp: string;
}

interface SensorChartProps {
  data: SensorData[];
  type: 'temperature' | 'humidity';
}

export default function SensorChart({ data, type }: SensorChartProps) {
  const chartRef = useRef<ChartJS<"line">>();
  
  // Sort data by timestamp
  const sortedData = [...data].sort((a, b) => 
    new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  // Take only the last 10 readings
  const recentData = sortedData.slice(-10);
  
  const datasets = [{
    label: type === 'temperature' ? 'Temperature (°C)' : 'Humidity (%)',
    data: recentData.map(item => type === 'temperature' ? item.temperature : item.humidity),
    borderColor: '#4a90e2',
    backgroundColor: 'rgba(74, 144, 226, 0.5)',
    tension: 0.4,
  }];

  const labels = recentData.map(item => 
    new Date(item.timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    })
  );

  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 0 // general animation time
    },
    hover: {
      mode: 'nearest',
      intersect: true
    },
    transitions: {
      active: {
        animation: {
          duration: 0
        }
      }
    },
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: type === 'temperature' ? 'Temperature History (°C)' : 'Humidity History (%)',
      },
      tooltip: {
        mode: 'index',
        intersect: false,
      },
    },
    scales: {
      y: {
        beginAtZero: false,
        ticks: {
          callback: function(value) {
            return type === 'temperature' ? `${value}°C` : `${value}%`;
          }
        }
      },
      x: {
        display: true,
        title: {
          display: true,
          text: 'Time'
        }
      }
    },
  };

  const chartData = {
    labels,
    datasets,
  };

  useEffect(() => {
    if (chartRef.current) {
      chartRef.current.update('none');
    }
  }, [data]);

  return (
    <div className="h-full w-full">
      <Line ref={chartRef} options={options} data={chartData} />
    </div>
  );
}
