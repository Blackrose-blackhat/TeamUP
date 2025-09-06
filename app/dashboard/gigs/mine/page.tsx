import { GigListClient } from "@/components/gigs/gig-listing";
import { headers } from "next/headers";

async function fetchMyGigs() {
    const headersList = await headers();
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/gigs/mine`, {
            cache: "no-store", // always fresh
            headers: {
                'Cookie': headersList.get('cookie') || '', //always use this when using nextAUTH
            },
        });

        if (!res.ok) throw new Error("Failed to fetch your gigs");

        return await res.json();
    } catch (error) {
        console.error("❌ Error fetching your gigs:", error);
        return {
            gigs: [],
            total: 0,
            error: "Failed to load your gigs",
        };
    }
}

export default async function MyGigsPage() {
    const data = await fetchMyGigs();

    return (
        <GigListClient
            gigs={data.gigs}
            pagination={{
                currentPage: 1,
                totalPages: 1,
                total: data.total,
                limit: 10,
            }}
            searchParams={{}}
            error={data.error}
        />
    );
}
