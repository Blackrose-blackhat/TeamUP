"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { useState } from "react"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"

export default function DeleteGigButton({ gigId }: { gigId: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleDelete = async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/gigs/${gigId}`, {
        method: "DELETE",
      })

      if (!res.ok) {
        const error = await res.json().catch(() => ({}))
        throw new Error(error.message || "Failed to delete gig")
      }

      toast.success("Gig deleted successfully!")
      router.push("/dashboard/gigs")
      router.refresh()
    } catch (err: any) {
      toast.error(err.message || "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button 
          variant="destructive" 
          size="sm" 
          disabled={loading}
          className="gap-2"
        >
          {loading ? "Deleting..." : "Delete Gig"}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure you want to delete this gig?</AlertDialogTitle>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleDelete} 
            disabled={loading} 
            className="bg-destructive text-white hover:bg-destructive/90"
          >
            Confirm Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
