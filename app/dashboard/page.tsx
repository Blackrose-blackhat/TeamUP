"use client";

import { useSession, signOut } from "next-auth/react";
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { OnboardingDialog } from "@/components/ui/Dialogs/onboarding-dialog";

const formSchema = z.object({
  bio: z.string().min(10, "Bio must be at least 10 characters"),
  gender: z.string().min(1, "Gender is required"),
  institutionName: z.string().min(1, "Institution name is required"),
  institutionAddress: z.string().min(1, "Institution address is required"),
  github: z.string().optional(),
  linkedin: z.string().optional(),
  instagram: z.string().optional(),
  skills: z.string().min(1, "At least one skill required"),
  projects: z.string().optional(),
  year: z.string().min(1, "Year is required"),
});

// Define validation schemas for each step
const step1Schema = z.object({
  bio: z.string().min(10, "Bio must be at least 10 characters"),
  gender: z.string().min(1, "Gender is required"),
});

const step2Schema = z.object({
  institutionName: z.string().min(1, "Institution name is required"),
  institutionAddress: z.string().min(1, "Institution address is required"),
  year: z.string().min(1, "Year is required"),
});

const step3Schema = z.object({
  skills: z.string().min(1, "At least one skill required"),
  github: z.string().optional(),
  linkedin: z.string().optional(),
  instagram: z.string().optional(),
  projects: z.string().optional(),
});

export default function DashboardPage() {
  const { data: session, status } = useSession();
const [open, setOpen] = useState(true)



  // 🔹 Pre-fill with session.user data when loaded

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  // Validate current step before proceeding


// async function onSubmit(values: any) {
//   try {
//     const res = await fetch("/api/user/update", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify(values),
//     });

//     const data = await res.json();
//     if (data.success) {
//       console.log("✅ Profile updated:", data);
//     } else {
//       console.error("❌ Update failed:", data.error);
//     }
//   } catch (error) {
//     console.error("❌ Error:", error);
//   }
// }



  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      <p>Welcome back, {session?.user?.name}</p>
      <button
        onClick={() => signOut({ callbackUrl: "/" })}
        className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
      >
        Logout
      </button>

      {/* Show Dialog only for new users */}
      {session?.user?.isNewUser && (
       <OnboardingDialog open={open} onClose={() => {}} />
      )}
    </div>
  );
}