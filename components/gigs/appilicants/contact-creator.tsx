"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogTrigger,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { toast } from "sonner"
import { useSession } from "next-auth/react"

interface Props {
    creator: {
        username: string
        email: string
        image?: string
    }
    gigId: string
}

export default function ContactCreatorDialog({ creator, gigId }: Props) {
    const [message, setMessage] = useState("")
    const [sending, setSending] = useState(false)
    const { data } = useSession();
    const handleSend = async () => {
        if (!message.trim()) {
            toast.error("Please write your contribution details")
            return
        }

        try {
            setSending(true)
            const res = await fetch("/api/email/contact-creator", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    gigId,
                    creatorEmail: creator.email,
                    applicantName: data?.user?.name, // from session
                    applicantEmail: data?.user?.email, // from session
                    message,
                }),
            })

            if (!res.ok) throw new Error("Failed to send email")

            toast.success("Message sent successfully!")
            setMessage("")
        } catch (err: any) {
            toast.error(err.message || "Something went wrong")
        } finally {
            setSending(false)
        }
    }

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline" size="lg" className="sm:w-auto bg-transparent">
                    Contact Creator
                </Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Contact {creator.username}</DialogTitle>
                    <DialogDescription>
                        Send a message to the creator about how you want to contribute to this project.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex items-center gap-4 my-4">
                    <Avatar>
                        {creator.image ? (
                            <AvatarImage src={creator.image} alt={creator.username} />
                        ) : (
                            <AvatarFallback>{creator.username?.charAt(0)}</AvatarFallback>
                        )}
                    </Avatar>
                    <div>
                        <p className="font-medium">{creator.username}</p>
                        <p className="text-sm text-muted-foreground">{creator.email}</p>
                    </div>
                </div>

                <Textarea
                    placeholder="Describe how you want to contribute..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full"
                    rows={5}
                />

                <DialogFooter className="mt-4">
                    <Button
                        onClick={handleSend}
                        disabled={sending}
                        className="flex-1 bg-primary hover:bg-primary/90"
                    >
                        {sending ? "Sending..." : "Send"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
