"use client"
import { useState } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users } from "lucide-react"
import CreatorCard from "./creator-card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import SkillsBadge from "@/components/ui/skill-badge"
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import Link from "next/link"
import ApplicantStatsDialog from "../appilicants/applicant-dialog"

interface Props {
  gig: any
}

export default function GigSidebar({ gig }: Props) {
  const { data } = useSession()
  const isCreator = gig.createdBy?.email === data?.user?.email
  const [applicants, setApplicants] = useState(gig.applicants || [])

  return (
    <div className="space-y-6">
      <CreatorCard creator={gig.createdBy} />

      {/* Project Details Card */}
      <Card className="border-0 shadow-lg bg-card/50 backdrop-blur-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">Project Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Project Type</span>
              <Badge variant="secondary">{gig.projectType}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Applicants</span>
              <span className="font-semibold">{applicants.length}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Status</span>
              <Badge variant={gig.status === "Open" ? "default" : "secondary"}>
                {gig.status}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Applicants Section */}
      {applicants.length > 0 && (
        <Card className="border-0 shadow-lg bg-card/50 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="h-5 w-5" /> Applicants ({applicants.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {isCreator ? (
              <ScrollArea className="h-64 px-6 pb-6">
                <div className="space-y-4">
                  {applicants.map((applicant: any) => (
                    <div
                      key={applicant._id}
                      className="border rounded-lg p-3 hover:bg-muted/40 transition-colors"
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <div className="h-10 w-10 rounded-full bg-primary/10 text-primary text-sm font-medium flex items-center justify-center shrink-0">
                          {applicant.username?.charAt(0)?.toUpperCase() ?? "U"}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{applicant.username || "Unknown"}</p>
                          <p className="text-xs text-muted-foreground truncate">{applicant.email || "No email"}</p>
                          {applicant.skills && <SkillsBadge skills={applicant.skills} limit={2} />}
                        </div>
                      </div>

                      {/* Stats Button and Dialog */}
                      <div className="flex gap-2">
                        <ApplicantStatsDialog gigId={gig._id}  applicantId={applicant._id} />
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            ) : (
              <div className="px-6 pb-6">
                <p className="text-sm text-muted-foreground text-center py-4">
                  Only the project creator can view applicant details.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
