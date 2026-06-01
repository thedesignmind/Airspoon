import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Airspoon - Discover Restaurants Near You',
  description: 'Find the best restaurants matching your dietary preferences',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html>
      <body>{children}</body>
    </html>
  );
}
