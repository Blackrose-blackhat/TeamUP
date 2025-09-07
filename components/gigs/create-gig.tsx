"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, Plus, X, ArrowLeft, ArrowRight, Check, Github, Figma, ExternalLink, AlertCircle } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { createGig } from "@/actions/gig/create-gig.action"
import ConfettiExplosion from "react-confetti-explosion"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { redirect } from "next/navigation"

interface FormData {
  // Basic Info
  title: string
  description: string
  projectType: string
  tags: string[]

  // Skills & Roles
  skillsRequired: Array<{ name: string; level: string; weight: number }>
  rolesRequired: Array<{ roleName: string; count: number; mustHaveSkills: string[] }>

  // Team & Availability
  minTeamSize: number
  maxTeamSize: number
  availability: {
    days: string[]
    hoursPerWeek: number
    timeZone: string
  }

  // Hackathon Details
  hackathon: {
    name: string
    startDate: Date | undefined
    endDate: Date | undefined
    location: string
  }

  // Links
  github: string
  figma: string
  liveDemo: string
}

interface ValidationErrors {
  [key: string]: string[]
}

const initialFormData: FormData = {
  title: "",
  description: "",
  projectType: "",
  tags: [],
  skillsRequired: [],
  rolesRequired: [],
  minTeamSize: 1,
  maxTeamSize: 5,
  availability: {
    days: [],
    hoursPerWeek: 10,
    timeZone: "",
  },
  hackathon: {
    name: "",
    startDate: undefined,
    endDate: undefined,
    location: "",
  },
  github: "",
  figma: "",
  liveDemo: "",
}

const steps = [
  { id: 1, title: "Basic Info", description: "Project details" },
  { id: 2, title: "Skills & Roles", description: "Requirements" },
  { id: 3, title: "Team Settings", description: "Size & availability" },
  { id: 4, title: "Hackathon", description: "Event details" },
  { id: 5, title: "Links", description: "Resources" },
  { id: 6, title: "Review", description: "Final check" },
]

const skillLevels = ["Beginner", "Intermediate", "Advanced"]
const projectTypes = ["Hackathon", "Side Project", "Research"]
const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

export default function CreateGigForm() {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<FormData>(initialFormData)
  const [newTag, setNewTag] = useState("")
  const [newSkill, setNewSkill] = useState({ name: "", level: "Beginner", weight: 1 })
  const [newRole, setNewRole] = useState({ roleName: "", count: 1, mustHaveSkills: [] })
  const [isExploding, setIsExploding] = useState(false)
  const [errors, setErrors] = useState<ValidationErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const updateFormData = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    // Clear errors for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  // Validation functions
  const validateStep1 = (): string[] => {
    const stepErrors: string[] = []
    
    if (!formData.title.trim()) {
      stepErrors.push("Project title is required")
    } else if (formData.title.trim().length < 3) {
      stepErrors.push("Project title must be at least 3 characters")
    } else if (formData.title.trim().length > 100) {
      stepErrors.push("Project title must be less than 100 characters")
    }

    if (!formData.description.trim()) {
      stepErrors.push("Project description is required")
    } else if (formData.description.trim().length < 20) {
      stepErrors.push("Project description must be at least 20 characters")
    } else if (formData.description.trim().length > 1000) {
      stepErrors.push("Project description must be less than 1000 characters")
    }

    if (!formData.projectType) {
      stepErrors.push("Project type is required")
    }

    return stepErrors
  }

  const validateStep2 = (): string[] => {
    const stepErrors: string[] = []

    if (formData.skillsRequired.length === 0) {
      stepErrors.push("At least one skill is required")
    }

    if (formData.rolesRequired.length === 0) {
      stepErrors.push("At least one role is required")
    }

    // Check for duplicate skills
    const skillNames = formData.skillsRequired.map(s => s.name.toLowerCase())
    const duplicateSkills = skillNames.filter((name, index) => skillNames.indexOf(name) !== index)
    if (duplicateSkills.length > 0) {
      stepErrors.push("Duplicate skills found")
    }

    // Check for duplicate roles
    const roleNames = formData.rolesRequired.map(r => r.roleName.toLowerCase())
    const duplicateRoles = roleNames.filter((name, index) => roleNames.indexOf(name) !== index)
    if (duplicateRoles.length > 0) {
      stepErrors.push("Duplicate roles found")
    }

    return stepErrors
  }

  const validateStep3 = (): string[] => {
    const stepErrors: string[] = []

    if (formData.minTeamSize < 1) {
      stepErrors.push("Minimum team size must be at least 1")
    }

    if (formData.maxTeamSize < formData.minTeamSize) {
      stepErrors.push("Maximum team size must be greater than or equal to minimum team size")
    }

    if (formData.maxTeamSize > 20) {
      stepErrors.push("Maximum team size cannot exceed 20")
    }




    return stepErrors
  }

  const validateStep4 = (): string[] => {
    const stepErrors: string[] = []

    // Hackathon details are optional, but if provided, validate them
    if (formData.hackathon.startDate && formData.hackathon.endDate) {
      if (formData.hackathon.startDate >= formData.hackathon.endDate) {
        stepErrors.push("End date must be after start date")
      }
    }

    if (formData.hackathon.startDate && formData.hackathon.startDate < new Date()) {
      stepErrors.push("Start date cannot be in the past")
    }

    return stepErrors
  }

  const validateStep5 = (): string[] => {
    const stepErrors: string[] = []

    // URL validation helper
    const isValidUrl = (url: string): boolean => {
      if (!url) return true // Empty URLs are allowed
      try {
        new URL(url)
        return true
      } catch {
        return false
      }
    }

    if (formData.github && !isValidUrl(formData.github)) {
      stepErrors.push("GitHub URL is not valid")
    }

    if (formData.figma && !isValidUrl(formData.figma)) {
      stepErrors.push("Figma URL is not valid")
    }

    if (formData.liveDemo && !isValidUrl(formData.liveDemo)) {
      stepErrors.push("Live demo URL is not valid")
    }

    // Check for GitHub URL format
    if (formData.github && !formData.github.includes('github.com')) {
      stepErrors.push("GitHub URL should contain 'github.com'")
    }

    // Check for Figma URL format
    if (formData.figma && !formData.figma.includes('figma.com')) {
      stepErrors.push("Figma URL should contain 'figma.com'")
    }

    return stepErrors
  }

  const validateCurrentStep = (): boolean => {
    let stepErrors: string[] = []

    switch (currentStep) {
      case 1:
        stepErrors = validateStep1()
        break
      case 2:
        stepErrors = validateStep2()
        break
      case 3:
        stepErrors = validateStep3()
        break
      case 4:
        stepErrors = validateStep4()
        break
      case 5:
        stepErrors = validateStep5()
        break
      case 6:
        // Final validation - combine all steps
        stepErrors = [
          ...validateStep1(),
          ...validateStep2(),
          ...validateStep3(),
          ...validateStep4(),
          ...validateStep5()
        ]
        break
    }

    if (stepErrors.length > 0) {
      setErrors({ [currentStep]: stepErrors })
      return false
    }

    return true
  }

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      if (formData.tags.length >= 10) {
        setErrors({ tags: ["Maximum 10 tags allowed"] })
        return
      }
      if (newTag.trim().length > 20) {
        setErrors({ tags: ["Tag must be less than 20 characters"] })
        return
      }
      updateFormData("tags", [...formData.tags, newTag.trim()])
      setNewTag("")
      // Clear tag errors
      if (errors.tags) {
        setErrors(prev => {
          const newErrors = { ...prev }
          delete newErrors.tags
          return newErrors
        })
      }
    }
  }

  const removeTag = (tagToRemove: string) => {
    updateFormData(
      "tags",
      formData.tags.filter((tag) => tag !== tagToRemove),
    )
  }

  const addSkill = () => {
    if (newSkill.name.trim()) {
      if (formData.skillsRequired.some(skill => skill.name.toLowerCase() === newSkill.name.toLowerCase())) {
        setErrors({ skills: ["Skill already exists"] })
        return
      }
      if (formData.skillsRequired.length >= 15) {
        setErrors({ skills: ["Maximum 15 skills allowed"] })
        return
      }
      updateFormData("skillsRequired", [...formData.skillsRequired, { ...newSkill }])
      setNewSkill({ name: "", level: "Beginner", weight: 1 })
      // Clear skill errors
      if (errors.skills) {
        setErrors(prev => {
          const newErrors = { ...prev }
          delete newErrors.skills
          return newErrors
        })
      }
    }
  }

  const removeSkill = (index: number) => {
    updateFormData(
      "skillsRequired",
      formData.skillsRequired.filter((_, i) => i !== index),
    )
  }

  const addRole = () => {
    if (newRole.roleName.trim()) {
      if (formData.rolesRequired.some(role => role.roleName.toLowerCase() === newRole.roleName.toLowerCase())) {
        setErrors({ roles: ["Role already exists"] })
        return
      }
      if (formData.rolesRequired.length >= 10) {
        setErrors({ roles: ["Maximum 10 roles allowed"] })
        return
      }
      updateFormData("rolesRequired", [...formData.rolesRequired, { ...newRole }])
      setNewRole({ roleName: "", count: 1, mustHaveSkills: [] })
      // Clear role errors
      if (errors.roles) {
        setErrors(prev => {
          const newErrors = { ...prev }
          delete newErrors.roles
          return newErrors
        })
      }
    }
  }

  const removeRole = (index: number) => {
    updateFormData(
      "rolesRequired",
      formData.rolesRequired.filter((_, i) => i !== index),
    )
  }

  const toggleAvailabilityDay = (day: string) => {
    const days = formData.availability.days.includes(day)
      ? formData.availability.days.filter((d) => d !== day)
      : [...formData.availability.days, day]

    updateFormData("availability", { ...formData.availability, days })
  }

  const nextStep = () => {
    if (validateCurrentStep()) {
      if (currentStep < steps.length) {
        setCurrentStep(currentStep + 1)
        setErrors({}) // Clear errors when moving to next step
      }
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
      setErrors({}) // Clear errors when moving to previous step
    }
  }

  const handleSubmit = async () => {
    if (!validateCurrentStep()) {
      return
    }

    setIsSubmitting(true)
    try {
      const result = await createGig(formData);
      
      // 🎉 Trigger confetti
      setIsExploding(true);
      setTimeout(() => setIsExploding(false), 4000);
      console.log("✅ Gig created:", result);

      // TODO: redirect or show toast
    } catch (err) {
      console.error(err);

    } finally {
      setIsSubmitting(false)
    }
  };

  const renderProgressBar = () => (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center">
            <div
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors",
                currentStep >= step.id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
              )}
            >
              {currentStep > step.id ? <Check className="w-4 h-4" /> : step.id}
            </div>
            {index < steps.length - 1 && (
              <div
                className={cn("w-12 h-0.5 mx-2 transition-colors", currentStep > step.id ? "bg-primary" : "bg-muted")}
              />
            )}
          </div>
        ))}
      </div>
      <div className="text-center">
        <h2 className="text-xl font-semibold text-foreground">{steps[currentStep - 1].title}</h2>
        <p className="text-sm text-muted-foreground">{steps[currentStep - 1].description}</p>
      </div>
    </div>
  )

  const renderErrors = () => {
    const currentStepErrors = errors[currentStep] || errors.submit || errors.tags || errors.skills || errors.roles
    if (!currentStepErrors || currentStepErrors.length === 0) return null

    return (
      <Alert variant="destructive" className="mb-6">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <ul className="list-disc list-inside space-y-1">
            {currentStepErrors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </AlertDescription>
      </Alert>
    )
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            {renderErrors()}
            
            <div className="space-y-2">
              <Label htmlFor="title">Project Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => updateFormData("title", e.target.value)}
                placeholder="Enter your project title"
                className={cn("text-base", errors[currentStep]?.some(e => e.includes("title")) && "border-destructive")}
              />
              <p className="text-xs text-muted-foreground">{formData.title.length}/100 characters</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => updateFormData("description", e.target.value)}
                placeholder="Describe your project in detail..."
                rows={4}
                className={cn("text-base resize-none", errors[currentStep]?.some(e => e.includes("description")) && "border-destructive")}
              />
              <p className="text-xs text-muted-foreground">{formData.description.length}/1000 characters</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="projectType">Project Type *</Label>
              <Select value={formData.projectType} onValueChange={(value) => updateFormData("projectType", value)}>
                <SelectTrigger className={cn(errors[currentStep]?.some(e => e.includes("type")) && "border-destructive")}>
                  <SelectValue placeholder="Select project type" />
                </SelectTrigger>
                <SelectContent>
                  {projectTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Tags (Optional)</Label>
              <div className="flex gap-2 mb-2">
                <Input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="Add a tag"
                  onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                  className={cn(errors.tags && "border-destructive")}
                />
                <Button type="button" onClick={addTag} size="sm">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                    {tag}
                    <X className="w-3 h-3 cursor-pointer" onClick={() => removeTag(tag)} />
                  </Badge>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">{formData.tags.length}/10 tags</p>
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            {renderErrors()}
            
            <div className="space-y-4">
              <Label className="text-base font-medium">Skills Required *</Label>
              <Card>
                <CardContent className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
                    <Input
                      placeholder="Skill name"
                      value={newSkill.name}
                      onChange={(e) => setNewSkill((prev) => ({ ...prev, name: e.target.value }))}
                      className={cn(errors.skills && "border-destructive")}
                    />
                    <Select
                      value={newSkill.level}
                      onValueChange={(value) => setNewSkill((prev) => ({ ...prev, level: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {skillLevels.map((level) => (
                          <SelectItem key={level} value={level}>
                            {level}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      type="number"
                      placeholder="Weight (1-5)"
                      min="1"
                      max="5"
                      value={newSkill.weight}
                      onChange={(e) =>
                        setNewSkill((prev) => ({ ...prev, weight: Math.max(1, Math.min(5, Number.parseInt(e.target.value) || 1)) }))
                      }
                    />
                    <Button onClick={addSkill} className="w-full" disabled={!newSkill.name.trim()}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Skill
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {formData.skillsRequired.map((skill, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                        <div>
                          <span className="font-medium">{skill.name}</span>
                          <span className="text-sm text-muted-foreground ml-2">
                            {skill.level} (Weight: {skill.weight})
                          </span>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => removeSkill(index)}>
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">{formData.skillsRequired.length}/15 skills</p>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-4">
              <Label className="text-base font-medium">Roles Required *</Label>
              <Card>
                <CardContent className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                    <Input
                      placeholder="Role name"
                      value={newRole.roleName}
                      onChange={(e) => setNewRole((prev) => ({ ...prev, roleName: e.target.value }))}
                      className={cn(errors.roles && "border-destructive")}
                    />
                    <Input
                      type="number"
                      placeholder="Count"
                      min="1"
                      max="10"
                      value={newRole.count}
                      onChange={(e) => setNewRole((prev) => ({ ...prev, count: Math.max(1, Math.min(10, Number.parseInt(e.target.value) || 1)) }))}
                    />
                    <Button onClick={addRole} className="w-full" disabled={!newRole.roleName.trim()}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Role
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {formData.rolesRequired.map((role, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                        <div>
                          <span className="font-medium">{role.roleName}</span>
                          <span className="text-sm text-muted-foreground ml-2">({role.count} needed)</span>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => removeRole(index)}>
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">{formData.rolesRequired.length}/10 roles</p>
                </CardContent>
              </Card>
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            {renderErrors()}
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="minTeamSize">Minimum Team Size *</Label>
                <Input
                  id="minTeamSize"
                  type="number"
                  min="1"
                  max="20"
                  value={formData.minTeamSize}
                  onChange={(e) => updateFormData("minTeamSize", Math.max(1, Math.min(20, Number.parseInt(e.target.value) || 1)))}
                  className={cn(errors[currentStep]?.some(e => e.includes("Minimum")) && "border-destructive")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxTeamSize">Maximum Team Size *</Label>
                <Input
                  id="maxTeamSize"
                  type="number"
                  min="1"
                  max="20"
                  value={formData.maxTeamSize}
                  onChange={(e) => updateFormData("maxTeamSize", Math.max(1, Math.min(20, Number.parseInt(e.target.value) || 1)))}
                  className={cn(errors[currentStep]?.some(e => e.includes("Maximum")) && "border-destructive")}
                />
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Availability </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Available Days </Label>
                  <div className="flex flex-wrap gap-2">
                    {weekDays.map((day) => (
                      <Button
                        key={day}
                        type="button"
                        variant={formData.availability.days.includes(day) ? "default" : "outline"}
                        size="sm"
                        onClick={() => toggleAvailabilityDay(day)}
                        className={cn(
                          errors[currentStep]?.some(e => e.includes("available day")) && 
                          !formData.availability.days.includes(day) && "border-destructive"
                        )}
                      >
                        {day}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="hoursPerWeek">Hours per Week </Label>
                    <Input
                      id="hoursPerWeek"
                      type="number"
                      min="1"
                      max="168"
                      value={formData.availability.hoursPerWeek}
                      onChange={(e) =>
                        updateFormData("availability", {
                          ...formData.availability,
                          hoursPerWeek: Math.max(1, Math.min(168, Number.parseInt(e.target.value) || 1)),
                        })
                      }
                      className={cn(errors[currentStep]?.some(e => e.includes("Hours")) && "border-destructive")}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="timeZone">Time Zone </Label>
                    <Input
                      id="timeZone"
                      placeholder="e.g., UTC, EST, PST"
                      value={formData.availability.timeZone}
                      onChange={(e) =>
                        updateFormData("availability", {
                          ...formData.availability,
                          timeZone: e.target.value,
                        })
                      }
                      className={cn(errors[currentStep]?.some(e => e.includes("Time zone")) && "border-destructive")}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )

      case 4:
        return (
          <div className="space-y-6">
            {renderErrors()}
            
            <div className="space-y-2">
              <Label htmlFor="hackathonName">Hackathon Name (Optional)</Label>
              <Input
                id="hackathonName"
                value={formData.hackathon.name}
                onChange={(e) =>
                  updateFormData("hackathon", {
                    ...formData.hackathon,
                    name: e.target.value,
                  })
                }
                placeholder="Enter hackathon name"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start Date (Optional)</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button 
                      variant="outline" 
                      className={cn(
                        "w-full justify-start text-left font-normal bg-transparent",
                        errors[currentStep]?.some(e => e.includes("Start date")) && "border-destructive"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.hackathon.startDate ? format(formData.hackathon.startDate, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.hackathon.startDate}
                      onSelect={(date) =>
                        updateFormData("hackathon", {
                          ...formData.hackathon,
                          startDate: date,
                        })
                      }
                      disabled={(date) => date < new Date()}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label>End Date (Optional)</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button 
                      variant="outline" 
                      className={cn(
                        "w-full justify-start text-left font-normal bg-transparent",
                        errors[currentStep]?.some(e => e.includes("End date")) && "border-destructive"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.hackathon.endDate ? format(formData.hackathon.endDate, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.hackathon.endDate}
                      onSelect={(date) =>
                        updateFormData("hackathon", {
                          ...formData.hackathon,
                          endDate: date,
                        })
                      }
                      disabled={(date) => {
                        const today = new Date()
                        const startDate = formData.hackathon.startDate
                        return date < today || (startDate && date <= startDate)
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="hackathonLocation">Location (Optional)</Label>
              <Input
                id="hackathonLocation"
                value={formData.hackathon.location}
                onChange={(e) =>
                  updateFormData("hackathon", {
                    ...formData.hackathon,
                    location: e.target.value,
                  })
                }
                placeholder="Enter location (e.g., San Francisco, CA or Remote)"
              />
            </div>
          </div>
        )

      case 5:
        return (
          <div className="space-y-6">
            {renderErrors()}
            
            <div className="space-y-2">
              <Label htmlFor="github" className="flex items-center gap-2">
                <Github className="w-4 h-4" />
                GitHub Repository (Optional)
              </Label>
              <Input
                id="github"
                value={formData.github}
                onChange={(e) => updateFormData("github", e.target.value)}
                placeholder="https://github.com/username/repo"
                className={cn(errors[currentStep]?.some(e => e.includes("GitHub")) && "border-destructive")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="figma" className="flex items-center gap-2">
                <Figma className="w-4 h-4" />
                Figma Design (Optional)
              </Label>
              <Input
                id="figma"
                value={formData.figma}
                onChange={(e) => updateFormData("figma", e.target.value)}
                placeholder="https://figma.com/file/..."
                className={cn(errors[currentStep]?.some(e => e.includes("Figma")) && "border-destructive")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="liveDemo" className="flex items-center gap-2">
                <ExternalLink className="w-4 h-4" />
                Live Demo (Optional)
              </Label>
              <Input
                id="liveDemo"
                value={formData.liveDemo}
                onChange={(e) => updateFormData("liveDemo", e.target.value)}
                placeholder="https://your-demo.com"
                className={cn(errors[currentStep]?.some(e => e.includes("Live demo")) && "border-destructive")}
              />
            </div>

            <div className="mt-4 p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">
                <strong>Note:</strong> All links are optional, but they help teammates understand your project better.
                Make sure URLs are complete and include https://.
              </p>
            </div>
          </div>
        )

      case 6:
        return (
          <div className="space-y-6">
            {renderErrors()}
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-green-500" />
                  Review Your Gig
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium text-foreground">Project Title</h4>
                  <p className="text-muted-foreground">{formData.title || "Not specified"}</p>
                </div>

                <div>
                  <h4 className="font-medium text-foreground">Description</h4>
                  <p className="text-muted-foreground text-sm">{formData.description || "Not specified"}</p>
                </div>

                <div>
                  <h4 className="font-medium text-foreground">Project Type</h4>
                  <p className="text-muted-foreground">{formData.projectType || "Not specified"}</p>
                </div>

                {formData.tags.length > 0 && (
                  <div>
                    <h4 className="font-medium text-foreground">Tags</h4>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {formData.tags.map((tag) => (
                        <Badge key={tag} variant="secondary">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {formData.skillsRequired.length > 0 && (
                  <div>
                    <h4 className="font-medium text-foreground">Skills Required</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-1">
                      {formData.skillsRequired.map((skill, index) => (
                        <div key={index} className="flex justify-between items-center p-2 bg-muted rounded text-sm">
                          <span className="font-medium">{skill.name}</span>
                          <span className="text-muted-foreground">{skill.level} (W: {skill.weight})</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {formData.rolesRequired.length > 0 && (
                  <div>
                    <h4 className="font-medium text-foreground">Roles Required</h4>
                    <div className="space-y-1 mt-1">
                      {formData.rolesRequired.map((role, index) => (
                        <div key={index} className="flex justify-between items-center p-2 bg-muted rounded text-sm">
                          <span className="font-medium">{role.roleName}</span>
                          <span className="text-muted-foreground">{role.count} needed</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <h4 className="font-medium text-foreground">Team Size</h4>
                  <p className="text-muted-foreground">
                    {formData.minTeamSize} - {formData.maxTeamSize} members
                  </p>
                </div>

                <div>
                  <h4 className="font-medium text-foreground">Availability</h4>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>Days: {formData.availability.days.join(", ") || "Not specified"}</p>
                    <p>Hours per week: {formData.availability.hoursPerWeek}</p>
                    <p>Time zone: {formData.availability.timeZone || "Not specified"}</p>
                  </div>
                </div>

                {(formData.hackathon.name || formData.hackathon.startDate || formData.hackathon.location) && (
                  <div>
                    <h4 className="font-medium text-foreground">Hackathon Details</h4>
                    <div className="text-sm text-muted-foreground space-y-1">
                      {formData.hackathon.name && <p>Name: {formData.hackathon.name}</p>}
                      {formData.hackathon.startDate && (
                        <p>
                          Duration: {format(formData.hackathon.startDate, "PPP")}
                          {formData.hackathon.endDate && ` - ${format(formData.hackathon.endDate, "PPP")}`}
                        </p>
                      )}
                      {formData.hackathon.location && <p>Location: {formData.hackathon.location}</p>}
                    </div>
                  </div>
                )}

                {(formData.github || formData.figma || formData.liveDemo) && (
                  <div>
                    <h4 className="font-medium text-foreground">Links</h4>
                    <div className="text-sm text-muted-foreground space-y-1">
                      {formData.github && (
                        <p className="flex items-center gap-2">
                          <Github className="w-4 h-4" />
                          GitHub: {formData.github}
                        </p>
                      )}
                      {formData.figma && (
                        <p className="flex items-center gap-2">
                          <Figma className="w-4 h-4" />
                          Figma: {formData.figma}
                        </p>
                      )}
                      {formData.liveDemo && (
                        <p className="flex items-center gap-2">
                          <ExternalLink className="w-4 h-4" />
                          Demo: {formData.liveDemo}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Ready to submit?</strong> Please review all the information above. 
                Once you create the gig, you'll be able to connect with teammates who match your requirements.
              </p>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card className="shadow-lg">
        <CardHeader className="pb-6">
          <CardTitle className="text-2xl font-bold text-center text-foreground">Create New Gig</CardTitle>
          {renderProgressBar()}
        </CardHeader>

        <CardContent className="px-8 pb-8">
          <div className="min-h-[400px]">{renderStep()}</div>

          <div className="flex justify-between mt-8 pt-6 border-t">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 1}
              className="flex items-center gap-2 bg-transparent"
            >
              <ArrowLeft className="w-4 h-4" />
              Previous
            </Button>

            {currentStep === steps.length ? (
              <Button 
                onClick={handleSubmit} 
                disabled={isSubmitting}
                className="flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    Create Gig
                  </>
                )}
              </Button>
            ) : (
              <Button onClick={nextStep} className="flex items-center gap-2">
                Next
                <ArrowRight className="w-4 h-4" />
              </Button>
            )}
          </div>
          
          {isExploding && (
            <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-50">
              <ConfettiExplosion
                force={0.8}
                duration={3000}
                particleCount={250}
                width={1600}
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}