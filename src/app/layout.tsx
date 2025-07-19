
import type { Metadata } from 'next';
import './globals.css';
// AuthProvider is removed as authentication is no longer used.
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
  title: 'DragonSpend',
  description: 'Track your expenses with fiery insights!',
  manifest: '/manifest.json',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=PT+Sans:wght@400;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        {/* AuthProvider removed */}
        {children}
        <Toaster />
      </body>
    </html>
  );
}
