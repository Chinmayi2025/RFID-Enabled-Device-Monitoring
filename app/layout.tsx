import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "./components/Sidebar";
import { NotificationProvider } from './contexts/NotificationContext';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: "Sensor Data Dashboard",
  description: "Real-time sensor data visualization dashboard",
  icons: {
    icon: [
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      }
    ],
    shortcut: ['/icon.svg'],
    apple: [
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      }
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} antialiased bg-gray-50`}
      >
        <NotificationProvider>
          <div className="flex min-h-screen">
            <Sidebar />
            <main className="flex-1 ml-64 p-8">
              {children}
            </main>
          </div>
        </NotificationProvider>
      </body>
    </html>
  );
}
