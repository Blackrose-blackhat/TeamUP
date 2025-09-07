import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import clientPromise from "@/lib/mongodb"
import { notFound } from "next/navigation"
import ProfileClient from "@/components/user/profile-client"

export default async function ProfilePage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  const db = (await clientPromise).db()

  const { ObjectId } = await import("mongodb")
  const userDoc = await db.collection("users").findOne({ _id: new ObjectId(params.id) })
  if (!userDoc) return notFound()

  const isMyProfile = session?.user?.id === params.id

  const user = {
    id: userDoc._id.toString(),
    email: userDoc.email,
    name: userDoc.name,
    image: userDoc.image,
    onboarded: userDoc.onboarded,
    createdAt:
      userDoc.createdAt instanceof Date
        ? userDoc.createdAt.toISOString()
        : userDoc.createdAt || null,
    github: userDoc.github || "",
    addressCoords: userDoc.addressCoords || null,
    bio: userDoc.bio || "",
    gender: userDoc.gender || "",
    instagram: userDoc.instagram || "",
    institutionAddress: userDoc.institutionAddress || "",
    institutionName: userDoc.institutionName || "",
    linkedin: userDoc.linkedin || "",
    projects: userDoc.projects || "",
    skills: userDoc.skills || "",
    username: userDoc.username || "",
    year: userDoc.year || "",
  }

  return <ProfileClient user={user} isMyProfile={isMyProfile} />
}
