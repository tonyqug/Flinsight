import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, Clock, FileCheck, Mail, UserCheck } from "lucide-react"
import { type ActionItem } from "@/lib/api-service"
import { useState } from "react"

interface ActionItemsProps {
  items: ActionItem[]
  onStatusUpdate: (itemId: string, status: string) => Promise<void>
  onItemsChange: (items: ActionItem[]) => void
}

export function ActionItems({ items, onStatusUpdate, onItemsChange }: ActionItemsProps) {
  const [isCompleting, setIsCompleting] = useState<string | null>(null)

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <Badge className="bg-green-500/20 text-green-500 hover:bg-green-500/30 border-green-500/20">Completed</Badge>
        )
      case "in-progress":
        return (
          <Badge className="bg-blue-500/20 text-blue-500 hover:bg-blue-500/30 border-blue-500/20">In Progress</Badge>
        )
      default:
        return (
          <Badge className="bg-amber-500/20 text-amber-500 hover:bg-amber-500/30 border-amber-500/20">Pending</Badge>
        )
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type?.toLowerCase()) {
      case "inspection":
        return <FileCheck className="h-5 w-5 text-blue-500" />
      case "notification":
        return <Mail className="h-5 w-5 text-purple-500" />
      default:
        return <Clock className="h-5 w-5 text-amber-500" />
    }
  }

  const handleComplete = async (itemId: string) => {
    if (!itemId) return
    
    setIsCompleting(itemId)
    try {
      // await onStatusUpdate(itemId, "completed")
      // Update the local state to reflect the change immediately
      const updatedItems = items.map(item => 
        item.title === itemId ? { ...item, status: "completed" as const } : item
      )
      console.log(updatedItems)
      onItemsChange(updatedItems)
    } catch (error) {
      console.error("Error completing task:", error)
    } finally {
      setIsCompleting(null)
    }
  }

  return (
    <Card className="bg-slate-900 border-slate-800">
      <CardHeader>
        <CardTitle>Action Items</CardTitle>
        <CardDescription className="text-slate-400">
          Tasks that require attention to maintain compliance
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {items.map((item,index) => (
            <div key={index} className="p-4 rounded-lg border border-slate-800 bg-slate-800/50">
              <div className="flex items-start">
                <div className="mr-3 mt-1">{getTypeIcon(item.responsible_role)}</div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-medium">{item.title}</h3>
                    {getStatusBadge(item.status)}
                  </div>
                  <p className="text-slate-300 text-sm mb-2">{item.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400">Due: {item.due_date}</span>
                    <div className="flex space-x-2">
                      {/* <Button variant="outline" size="sm" className="h-8 border-slate-700 hover:bg-slate-800">
                        <UserCheck className="h-4 w-4 mr-1" />
                        Assign
                      </Button> */}
                      {item.status !== "completed" && (
                        <Button 
                          size="sm" 
                          className="h-8 bg-blue-600 hover:bg-blue-700"
                          onClick={async () => {
                            console.log(items)
                            if (item.title && await handleComplete(item.title)) return
                          }}
                          disabled={isCompleting === item.title}
                        >
                          <CheckCircle2 className="h-4 w-4 mr-1" />
                          {isCompleting === item.title ? "Completing..." : "Complete"}
                        </Button>
                      )}
                    </div>
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

