"use client"
import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"

interface Props {
  gigId: string
  applicantId: string
}

export default function ApplicantStatsDialog({ gigId, applicantId }: Props) {
  const [applicant, setApplicant] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const fetchApplicantStats = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/gigs/${gigId}/evaluate-skills`)
      const data = await res.json()
      if (data.success) {
        const foundApplicant = data.data.find((a: any) => a._id === applicantId)
        console.log(applicant)
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

  useEffect(() => {
    fetchApplicantStats()
  }, [])

  // ✅ Call accept/reject API
  const handleDecision = async (decision: "accept" | "reject") => {
    try {
      const res = await fetch(`/api/gigs/${gigId}/${decision}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ applicantId }),
      })
      const data = await res.json()
      if (data.success) {
        console.log(`✅ Candidate ${decision}ed successfully`)
      } else {
        console.error(`❌ Failed to ${decision} candidate:`, data.error)
      }
    } catch (err) {
      console.error(`Error on ${decision}:`, err)
    }
  }

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
            {Array.isArray(applicant?.skills) && applicant.skills.length > 0 ? (
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
                    style={{ width: `${applicant?.matchScore}%` }}
                  />
                </div>
                <p className="text-xs mt-1">{applicant.matchScore}%</p>
              </div>
            )}
          </div>
        ) : (
          <p className="text-center text-muted-foreground">No data available.</p>
        )}

        {/* ✅ Action buttons */}
        <DialogFooter className="mt-6 flex gap-2">
          <Button
            variant="default"
            onClick={() => handleDecision("accept")}
            disabled={loading}
          >
            Accept
          </Button>
          <Button
            variant="destructive"
            onClick={() => handleDecision("reject")}
            disabled={loading}
          >
            Reject
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
