import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Terminal | brijanya.com',
  description: 'Personal terminal-based website',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased selection:bg-gray-700 selection:text-white">
        {children}
      </body>
    </html>
  );
}
