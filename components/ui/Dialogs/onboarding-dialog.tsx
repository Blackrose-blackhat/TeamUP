"use client"

import { useState, useMemo, useEffect } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { Stepper } from "../stepper"
import { cn } from "@/lib/utils"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AddressAutocomplete } from "../Input/address-autocomplete"

const formSchema = z.object({
    bio: z.string().min(10, "Bio must be at least 10 characters"),
    gender: z.string().min(1, "Gender is required"),
    institutionName: z.string().min(1, "Institution name is required"),
    institutionAddress: z.string().min(1, "Institution address is required"),
    addressCoords: z
        .object({
            lat: z.number(),
            lon: z.number(),
        })
        .optional(),
    github: z.string().optional(),
    linkedin: z.string().optional(),
    instagram: z.string().optional(),
    skills: z.string().min(1, "At least one skill required"),
    projects: z.string().optional(),
    year: z.string().min(1, "Year is required"),
})

const step1Schema = z.object({
    bio: z.string().min(10, "Bio must be at least 10 characters"),
    gender: z.string().min(1, "Gender is required"),
})
const step2Schema = z.object({
    institutionName: z.string().min(1, "Institution name is required"),
    institutionAddress: z.string().min(1, "Institution address is required"),
    addressCoords: z
        .object({
            lat: z.number(),
            lon: z.number(),
        })
        .optional(),
    year: z.string().min(1, "Year is required"),
})
const step3Schema = z.object({
    skills: z.string().min(1, "At least one skill required"),
    github: z.string().optional(),
    linkedin: z.string().optional(),
    instagram: z.string().optional(),
    projects: z.string().optional(),
})

type FormValues = z.infer<typeof formSchema>

interface OnboardingDialogProps {
    open?: boolean
    onClose?: () => void
    defaultValues?: Partial<FormValues>
}

export function OnboardingDialog({ open = true, onClose, defaultValues }: OnboardingDialogProps) {
    const [step, setStep] = useState(1)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const totalSteps = 3

    const [addressQuery, setAddressQuery] = useState("")
    const [addressSuggestions, setAddressSuggestions] = useState<string[]>([])
    const [skills, setSkills] = useState<string[]>(
        defaultValues?.skills
            ? defaultValues?.skills
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean)
            : [],
    )
    const [skillInput, setSkillInput] = useState("")

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        mode: "onChange",
        defaultValues: {
            bio: "",
            gender: "",
            institutionName: "",
            institutionAddress: "",
            github: "",
            linkedin: "",
            instagram: "",
            skills: "",
            projects: "",
            year: "",
            ...defaultValues,
        },
    })

    const progressValue = useMemo(() => {
        if (totalSteps <= 1) return 100
        return ((step - 1) / (totalSteps - 1)) * 100
    }, [step])

    const getError = (fieldName: keyof FormValues) =>
        (form.formState.errors[fieldName]?.message as string | undefined) || undefined

    const validateCurrentStep = async () => {
        const currentValues = form.getValues()
        try {
            if (step === 1) {
                step1Schema.parse(currentValues)
                return true
            } else if (step === 2) {
                step2Schema.parse(currentValues)
                return true
            } else if (step === 3) {
                step3Schema.parse(currentValues)
                return true
            }
        } catch (_e) {
            if (step === 1) await form.trigger(["bio", "gender"])
            else if (step === 2) await form.trigger(["institutionName", "institutionAddress", "year"])
            else if (step === 3) await form.trigger(["skills"])
            return false
        }
        return false
    }

    const handleNext = async () => {
        const ok = await validateCurrentStep()
        if (ok) setStep((s) => Math.min(totalSteps, s + 1))
    }

    const handleBack = () => setStep((s) => Math.max(1, s - 1))

    const handleSkillAdd = () => {
        if (skillInput.trim()) {
            setSkills([...skills, skillInput.trim()])
            setSkillInput("")
        }
    }

    const handleSkillRemove = (skill: string) => {
        setSkills(skills.filter((s) => s !== skill))
    }

    async function onSubmit(values: FormValues) {
        setIsSubmitting(true)
        values.skills = skills.join(", ")
        try {
            const res = await fetch("/api/user/update", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(values),
            })
            const data = await res.json()

            // Check both success flags
            if (data.success) {
                // brief delay for nicer UX
                setTimeout(() => {
                    setIsSubmitting(false)
                    onClose?.()
                }, 600)
            } else {
                console.error("❌ Update failed:", data.error)
                setIsSubmitting(false)
            }
        } catch (err) {
            console.error("❌ Error:", err)
            setIsSubmitting(false)
        }
    }


    const steps = [
        { id: 1, name: "Profile" },
        { id: 2, name: "Education" },
        { id: 3, name: "Skills & Links" },
    ]

    useEffect(() => {
        // Reset form values when dialog is opened
        if (open) {
            form.reset(defaultValues)
            setSkills(
                defaultValues?.skills
                    ? defaultValues?.skills
                        .split(",")
                        .map((s) => s.trim())
                        .filter(Boolean)
                    : [],
            )
        }
    }, [open, defaultValues, form])

    useEffect(() => {
        if (addressQuery.length > 2) {
            const suggestions = ["123 Main St, City", "456 Maple Ave, City", "789 Oak Rd, City"].filter((addr) =>
                addr.toLowerCase().includes(addressQuery.toLowerCase()),
            )
            setAddressSuggestions(suggestions)
        } else {
            setAddressSuggestions([])
        }
    }, [addressQuery])

    return (
        <Dialog open={open} onOpenChange={(o) => (!o ? onClose?.() : undefined)}>
            <DialogContent
                className="sm:max-w-xl transition-opacity duration-300"
                style={{ opacity: isSubmitting ? 0.5 : 1 }}
            >
                <DialogHeader>
                    <DialogTitle className="text-pretty">Complete Your Profile</DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Progress Tracker */}
                    <Stepper currentStep={step} steps={steps} />
                    <Progress value={progressValue} aria-label="Step progress" />

                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                        {step === 1 && (
                            <>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Bio</label>
                                    <Textarea
                                        placeholder="Bio (minimum 10 characters)"
                                        {...form.register("bio")}
                                        className={cn(getError("bio") && "border-destructive")}
                                    />
                                    {getError("bio") && <p className="text-sm text-destructive">{getError("bio")}</p>}
                                </div>

                                <div className="space-y-2 w-full">
                                    <label className="text-sm font-medium">Gender</label>
                                    <Select
                                        onValueChange={(value) => form.setValue("gender", value)}
                                        defaultValue={form.getValues("gender") || ""}
                                    >
                                        <SelectTrigger className={cn(getError("gender") && "border-destructive w-full")}>
                                            <SelectValue placeholder="Select gender" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Male">Male</SelectItem>
                                            <SelectItem value="Female">Female</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {getError("gender") && <p className="text-sm text-destructive">{getError("gender")}</p>}
                                </div>

                                <div className="flex items-center justify-end">
                                    <Button type="button" onClick={handleNext}>
                                        Next
                                    </Button>
                                </div>
                            </>
                        )}

                        {step === 2 && (
                            <>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Institution Name</label>
                                    <Input
                                        placeholder="Institution Name"
                                        {...form.register("institutionName")}
                                        className={cn(getError("institutionName") && "border-destructive")}
                                    />
                                    {getError("institutionName") && (
                                        <p className="text-sm text-destructive">{getError("institutionName")}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Institution Address</label>
                                    <AddressAutocomplete
                                        value={form.getValues("institutionAddress")}
                                        onChange={(address, coords) => {
                                            form.setValue("institutionAddress", address);
                                            form.setValue("addressCoords", coords); // you may add this field in your schema
                                        }}
                                    />
                                    {getError("institutionAddress") && (
                                        <p className="text-sm text-destructive">{getError("institutionAddress")}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Year</label>
                                    <Input
                                        placeholder="Year"
                                        {...form.register("year")}
                                        className={cn(getError("year") && "border-destructive")}
                                    />
                                    {getError("year") && <p className="text-sm text-destructive">{getError("year")}</p>}
                                </div>

                                <div className="flex items-center justify-between">
                                    <Button type="button" variant="outline" onClick={handleBack}>
                                        Back
                                    </Button>
                                    <Button type="button" onClick={handleNext}>
                                        Next
                                    </Button>
                                </div>
                            </>
                        )}

                        {step === 3 && (
                            <>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">GitHub (optional)</label>
                                        <Input placeholder="https://github.com/you" {...form.register("github")} />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">LinkedIn (optional)</label>
                                        <Input placeholder="https://linkedin.com/in/you" {...form.register("linkedin")} />
                                    </div>
                                    <div className="space-y-2 md:col-span-2">
                                        <label className="text-sm font-medium">Instagram (optional)</label>
                                        <Input placeholder="https://instagram.com/you" {...form.register("instagram")} />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Skills</label>
                                    <div className="flex flex-wrap gap-2 items-center">
                                        {skills.map((skill, idx) => (
                                            <div key={idx} className="flex items-center bg-muted text-foreground px-3 py-1 rounded-full">
                                                {skill}
                                                <button
                                                    type="button"
                                                    className="ml-2 text-xs text-muted-foreground hover:text-destructive"
                                                    onClick={() => {
                                                        const next = skills.filter((_, i) => i !== idx)
                                                        setSkills(next)
                                                        form.setValue("skills", next.join(", "))
                                                    }}
                                                    aria-label={`Remove ${skill}`}
                                                    title={`Remove ${skill}`}
                                                >
                                                    ×
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Type a skill and press Enter"
                                        value={skillInput}
                                        onChange={(e) => setSkillInput(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter" && skillInput.trim() !== "") {
                                                e.preventDefault()
                                                const next = [...skills, skillInput.trim()]
                                                setSkills(next)
                                                form.setValue("skills", next.join(", "))
                                                setSkillInput("")
                                            }
                                        }}
                                        className="w-full border rounded-md px-3 py-2 bg-background text-foreground"
                                    />
                                    {getError("skills") && <p className="text-sm text-destructive">{getError("skills")}</p>}
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Projects (optional)</label>
                                    <Textarea placeholder="Notable projects, links, or a short summary" {...form.register("projects")} />
                                </div>

                                <div className="flex items-center justify-between">
                                    <Button type="button" variant="outline" onClick={handleBack}>
                                        Back
                                    </Button>
                                    <Button type="submit" disabled={isSubmitting}>
                                        {isSubmitting ? "Saving..." : "Finish"}
                                    </Button>
                                </div>
                            </>
                        )}
                    </form>
                </div>
            </DialogContent>
        </Dialog>
    )
}
