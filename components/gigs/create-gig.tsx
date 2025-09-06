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
import { CalendarIcon, Plus, X, ArrowLeft, ArrowRight, Check, Github, Figma, ExternalLink } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { createGig } from "@/actions/gig/create-gig.action"

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

  const updateFormData = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      updateFormData("tags", [...formData.tags, newTag.trim()])
      setNewTag("")
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
      updateFormData("skillsRequired", [...formData.skillsRequired, { ...newSkill }])
      setNewSkill({ name: "", level: "Beginner", weight: 1 })
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
      updateFormData("rolesRequired", [...formData.rolesRequired, { ...newRole }])
      setNewRole({ roleName: "", count: 1, mustHaveSkills: [] })
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
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

const handleSubmit = async () => {
  try {
    const result = await createGig(formData);
    console.log("✅ Gig created:", result);
    // redirect or toast here
  } catch (err) {
    console.error(err);
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

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Project Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => updateFormData("title", e.target.value)}
                placeholder="Enter your project title"
                className="text-base"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => updateFormData("description", e.target.value)}
                placeholder="Describe your project in detail..."
                rows={4}
                className="text-base resize-none"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="projectType">Project Type *</Label>
              <Select value={formData.projectType} onValueChange={(value) => updateFormData("projectType", value)}>
                <SelectTrigger>
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
              <Label>Tags</Label>
              <div className="flex gap-2 mb-2">
                <Input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="Add a tag"
                  onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
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
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <Label className="text-base font-medium">Skills Required</Label>
              <Card>
                <CardContent className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
                    <Input
                      placeholder="Skill name"
                      value={newSkill.name}
                      onChange={(e) => setNewSkill((prev) => ({ ...prev, name: e.target.value }))}
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
                      placeholder="Weight"
                      min="1"
                      max="5"
                      value={newSkill.weight}
                      onChange={(e) =>
                        setNewSkill((prev) => ({ ...prev, weight: Number.parseInt(e.target.value) || 1 }))
                      }
                    />
                    <Button onClick={addSkill} className="w-full">
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
                </CardContent>
              </Card>
            </div>

            <div className="space-y-4">
              <Label className="text-base font-medium">Roles Required</Label>
              <Card>
                <CardContent className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                    <Input
                      placeholder="Role name"
                      value={newRole.roleName}
                      onChange={(e) => setNewRole((prev) => ({ ...prev, roleName: e.target.value }))}
                    />
                    <Input
                      type="number"
                      placeholder="Count"
                      min="1"
                      value={newRole.count}
                      onChange={(e) => setNewRole((prev) => ({ ...prev, count: Number.parseInt(e.target.value) || 1 }))}
                    />
                    <Button onClick={addRole} className="w-full">
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
                </CardContent>
              </Card>
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="minTeamSize">Minimum Team Size</Label>
                <Input
                  id="minTeamSize"
                  type="number"
                  min="1"
                  value={formData.minTeamSize}
                  onChange={(e) => updateFormData("minTeamSize", Number.parseInt(e.target.value) || 1)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxTeamSize">Maximum Team Size</Label>
                <Input
                  id="maxTeamSize"
                  type="number"
                  min="1"
                  value={formData.maxTeamSize}
                  onChange={(e) => updateFormData("maxTeamSize", Number.parseInt(e.target.value) || 1)}
                />
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Availability</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Available Days</Label>
                  <div className="flex flex-wrap gap-2">
                    {weekDays.map((day) => (
                      <Button
                        key={day}
                        type="button"
                        variant={formData.availability.days.includes(day) ? "default" : "outline"}
                        size="sm"
                        onClick={() => toggleAvailabilityDay(day)}
                      >
                        {day}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="hoursPerWeek">Hours per Week</Label>
                    <Input
                      id="hoursPerWeek"
                      type="number"
                      min="1"
                      max="168"
                      value={formData.availability.hoursPerWeek}
                      onChange={(e) =>
                        updateFormData("availability", {
                          ...formData.availability,
                          hoursPerWeek: Number.parseInt(e.target.value) || 1,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="timeZone">Time Zone</Label>
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
            <div className="space-y-2">
              <Label htmlFor="hackathonName">Hackathon Name</Label>
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
                <Label>Start Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal bg-transparent">
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
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label>End Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal bg-transparent">
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
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="hackathonLocation">Location</Label>
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
            <div className="space-y-2">
              <Label htmlFor="github" className="flex items-center gap-2">
                <Github className="w-4 h-4" />
                GitHub Repository
              </Label>
              <Input
                id="github"
                value={formData.github}
                onChange={(e) => updateFormData("github", e.target.value)}
                placeholder="https://github.com/username/repo"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="figma" className="flex items-center gap-2">
                <Figma className="w-4 h-4" />
                Figma Design
              </Label>
              <Input
                id="figma"
                value={formData.figma}
                onChange={(e) => updateFormData("figma", e.target.value)}
                placeholder="https://figma.com/file/..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="liveDemo" className="flex items-center gap-2">
                <ExternalLink className="w-4 h-4" />
                Live Demo
              </Label>
              <Input
                id="liveDemo"
                value={formData.liveDemo}
                onChange={(e) => updateFormData("liveDemo", e.target.value)}
                placeholder="https://your-demo.com"
              />
            </div>
          </div>
        )

      case 6:
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Review Your Gig</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium text-foreground">Project Title</h4>
                  <p className="text-muted-foreground">{formData.title || "Not specified"}</p>
                </div>

                <div>
                  <h4 className="font-medium text-foreground">Description</h4>
                  <p className="text-muted-foreground">{formData.description || "Not specified"}</p>
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
                    <div className="space-y-1 mt-1">
                      {formData.skillsRequired.map((skill, index) => (
                        <p key={index} className="text-sm text-muted-foreground">
                          {skill.name} - {skill.level} (Weight: {skill.weight})
                        </p>
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
              </CardContent>
            </Card>
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
              <Button onClick={handleSubmit} className="flex items-center gap-2">
                <Check className="w-4 h-4" />
                Create Gig
              </Button>
            ) : (
              <Button onClick={nextStep} className="flex items-center gap-2">
                Next
                <ArrowRight className="w-4 h-4" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
