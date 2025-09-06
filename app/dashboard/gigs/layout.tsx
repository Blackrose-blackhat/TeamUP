// app/dashboard/gigs/layout.tsx
"use client";

import { ReactNode } from "react";

export default function GigsLayout({ children }: { children: ReactNode }) {
  return (
    <div className="w-full">
      {children}
    </div>
  );
}