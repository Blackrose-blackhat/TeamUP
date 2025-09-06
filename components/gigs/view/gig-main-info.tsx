"use client"

import { useState } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Briefcase, Calendar, Code, Users, Tag, Loader2, Mail } from "lucide-react"
import GigActions from "./gig-action"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { useSession } from "next-auth/react"

interface Skill {
  _id: string
  name: string
  level?: string
  weight?: number
}

interface Role {
  _id: string
  roleName: string
  filledBy?: any
  count: number
  mustHaveSkills: string[]
}

interface Props {
  gig: any
}

export default function GigMainInfo({ gig }: Props) {
  const [applying, setApplying] = useState(false)
  const { data } = useSession();
  const isCreator = gig.createdBy?.email === data?.user?.email

  const handleApply = async () => {
    try {
      setApplying(true)
      const res = await fetch(`/api/gigs/${gig._id}`, {
        method: "POST",
      })

      if (!res.ok) {
        const error = await res.json().catch(() => ({}))
        throw new Error(error.message || "Failed to apply for gig")
      }

      toast.success("Applied successfully!")
    } catch (err: any) {
      toast.error(err.message || "Something went wrong")
    } finally {
      setApplying(false)
    }
  }

  return (
    <Card className="border-0 shadow-lg bg-card/50 backdrop-blur-sm">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <CardTitle className="text-3xl font-bold leading-tight">{gig.title}</CardTitle>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>Created {new Date(gig.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
          <Badge variant={gig.status === "Open" ? "default" : "secondary"} className="capitalize">
            {gig.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Briefcase className="h-4 w-4 text-primary" />
            Project Description
          </h3>
          <p className="text-muted-foreground leading-relaxed">
            {gig.description ?? "No description provided."}
          </p>
        </div>
        <Separator />
        <div className="space-y-4">
          {gig.skillsRequired?.length > 0 && (
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Code className="h-4 w-4 text-primary" />
                Skills Required
              </h3>
              <div className="flex flex-wrap gap-2">
                {gig.skillsRequired.map((skill: Skill) => (
                  <Badge
                    key={skill._id}
                    variant="secondary"
                    className="bg-primary/10 text-primary hover:bg-primary/20"
                  >
                    {skill.name} {skill.level && `(${skill.level})`}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          {gig.rolesRequired?.length > 0 && (
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                Roles Required
              </h3>
              <div className="flex flex-wrap gap-2">
                {gig.rolesRequired.map((role: Role) => (
                  <Badge key={role._id} variant="outline" className="border-primary/20">
                    {role.roleName} ({role.count} needed)
                  </Badge>
                ))}
              </div>
            </div>
          )}
          {gig.tags?.length > 0 && (
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Tag className="h-4 w-4 text-primary" />
                Tags
              </h3>
              <div className="flex flex-wrap gap-2">
                {gig.tags.map((tag: string, index: number) => (
                  <Badge key={`tag-${index}`} variant="outline" className="text-xs">
                    #{tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          {gig.hackathon && (
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary" />
                Hackathon Details
              </h3>
              <div className="space-y-2">
                <p className="text-sm">
                  <span className="font-medium">Event:</span> {gig.hackathon.name}
                </p>
                <p className="text-sm">
                  <span className="font-medium">Location:</span> {gig.hackathon.location}
                </p>
                <p className="text-sm">
                  <span className="font-medium">Duration:</span>{" "}
                  {new Date(gig.hackathon.startDate).toLocaleDateString()} - {" "}
                  {new Date(gig.hackathon.endDate).toLocaleDateString()}
                </p>
              </div>
            </div>
          )}
          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              Team Size
            </h3>
            <p className="text-sm text-muted-foreground">
              Looking for {gig.minTeamSize} - {gig.maxTeamSize} team members
            </p>
          </div>
        </div>
        <Separator />
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            disabled={applying || isCreator}
            onClick={handleApply}
            className="flex-1 bg-primary hover:bg-primary/90"
            title={isCreator ? "You cannot apply to your own gig" : undefined}
          >
            {applying ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Applying...
              </>
            ) : (
              <>
                <Users className="h-4 w-4 mr-2" />
                {isCreator ? "Creator cannot apply" : "Apply to Gig"}
              </>
            )}
          </Button>
          <Button variant="outline" size="lg" className="sm:w-auto bg-transparent">
            <Mail className="h-4 w-4 mr-2" />
            Contact Creator
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}