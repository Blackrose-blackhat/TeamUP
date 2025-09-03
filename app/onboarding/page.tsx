"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { User } from "@/models/user.model"; // your interface

export default function OnboardingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [form, setForm] = useState({
    username: "",
    profilePhoto: "",
    skills: [] as string[],
    year: "",
    gender: "",
    college: "",
    bio: "",
    linkedin: "",
    github: "",
    preferredRoles: [] as string[],
    interests: [] as string[],
    location: "",
    availability: "",
  });
  const [loading, setLoading] = useState(true);

  // 🔹 Check if user is already onboarded
  useEffect(() => {
    if (!session?.user?.email) return;

    const fetchUserInfo = async () => {
      try {
        const res = await fetch(`/api/userinfo?email=${session.user.email}`);
        if (!res.ok) throw new Error("Failed to fetch user info");

        const user: User = await res.json();

        if (user.onboarded) {
          router.replace("/dashboard"); // already onboarded, redirect
        }
      } catch (err) {
        console.error("Error fetching user info:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserInfo();
  }, [session, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user?.email) return;

    const res = await fetch("/api/onboarding", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: session.user.email, ...form }),
    });

    if (res.ok) {
      router.push("/dashboard"); // redirect after successful onboarding
    }
  };

  if (loading || status === "loading") {
    return <div>Loading...</div>;
  }

  return (
    <div className="max-w-xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Welcome! Complete your profile</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          name="username"
          placeholder="Username"
          value={form.username}
          onChange={handleChange}
          required
          className="input"
        />
        <input
          type="text"
          name="profilePhoto"
          placeholder="Profile photo URL"
          value={form.profilePhoto}
          onChange={handleChange}
          className="input"
        />
        <input
          type="text"
          name="skills"
          placeholder="Skills (comma separated)"
          value={form.skills.join(", ")}
          onChange={(e) =>
            setForm({ ...form, skills: e.target.value.split(",").map((s) => s.trim()) })
          }
          required
          className="input"
        />
        <input
          type="number"
          name="year"
          placeholder="Year / Experience"
          value={form.year}
          onChange={handleChange}
          required
          className="input"
        />
        <input
          type="text"
          name="gender"
          placeholder="Gender"
          value={form.gender}
          onChange={handleChange}
          className="input"
        />
        <input
          type="text"
          name="college"
          placeholder="College / Institution"
          value={form.college}
          onChange={handleChange}
          className="input"
        />
        <textarea
          name="bio"
          placeholder="Short bio"
          value={form.bio}
          onChange={handleChange}
          className="input"
        />
        <button type="submit" className="btn-primary">Complete Profile</button>
      </form>
    </div>
  );
}
