"use client"
import { Button } from "@/components/ui/button"
import { Loader2, Users, Mail } from "lucide-react"

interface Props {
  applying: boolean
  onApply: () => void
  isCreator: boolean
}

export default function GigActions({ applying, onApply, isCreator }: Props) {
  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <Button
        size="lg"
        disabled={applying || isCreator}
        onClick={onApply}
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
  )
}
