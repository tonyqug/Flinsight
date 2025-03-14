import { AlertCircle, CheckCircle, Info } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { cn } from "@/lib/utils"

type ComplianceAlertProps = {
  title: string
  description: string
  severity: "success" | "warning" | "info" | "error"
  date: string
}

export function ComplianceAlert({ title, description, severity = "info", date }: ComplianceAlertProps) {
  const getIcon = () => {
    switch (severity) {
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "warning":
        return <AlertCircle className="h-5 w-5 text-amber-500" />
      case "error":
        return <AlertCircle className="h-5 w-5 text-red-500" />
      default:
        return <Info className="h-5 w-5 text-blue-500" />
    }
  }

  const getBgColor = () => {
    switch (severity) {
      case "success":
        return "bg-green-500/10 border-green-500/20"
      case "warning":
        return "bg-amber-500/10 border-amber-500/20"
      case "error":
        return "bg-red-500/10 border-red-500/20"
      default:
        return "bg-blue-500/10 border-blue-500/20"
    }
  }

  return (
    <Alert className={cn("mb-4 border", getBgColor())}>
      <div className="flex items-start">
        <div className="mr-3 mt-0.5">{getIcon()}</div>
        <div className="flex-1">
          <AlertTitle className="text-white flex items-center justify-between">
            <span>{title}</span>
            <span className="text-xs text-slate-400">{date}</span>
          </AlertTitle>
          <AlertDescription className="text-slate-300">{description}</AlertDescription>
        </div>
      </div>
    </Alert>
  )
}

