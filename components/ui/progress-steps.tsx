import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib2/utils"
import { CheckCircle2, Circle, Loader2 } from "lucide-react"

interface ProgressStep {
  label: string
  status: "pending" | "loading" | "complete"
}

interface ProgressStepsProps {
  steps: ProgressStep[]
  currentStep: number
}

export function ProgressSteps({ steps, currentStep }: ProgressStepsProps) {
  const progress = Math.round((currentStep / (steps.length - 1)) * 100)

  return (
    <div className="w-full space-y-2">
      <Progress value={progress} className="h-2" />
      <div className="grid grid-cols-1 gap-2">
        {steps.map((step, index) => (
          <div
            key={step.label}
            className={cn(
              "flex items-center gap-2 text-sm",
              index <= currentStep ? "text-white" : "text-slate-500"
            )}
          >
            {step.status === "complete" ? (
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            ) : step.status === "loading" ? (
              <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
            ) : (
              <Circle className="h-4 w-4" />
            )}
            <span>{step.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
} 