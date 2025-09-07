"use client"

import { Badge } from "@/components/ui/badge"

interface SkillsBadgeProps {
  skills?: string[]
  limit?: number
  className?: string
}

export default function SkillsBadge({ skills = [], limit = 5, className }: SkillsBadgeProps) {
  // Flatten array: if any item contains commas, split it
  const skillsArray = skills
    .flatMap(skill => skill.split(",").map(s => s.trim()))
    .filter(Boolean)

  if (skillsArray.length === 0) return null

  return (
    <div className={`flex flex-wrap gap-1 ${className}`}>
      {skillsArray.slice(0, limit).map((skill, idx) => (
        <Badge
          key={idx}
          variant="outline"
          className="text-xs py-0 px-1 h-4"
        >
          {skill}
        </Badge>
      ))}
      {skillsArray.length > limit && (
        <span className="text-xs text-muted-foreground">+{skillsArray.length - limit}</span>
      )}
    </div>
  )
}
