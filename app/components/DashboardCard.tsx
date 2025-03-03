interface DashboardCardProps {
  title: string;
  value: string | number;
  change: {
    value: number;
    type: 'increase' | 'decrease';
  };
  icon?: React.ReactNode;
}

export default function DashboardCard({ 
  title, 
  value, 
  change, 
  icon 
}: DashboardCardProps) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-gray-500 text-sm font-medium">{title}</h3>
        {icon && <div className="text-gray-400">{icon}</div>}
      </div>
      
      <div className="flex items-baseline justify-between">
        <h2 className="text-3xl font-semibold">{value}</h2>
        <div className={`flex items-center ${
          change.type === 'increase'
            ? 'text-green-500' 
            : 'text-red-500'
        }`}>
          <span className="text-sm font-medium">
            {change.type === 'increase' ? '↑' : '↓'} {change.value}%
          </span>
        </div>
      </div>
    </div>
  );
}
