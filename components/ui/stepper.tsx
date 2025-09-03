"use client"

import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

type Step = {
  id: number
  name: string
}

interface StepperProps {
  currentStep: number // 1-based
  steps: Step[]
  className?: string
}

export function Stepper({ currentStep, steps, className }: StepperProps) {
  return (
    <nav aria-label="Progress" className={cn("w-full", className)}>
      <ol className="grid grid-cols-3 gap-4 md:gap-6">
        {steps.map((step, idx) => {
          const state = step.id < currentStep ? "complete" : step.id === currentStep ? "current" : "upcoming"

          return (
            <li key={step.id} className="flex items-center gap-3">
              <div
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full border text-sm font-medium",
                  state === "complete" && "bg-primary text-primary-foreground border-primary",
                  state === "current" && "border-primary text-primary",
                  state === "upcoming" && "border-muted-foreground/30 text-muted-foreground",
                )}
                aria-current={state === "current" ? "step" : undefined}
              >
                {state === "complete" ? <Check className="h-4 w-4" aria-hidden="true" /> : step.id}
                <span className="sr-only">
                  {step.name} {state}
                </span>
              </div>

              <div className="flex-1">
                <p
                  className={cn(
                    "text-sm font-medium text-pretty",
                    state === "complete" && "text-foreground",
                    state === "current" && "text-foreground",
                    state === "upcoming" && "text-muted-foreground",
                  )}
                >
                  {step.name}
                </p>
                <div
                  className={cn(
                    "mt-2 h-1 w-full rounded-full bg-muted",
                    state === "complete" && "bg-primary/80",
                    state === "current" && "bg-primary/50",
                  )}
                  aria-hidden="true"
                />
              </div>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
