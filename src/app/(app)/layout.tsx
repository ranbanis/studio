
'use client';

import { AppSidebar } from '@/components/layout/app-sidebar';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Authentication check is removed. App content is directly rendered.
  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <AppSidebar />
      <main className="flex-1 ml-64 p-8 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
