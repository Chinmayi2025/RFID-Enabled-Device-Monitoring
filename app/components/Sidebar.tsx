'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, 
  BarChart2, 
  Thermometer, 
  Battery, 
  AlertTriangle, 
  MessageSquare 
} from 'lucide-react';

const navItems = [
  { name: 'Home', href: '/', icon: Home },
  { name: 'Usage Analytics', href: '/analytics', icon: BarChart2 },
  { name: 'Temperature and Humidity', href: '/temperature', icon: Thermometer },
  { name: 'Power Consumption', href: '/power', icon: Battery },
  { name: 'Maintenance Alerts', href: '/alerts', icon: AlertTriangle },
  { name: 'User Feedback', href: '/feedback', icon: MessageSquare },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="fixed left-0 top-0 w-64 h-screen bg-white shadow-lg">
      <div className="p-6 border-b">
        <h4 className="text-xl font-semibold">Sensor Dashboard</h4>
      </div>
      <nav className="p-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg mb-1 transition-colors ${
                isActive 
                  ? 'bg-blue-500 text-white' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
