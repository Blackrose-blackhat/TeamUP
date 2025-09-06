import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { headers } from "next/headers";
export async function fetchGigs(searchParams: { [key: string]: string | string[] | undefined }) {
  try {
    // Get session on server side
    const session = await getServerSession(authOptions);
    console.log("Page session:", JSON.stringify(session, null, 2));

    // Build query string
    const params = new URLSearchParams();
    Object.entries(searchParams).forEach(([key, value]) => {
      if (value) {
        params.set(key, Array.isArray(value) ? value.join(",") : value);
      }
    });

    // Add current user ID to the query params
    if (session?.user?.id) {
      params.set("currentUserId", session.user.id.toString());
    }

    // Get the host from headers to build absolute URL
    const headersList = await headers();
    const host = headersList.get("host");
    const protocol = process.env.NODE_ENV === "development" ? "http" : "https";
    const baseUrl = `${protocol}://${host}`;

    const response = await fetch(`${baseUrl}/api/gigs?${params.toString()}`, {
      cache: "no-store", // Ensure fresh data on each request
      // Forward cookies for session
      headers: {
        'Cookie': headersList.get('cookie') || '',
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch gigs");
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching gigs:", error);
    return {
      gigs: [],
      pagination: {
        currentPage: 1,
        totalPages: 1,
        total: 0,
        limit: 10,
      },
      error: "Failed to load gigs",
    };
  }
}