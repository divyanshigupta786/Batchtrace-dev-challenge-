'use client';

import React, { Suspense } from 'react';
import { AppSidebar } from '@/components/shared/AppSidebar';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex bg-[#F7F6F0]">
      {/* Sidebar with Suspense boundary for usePathname */}
      <Suspense fallback={<aside className="w-64 shrink-0 bg-white border-r border-[#E2E6DF] h-screen" />}>
        <AppSidebar />
      </Suspense>

      {/* Main Content Area with Suspense boundary */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto h-screen">
        <Suspense fallback={<div className="p-8 text-xs text-[#527D68]">Loading workspace...</div>}>
          {children}
        </Suspense>
      </div>
    </div>
  );
}
