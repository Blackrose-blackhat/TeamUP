"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function OnboardingRedirect({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;

    // If user exists and is new, redirect
    if (session?.user && session.user.isNewUser) {
      router.replace("/onboarding");
    }
  }, [session, status, router]);

  if (status === "loading") return <div>Loading...</div>;

  return <>{children}</>;
}
