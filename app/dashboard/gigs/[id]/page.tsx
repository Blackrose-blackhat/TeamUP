// app/dashboard/gigs/[id]/page.tsx
import { notFound } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import GigMainInfo from "@/components/gigs/view/gig-main-info"
import { Button } from "@/components/ui/button"
import GigSidebar from "@/components/gigs/view/gig-sidebar"
import Link from "next/link"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import DeleteGigButton from "@/components/gigs/view/delete-gig"

export default async function GigDetailsPage({ params }: { params: { id: string } }) {
  const { id } = params

  let gig: any = null
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/gigs/${id}`, {
      cache: "no-store", // always fresh
    })
    if (!res.ok) return notFound()
    gig = await res.json()
  console.log(gig);
  } catch (err) {
    console.error("Failed to fetch gig:", err)
    return notFound()
  }

  if (!gig) return notFound()
const session = await getServerSession(authOptions)
  const isCreator = gig.createdBy?.email === session?.user?.email


  return (
    <div className=" max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link href="/dashboard/gigs">
            <Button variant="ghost" size="sm" className="gap-2 hover:bg-muted">
              <ArrowLeft className="h-4 w-4" /> Back to gigs
            </Button>
          </Link>
          <span>/</span>
          <span className="text-foreground font-medium">Gig Details</span>
        </div>

        {isCreator && <DeleteGigButton gigId={gig._id} />}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <GigMainInfo gig={gig} />
        </div>

        <GigSidebar gig={gig} />
      </div>
    </div>
  )
}
