// app/dashboard/gigs/page.tsx
import { GigCard } from "@/components/gigs/gig-card";
import { GigFiltersSidebar } from "@/components/gigs/GigFilterSidebar";

interface Props {
  searchParams: { [key: string]: string | string[] | undefined };
}

export default async function GigListPage({ searchParams }: Props) {
const page = parseInt((searchParams.page as string) || "1");
const skills = (searchParams.skills as string)?.split(",") || [];
const projectType = searchParams.projectType as string | undefined;
const status = searchParams.status as string | undefined;


  // Build API query string
  const params = new URLSearchParams();
  if (skills.length) params.set("skills", skills.join(","));
  if (projectType) params.set("projectType", projectType);
  if (status) params.set("status", status);
  params.set("page", String(page));

  // Fetch server-side from your own API
  const res = await fetch(`${process.env.NEXTAUTH_URL || "http://localhost:3000"}/api/gigs?${params.toString()}`, {
    cache: "no-store", // always fresh data
  });

  const data = await res.json();

  return (
    <div className="flex gap-6">
      {/* Filters sidebar */}
   

      {/* Main content */}
      <div className="flex-1">
        {data.gigs.length ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {data.gigs.map((gig: any) => (
                <GigCard key={gig._id} gig={gig} />
              ))}
            </div>

            {/* Pagination */}
            <div className="flex justify-center gap-2 mt-6">
              {page > 1 && (
                <a href={`?page=${page - 1}`} className="px-4 py-2 border rounded hover:bg-gray-100">
                  Prev
                </a>
              )}
              <span className="px-4 py-2 border rounded">
                Page {page} / {data.pages}
              </span>
              {page < data.pages && (
                <a href={`?page=${page + 1}`} className="px-4 py-2 border rounded hover:bg-gray-100">
                  Next
                </a>
              )}
            </div>
          </>
        ) : (
          <div className="text-center py-10 text-gray-500">No gigs found.</div>
        )}
      </div>
    </div>
  );
}
