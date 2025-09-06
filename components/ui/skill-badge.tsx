"use client"

import { Badge } from "@/components/ui/badge"

interface SkillsBadgeProps {
  skills?: string[]
  limit?: number // max number of badges to show before showing +N
  className?: string
}

export default function SkillsBadge({ skills = [], limit = 2, className }: SkillsBadgeProps) {
  if (skills.length === 0) return null
    console.log(skills)
  return (
    <div className={`flex flex-wrap gap-1 ${className}`}>
      {skills.slice(0, limit).map((skill, idx) => (
        <Badge 
          key={idx} 
          variant="outline" 
          className="text-xs py-0 px-1 h-4"
        >
          {skill}
        </Badge>
      ))}
      {skills.length > limit && (
        <span className="text-xs text-muted-foreground">+{skills.length - limit}</span>
      )}
    </div>
  )
}
