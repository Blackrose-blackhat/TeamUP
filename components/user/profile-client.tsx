"use client"

import { useState } from "react"
import { signOut, useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import Link from "next/link"
import { Github, Instagram, Linkedin } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogTrigger } from "@/components/ui/alert-dialog"

export default function ProfileClient({ user, isMyProfile }: { user: any; isMyProfile: boolean }) {
  const { update } = useSession()
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState(user)
  const [saving, setSaving] = useState(false)
 const [openDeleteDialog, setOpenDeleteDialog] = useState(false)
  const fields: { key: string; label: string; type?: "input" | "textarea" | "select"; disabled?: boolean }[] = [

    { key: "username", label: "Username" },
    { key: "email", label: "Email", disabled: true },
    { key: "gender", label: "Gender", type: "select" },
    { key: "institutionName", label: "Institution Name" },
    { key: "institutionAddress", label: "Institution Address" },
    { key: "year", label: "Year", type: "select" }, // ✅ updated
    { key: "skills", label: "Skills (comma separated)" },
    { key: "bio", label: "Bio", type: "textarea" },
    { key: "github", label: "Github" },
    { key: "linkedin", label: "LinkedIn" },
    { key: "instagram", label: "Instagram" },
    { key: "projects", label: "Projects", type: "textarea" },
  ]

  const handleSave = async () => {
    setSaving(true)
    try {
      await fetch("/api/user/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })

      await update()
      setEditing(false)
    } catch (err) {
      console.error("Error updating profile:", err)
    } finally {
      setSaving(false)
    }
  }
   const handleDelete = async () => {
    try {
      const res = await fetch("/api/user/delete", { method: "DELETE" })
      const data = await res.json()
      if (res.ok && data.success) {
        alert("Your account has been deleted.")
        signOut({ callbackUrl: "/" }) // log out and redirect home
      } else {
        alert("Failed to delete account: " + data.error)
      }
    } catch (err) {
      console.error(err)
      alert("Something went wrong while deleting your account.")
    }
  }

  return (
    <Card className="max-w-3xl mx-auto mt-6">
      <CardHeader>
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={user.image} />
            <AvatarFallback>{user.username?.charAt(0) || "U"}</AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-2xl">{user.username}</CardTitle>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {editing ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {fields.map((field) => (
              <div
                key={field.key}
                className={`flex flex-col gap-2 ${field.type === "textarea" ? "md:col-span-2" : ""}`}
              >
                <Label>{field.label}</Label>

                {field.type === "textarea" ? (
                  <Textarea
                    className="w-full"
                    value={form[field.key] || ""}
                    disabled={field.disabled}
                    onChange={(e) =>
                      setForm({ ...form, [field.key]: e.target.value })
                    }
                  />
                ) : field.type === "select" && field.key === "year" ? (
                  <Select
                    value={form.year || ""}
                    onValueChange={(value) => setForm({ ...form, year: value })}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder={form.year ? form.year : "Select year"} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1</SelectItem>
                      <SelectItem value="2">2</SelectItem>
                      <SelectItem value="3">3</SelectItem>
                      <SelectItem value="4">4</SelectItem>
                      <SelectItem value="passout">Passout</SelectItem>
                    </SelectContent>
                  </Select>
                ) : field.type === "select" && field.key === "gender" ? (
                  <Select
                    value={form.gender || ""}
                    onValueChange={(value) => setForm({ ...form, gender: value })}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder={form.gender ? form.gender : "Select gender"} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Female">Female</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    className="w-full"
                    value={form[field.key] || ""}
                    disabled={field.disabled}
                    onChange={(e) =>
                      setForm({ ...form, [field.key]: e.target.value })
                    }
                  />
                )}
              </div>
            ))}
          </div>


        ) : (
          <div className="space-y-6">
            <section>
              <h3 className="text-lg font-semibold mb-2">About</h3>
              <p className="text-muted-foreground">{user.bio || "No bio yet."}</p>
            </section>
            <Separator />
            <section>
              <h3 className="text-lg font-semibold mb-2">Education</h3>
              <p>{user.institutionName || "—"}</p>
              <p className="text-sm text-muted-foreground">{user.institutionAddress}</p>
              <p className="text-sm text-muted-foreground">Year: {user.year || "—"}</p>
            </section>
            <Separator />
            <section>
              <h3 className="text-lg font-semibold mb-2">Skills</h3>
              <p>{user.skills || "—"}</p>
            </section>
            <Separator />
            <section>
              <h3 className="text-lg font-semibold mb-2">Socials</h3>
              {user.github || user.linkedin || user.instagram ? (
                <div className="flex flex-wrap gap-3">
                  {user.github && (
                    <Link
                      href={user.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <Github className="h-4 w-4" />
                      <span>GitHub</span>
                    </Link>
                  )}
                  {user.linkedin && (
                    <Link
                      href={user.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <Linkedin className="h-4 w-4" />
                      <span>LinkedIn</span>
                    </Link>
                  )}
                  {user.instagram && (
                    <Link
                      href={user.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <Instagram className="h-4 w-4" />
                      <span>Instagram</span>
                    </Link>
                  )}
                </div>
              ) : (
                <p className="text-muted-foreground">—</p>
              )}
            </section>
            <Separator />
            <section>
              <h3 className="text-lg font-semibold mb-2">Projects</h3>
              <p className="whitespace-pre-wrap">{user.projects || "—"}</p>
            </section>
          </div>
        )}
      </CardContent>

      {isMyProfile && (
  <CardFooter className="flex justify-between gap-2">
      {editing ? (
        <>
          <Button variant="outline" onClick={() => setEditing(false)}>Cancel</Button>
          <Button onClick={handleSave} disabled={saving}>{saving ? "Saving..." : "Save"}</Button>
        </>
      ) : (
        <div className="flex gap-2 w-full justify-end">
          <Button className="text-white font-bold" onClick={() => setEditing(true)}>Edit Profile</Button>
{/* 
          <AlertDialog open={openDeleteDialog} onOpenChange={setOpenDeleteDialog}>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">Delete Account</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Account</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete your account? This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <div className="flex justify-end gap-2 mt-4">
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
              </div>
            </AlertDialogContent>
          </AlertDialog> */}
        </div>
      )}
    </CardFooter>
)}

    </Card>
  )
}
