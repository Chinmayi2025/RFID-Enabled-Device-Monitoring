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

interface PowerData {
  hour: string;
  power: number;
  energy: number;
}

interface PowerChartProps {
  data: PowerData[];
}

export default function PowerChart({ data }: PowerChartProps) {
  const chartRef = useRef<ChartJS<"line">>();
  
  // Sort data by hour
  const sortedData = [...data].sort((a, b) => 
    new Date(a.hour).getTime() - new Date(b.hour).getTime()
  );

  const datasets = [{
    label: 'Power Usage (kW)',
    data: sortedData.map(item => item.power / 1000), // Convert W to kW
    borderColor: '#4a90e2',
    backgroundColor: 'rgba(74, 144, 226, 0.5)',
    tension: 0.4,
  }];

  const labels = sortedData.map(item => 
    new Date(item.hour).toLocaleTimeString([], { 
      hour: '2-digit',
      minute: '2-digit'
    })
  );

  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 0
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
        text: 'Power Consumption History (kW)',
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
            return `${value} kW`;
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