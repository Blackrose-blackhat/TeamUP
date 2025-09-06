// app/(gigs)/create/page.tsx
import CreateGigForm from "@/components/gigs/create-gig"
import { createGig } from "@/actions/gig/create-gig.action"

export default function CreateGigPage() {
  return <CreateGigForm />
}
