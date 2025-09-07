"use client"
import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"

interface Props {
  gigId: string
  applicantId: string
}

export default function ApplicantStatsDialog({ gigId, applicantId }: Props) {
  const [applicant, setApplicant] = useState<any>(null)
  const [loading, setLoading] = useState(false)
    console.log("gigIs",gigId);
    console.log("applicant id ", applicantId);
  const fetchApplicantStats = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/gigs/${gigId}/evaluate-skills`)
      const data = await res.json()
      console.log(data);
      if (data.success) {
        const foundApplicant = data.data.find((a: any) => a._id === applicantId)
        setApplicant(foundApplicant)
      } else {
        console.error("Failed to fetch applicant stats")
      }
    } catch (err) {
      console.error("Error fetching applicant stats:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(()=> {
    fetchApplicantStats();
  },[])

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="flex-1 h-8 text-xs">
          Stats
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{applicant?.username || "Applicant Details"}</DialogTitle>
          <DialogDescription>
            {loading ? "Loading stats..." : "Detailed stats for this applicant."}
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <p className="text-center text-muted-foreground">Fetching data...</p>
        ) : applicant ? (
          <div className="space-y-4 mt-4">
            <p><strong>Email:</strong> {applicant.email || "N/A"}</p>

            <p><strong>Skills:</strong></p>
            {applicant.skills?.length ? (
              <div className="flex flex-wrap gap-2">
                {applicant.skills.map((skill: string) => (
                  <Badge key={skill}>{skill}</Badge>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No skills listed</p>
            )}

            {applicant.matchScore !== undefined && (
              <div>
                <p className="text-sm font-medium mb-1">Skill Match Score:</p>
                <div className="w-full h-3 bg-muted/20 rounded-full">
                  <div
                    className="h-3 bg-green-500 rounded-full transition-all"
                    style={{ width: `${applicant.matchScore}%` }}
                  />
                </div>
                <p className="text-xs mt-1">{applicant.matchScore}%</p>
              </div>
            )}
          </div>
        ) : (
          <p className="text-center text-muted-foreground">No data available.</p>
        )}
      </DialogContent>
    </Dialog>
  )
}
