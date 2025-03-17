import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FileText, AlertCircle, Info } from "lucide-react"
import { type FAAUpdate } from "@/lib2/api-service"
import ReactMarkdown from "react-markdown"

interface RecentUpdatesProps {
  updates: FAAUpdate[]
}

export function RecentUpdates({ updates }: RecentUpdatesProps) {
  const getImpactBadge = (impact?: string) => {
    switch (impact?.toLowerCase()) {
      case "high":
        return <Badge className="bg-red-500/20 text-red-500 hover:bg-red-500/30 border-red-500/20">High Impact</Badge>
      case "medium":
        return (
          <Badge className="bg-amber-500/20 text-amber-500 hover:bg-amber-500/30 border-amber-500/20">
            Medium Impact
          </Badge>
        )
      default:
        return (
          <Badge className="bg-green-500/20 text-green-500 hover:bg-green-500/30 border-green-500/20">Low Impact</Badge>
        )
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type?.toLowerCase()) {
      case "regulation":
        return <AlertCircle className="h-5 w-5 text-amber-500" />
      case "loi":
        return <Info className="h-5 w-5 text-blue-500" />
      default:
        return <FileText className="h-5 w-5 text-slate-400" />
    }
  }

  return (
    <Card className="bg-slate-900 border-slate-800">
      <CardHeader>
        <CardTitle>Recent FAA Updates</CardTitle>
        <CardDescription className="text-slate-400">
          Latest regulatory changes, advisory circulars, and legal interpretations
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {updates.map((update) => (
            <div
              key={update.id}
              className="p-4 rounded-lg border border-slate-800 bg-slate-800/50 hover:bg-slate-800/80 transition-colors cursor-pointer"
            >
              <div className="flex items-start">
                <div className="mr-3 mt-1">{getTypeIcon(update.type)}</div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-medium">{update.title}</h3>
                    {getImpactBadge(update.ai_analysis?.applicability)}
                  </div>
                  <p className="text-slate-300 text-sm mb-2">{update.content.slice(0,200)}...</p>
                  <div className="text-slate-300 text-sm mb-2"><ReactMarkdown>
                  {update.ai_analysis?.applicability}
                  </ReactMarkdown></div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400">{update.date}</span>
                    <Badge variant="outline" className="text-xs border-slate-700">
                      {update.type}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

