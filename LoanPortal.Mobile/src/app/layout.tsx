import './globals.css';
import { Metadata } from 'next';
import { ThemeRegistry } from '@/providers/ThemeRegistry';
import { QueryProvider } from '@/providers/QueryProvider';

export const metadata: Metadata = {
  title: 'Loans N Stuff',
  description: 'Create and manage loans with ease',
  themeColor: '#ffffff',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/icons/icon-192x192.png" />
        <meta name="theme-color" content="#ffffff" />
      </head>
      <body>
        <ThemeRegistry>
          <QueryProvider>
            {children}
          </QueryProvider>
        </ThemeRegistry>
      </body>
    </html>
  );
}
