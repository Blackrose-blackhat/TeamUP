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

// app/dashboard/page.tsx
// app/dashboard/page.tsx
export default function DashboardHome() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Dashboard Home</h1>
      <p>Welcome! Select a section from the sidebar.</p>
    </div>
  );
}
