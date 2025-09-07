"use client"

import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Calendar, MapPin, Users, Clock, Bookmark, Eye } from "lucide-react"
import Link from "next/link"

interface Gig {
  _id: string
  title: string
  description: string
  skills: string[]
  teamSize?: number
  location?: string
  duration?: string
  createdAt?: string
  type?: string
}

interface Props {
  gig: Gig
  viewMode?: "grid" | "list"
}

export function GigCard({ gig, viewMode = "grid" }: Props) {
  const [isSaved, setIsSaved] = useState(false)

  // Check if gig already saved
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("savedGigs") || "[]") as Gig[]
    setIsSaved(saved.some((g) => g._id === gig._id))
  }, [gig._id])

  const handleSave = () => {
    const saved = JSON.parse(localStorage.getItem("savedGigs") || "[]") as Gig[]
    if (saved.some((g) => g._id === gig._id)) return // already saved

    const updated = [...saved, gig]
    localStorage.setItem("savedGigs", JSON.stringify(updated))
    setIsSaved(true)
  }

  // Helper for truncation
  const truncateText = (text: string, maxLength: number) => {
    return text.length > maxLength ? text.substring(0, maxLength) + "..." : text
  }

  // ---------------- LIST VIEW ----------------
  if (viewMode === "list") {
    return (
      <Card className="group hover:shadow-lg transition-all duration-300 border-border bg-card">
        <CardContent className="p-6">
          <div className="flex items-start justify-between gap-6">
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1 min-w-0">
                  <h3 className="text-xl font-semibold hover:text-primary transition-colors group-hover:underline decoration-primary/30">
                    {gig.title}
                  </h3>
                  {gig.type && (
                    <Badge
                      variant="secondary"
                      className="ml-3 text-xs bg-primary/10 text-primary border-primary/20"
                    >
                      {gig.type}
                    </Badge>
                  )}
                </div>
              </div>

              <p className="text-muted-foreground mb-6 text-sm leading-relaxed overflow-hidden">
                {truncateText(gig.description, 150)}
              </p>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-muted-foreground mb-6">
                {gig.teamSize && (
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-primary" />
                    <span>{gig.teamSize} members</span>
                  </div>
                )}
                {gig.location && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-primary" />
                    <span className="truncate">{gig.location}</span>
                  </div>
                )}
                {gig.duration && (
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-primary" />
                    <span>{gig.duration}</span>
                  </div>
                )}
                {gig.createdAt && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-primary" />
                    <span>Posted {new Date(gig.createdAt).toLocaleDateString()}</span>
                  </div>
                )}
              </div>

              <Separator className="mb-4" />

              <div className="flex flex-wrap gap-2 mb-4">
                {gig.skills?.slice(0, 6).map((skill, index) => (
                  <Badge
                    key={`skill-${index}-${skill}`}
                    variant="outline"
                    className="text-xs hover:bg-primary/10 hover:border-primary/30 transition-colors"
                  >
                    {skill}
                  </Badge>
                ))}
                {gig.skills?.length > 6 && (
                  <Badge variant="outline" className="text-xs bg-muted/50">
                    +{gig.skills.length - 6} more
                  </Badge>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-2 shrink-0">
              <Button
                variant="outline"
                size="sm"
                className="gap-2 hover:bg-muted/50 bg-transparent"
                onClick={handleSave}
                disabled={isSaved}
              >
                <Bookmark className="h-4 w-4" />
                {isSaved ? "Saved" : "Save"}
              </Button>
              <Button asChild className="gap-2 bg-primary hover:bg-primary/90">
                <Link href={`/dashboard/gigs/${gig._id}`}>
                  <Eye className="h-4 w-4" />
                  View Details
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // ---------------- GRID VIEW ----------------
  return (
    <Card className="group hover:shadow-lg transition-all duration-300 border-border bg-card h-full flex flex-col">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <Avatar className="h-10 w-10 shrink-0">
              <AvatarFallback className="bg-primary/10 text-primary text-sm font-medium">
                {gig.title.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold hover:text-primary transition-colors group-hover:underline decoration-primary/30 overflow-hidden">
                {truncateText(gig.title, 50)}
              </h3>
              {gig.type && (
                <Badge
                  variant="secondary"
                  className="text-xs mt-2 bg-primary/10 text-primary border-primary/20"
                >
                  {gig.type}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pb-4 flex-1">
        <p className="text-muted-foreground text-sm mb-4 leading-relaxed overflow-hidden">
          {truncateText(gig.description, 100)}
        </p>

        <div className="space-y-3 text-xs text-muted-foreground mb-4">
          {gig.teamSize && (
            <div className="flex items-center gap-2">
              <Users className="h-3 w-3 text-primary" />
              <span>{gig.teamSize} members needed</span>
            </div>
          )}
          {gig.location && (
            <div className="flex items-center gap-2">
              <MapPin className="h-3 w-3 text-primary" />
              <span className="truncate">{gig.location}</span>
            </div>
          )}
          {gig.duration && (
            <div className="flex items-center gap-2">
              <Clock className="h-3 w-3 text-primary" />
              <span>{gig.duration}</span>
            </div>
          )}
        </div>

        <Separator className="mb-4" />

        <div className="flex flex-wrap gap-1">
          {gig.skills?.slice(0, 3).map((skill) => (
            <Badge
              key={skill}
              variant="outline"
              className="text-xs hover:bg-primary/10 hover:border-primary/30 transition-colors"
            >
              {skill}
            </Badge>
          ))}
          {gig.skills?.length > 3 && (
            <Badge variant="outline" className="text-xs bg-muted/50">
              +{gig.skills.length - 3}
            </Badge>
          )}
        </div>
      </CardContent>

      <CardFooter className="pt-0 flex gap-2">
        <Button
          variant="outline"
          size="sm"
          className="flex-1 gap-2 hover:bg-muted/50 bg-transparent"
          onClick={handleSave}
          disabled={isSaved}
        >
          <Bookmark className="h-4 w-4" />
          {isSaved ? "Saved" : "Save"}
        </Button>

        <Button asChild className="gap-2 bg-primary hover:bg-primary/90">
          <Link href={`/dashboard/gigs/${gig._id}`}>
            <Eye className="h-4 w-4" />
            View Details
          </Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
