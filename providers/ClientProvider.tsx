"use client";

import { ReactNode } from "react";
import { SessionProvider } from "next-auth/react";
import OnboardingRedirect from "./Onboarding";
import { ThemeProvider } from "@/components/theme-provider";

interface ClientProviderProps {
  children: ReactNode;
  session?: any; // or Session | null
}

export default function ClientProvider({ children, session }: ClientProviderProps) {
  return (
    <SessionProvider session={session}>
       <ThemeProvider 
       
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            
      {children}
          </ThemeProvider>
    </SessionProvider>
  );
}
