"use client";

export async function createGig(data: any) {
  const res = await fetch("/api/gigs", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  console.log(res);
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Failed to create gig");
  }

  return res.json();
}
