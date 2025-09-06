"use client"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Github } from "lucide-react"

interface Creator {
  name: string
  email: string
  github?: string
  image?: string
}

export default function CreatorCard({ creator }: { creator: Creator }) {
  return (
    <Card className="border-0 shadow-lg bg-card/50 backdrop-blur-sm">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg">Project Creator</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-12 w-12">
            <AvatarImage src={creator.image ?? "/placeholder.svg"} />
            <AvatarFallback className="bg-primary/10 text-primary font-semibold">
              {creator.name?.charAt(0)?.toUpperCase() ?? "U"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="font-semibold truncate">{creator.name ?? "Unknown"}</p>
            <p className="text-sm text-muted-foreground truncate">{creator.email ?? "No email"}</p>
          </div>
        </div>
        {creator.github && (
          <Button variant="outline" size="sm" className="w-full gap-2 bg-transparent">
            <Github className="h-4 w-4" />
            View GitHub
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
