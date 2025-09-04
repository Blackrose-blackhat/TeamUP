"use client";

import { ReactNode, useState } from "react";
import { GigFiltersSidebar } from "@/components/gigs/GigFilterSidebar";
import { Button } from "@/components/ui/button";

export default function GigsLayout({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex flex-col md:flex-row gap-6">
      {/* Main content */}
      <main className="flex-1 order-2 md:order-1">
        {/* Mobile / Tablet filter toggle */}
        <div className="md:hidden flex justify-end mb-4">
          <Button onClick={() => setSidebarOpen(true)}>Filters</Button>
        </div>
        {children}
      </main>

      {/* Sidebar for desktop */}
      <aside className="hidden md:block w-64 sticky top-4 self-start order-1 md:order-2">
        <GigFiltersSidebar />
      </aside>

      {/* Sidebar drawer for mobile */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex justify-end">
          <div className="w-64 bg-white h-full p-4 shadow-lg overflow-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-lg">Filters</h3>
              <Button variant="ghost" onClick={() => setSidebarOpen(false)}>
                Close
              </Button>
            </div>
            <GigFiltersSidebar />
          </div>
        </div>
      )}
    </div>
  );
}
