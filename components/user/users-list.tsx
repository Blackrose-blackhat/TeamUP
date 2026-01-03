"use client"

import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Avatar, AvatarFallback } from "../ui/avatar"
import { AvatarImage } from "@radix-ui/react-avatar"

type User = {
  _id: string
  name: string
  email: string
  image?: string
  bio?: string
  username: string
}

export default function UsersList({
  users,
  page,
  totalPages,
}: {
  users: User[]
  page: number
  totalPages: number
}) {
  const router = useRouter()
  console.log(users);
  return (
    <div className="p-6 space-y-6">
      {users.length === 0 ? (
        <div className="text-center text-muted-foreground py-12">
          <p className="text-lg font-medium">No users found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {users.map((user) => (
            <Card key={user._id} className="shadow-md rounded-2xl">
              <CardHeader>
                <div className="flex items-center gap-4">
                  <Avatar className="h-10 w-10 shrink-0">
                    <AvatarImage src={user.image} />
                    <AvatarFallback className="bg-primary/10 text-primary text-sm font-medium">
                      {user.username?.[0] || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle>{user.username || user.name || "User"}</CardTitle>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm line-clamp-3">{user.bio || "No bio available."}</p>
              </CardContent>
              <CardFooter>
                <Link href={`/dashboard/profile/${user._id}`}>
                  <Button size="sm">View Profile</Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {totalPages > 1 && users.length > 0 && (
        <div className="flex justify-center items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            disabled={page === 1}
            onClick={() => router.push(`/users?page=${page - 1}`)}
          >
            Prev
          </Button>
          <span className="text-sm">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page === totalPages}
            onClick={() => router.push(`/users?page=${page + 1}`)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  )
}
