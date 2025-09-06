// app/dashboard/layout.tsx
"use client";

import { ReactNode, useState } from "react";
import { useSession } from "next-auth/react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/ui/app-sidebar";
import { OnboardingDialog } from "@/components/ui/Dialogs/onboarding-dialog";
import { Toaster } from "@/components/ui/sonner";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const { data: session } = useSession();
  const [open, setOpen] = useState(true);

  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="flex-1">
        <div className="p-4">
          <SidebarTrigger />
        </div>
        <div className="p-6">{children}</div>
        <Toaster />
      </main>

      {/* Onboarding dialog for new users */}
      {session?.user?.isNewUser && (
        <OnboardingDialog open={open} onClose={() => setOpen(false)} />
      )}
    </SidebarProvider>
  );
}