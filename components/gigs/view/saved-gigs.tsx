"use client"

import { useEffect, useState } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Eye, Bookmark } from "lucide-react"
import Link from "next/link"

interface Gig {
  _id: string
  title: string
  description: string
  skills?: string[]
  location?: string
}

export default function SavedGigs() {
  const [savedGigs, setSavedGigs] = useState<Gig[]>([])

  useEffect(() => {
    const stored = localStorage.getItem("savedGigs")
    if (stored) {
      try {
        setSavedGigs(JSON.parse(stored))
      } catch {
        setSavedGigs([])
      }
    }
  }, [])

  if (savedGigs.length === 0) {
    return (
      <Card className="border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Bookmark className="h-5 w-5" />
            Saved Gigs
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-400">You haven’t saved any gigs yet. Click the <Bookmark className="inline h-4 w-4" /> button on a gig to save it here.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-slate-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Bookmark className="h-5 w-5" />
          Saved Gigs
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {savedGigs.map((gig) => (
          <div
            key={gig._id}
            className="flex items-center justify-between p-4 rounded-lg border border-slate-600 bg-slate-700/30 hover:bg-slate-700/50 transition-colors"
          >
            <div>
              <p className="font-medium text-white">{gig.title}</p>
              <p className="text-sm text-slate-400 line-clamp-1">
                {gig.description || "No description"}
              </p>
              <div className="flex flex-wrap gap-1 mt-1">
                {gig.skills?.slice(0, 3).map((s, idx) => (
                  <Badge key={idx} variant="outline" className="text-xs">{s}</Badge>
                ))}
              </div>
            </div>
            <Button asChild size="sm" className="gap-1">
              <Link href={`/dashboard/gigs/${gig._id}`}>
                <Eye className="h-4 w-4" /> View
              </Link>
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
