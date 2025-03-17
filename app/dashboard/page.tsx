"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AlertCircle, CheckCircle2, Plane, Shield, Zap } from "lucide-react"
import { FlightPlanForm } from "@/components/flight-plan-form"
import { ComplianceAlert } from "@/components/compliance-alert"
import { DashboardHeader } from "@/components/dashboard-header"
import { RecentUpdates } from "@/components/recent-updates"
import { ActionItems } from "@/components/action-items"
import { ChatInterface } from "@/components/chat-interface"
import { useState, useEffect } from "react"
import { type FlightAnalysisResponse, type FAAUpdate, type ActionItem, apiService } from "@/lib2/api-service"

export default function Dashboard() {
  const [analysis, setAnalysis] = useState<FlightAnalysisResponse | null>(null)
  const [faaUpdates, setFaaUpdates] = useState<FAAUpdate[]>([])
  const [actionItems, setActionItems] = useState<ActionItem[]>([])

  useEffect(() => {
    // Fetch initial data
    const fetchData = async () => {
      try {
        const [updates] = await Promise.all([
          apiService.getFAAUpdates(),
          // apiService.generateActionItems("latest")
        ])
        console.log(updates)
        setFaaUpdates(updates)
        // setActionItems(items)
      } catch (error) {
        console.error("Error fetching dashboard data:", error)
      }
    }
    fetchData()
  }, [])

  const handleAnalysisComplete = (analysis: FlightAnalysisResponse) => {
    setAnalysis(analysis)
    // Refresh action items after new analysis
    const actionItems: ActionItem[] = analysis.analysis.required_actions.map((action, index) => ({
      id: analysis.analysis.applicable_regulations[index],  // Get regulation ID from applicable_regulations
      title: analysis.analysis.compliance_risks[index],  // Get title from compliance_risks
      description: action,
      due_date: "2025-04-01",  // Placeholder for due date
      responsible_role: "maintenance_team",  // Placeholder role
      priority: "high",  // Placeholder priority
      status: "pending",  // Placeholder status
    }));
    setActionItems(actionItems)
  }

  // Calculate compliance percentage based on action items
  const compliancePercentage = actionItems.length > 0
    ? Math.round((actionItems.filter(item => item.status === "completed").length / actionItems.length) * 100)
    : 100

  // Get pending action items count
  const pendingActionsCount = actionItems.filter(item => item.status !== "completed").length

  // Get recent FAA updates count (last 24 hours)
  const recentUpdatesCount = faaUpdates.filter(update => {
    const updateDate = new Date(update.date)
    const now = new Date()
    const hoursDiff = (now.getTime() - updateDate.getTime()) / (1000 * 60 * 60)
    return hoursDiff <= 24 * 120
  }).length

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 to-black text-white">
      <DashboardHeader />

      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2 flex flex-row gap-2">Flight Compliance Dashboard<Plane className="ml-2 h-[40px] w-[40px]" /></h1>
            <p className="text-slate-400">Monitor and manage your flight compliance in real-time</p>
          </div>

          {/* <Button className="bg-blue-600 hover:bg-blue-700">
            New Flight Plan
            <Plane className="ml-2 h-4 w-4" />
          </Button> */}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <Shield className="h-5 w-5 mr-2 text-green-400" />
                Compliance Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <CheckCircle2 className="h-8 w-8 text-green-500 mr-3" />
                <div>
                  <p className="text-2xl font-bold">{compliancePercentage}%</p>
                  <p className="text-slate-400 text-sm">Overall Compliance</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <AlertCircle className="h-5 w-5 mr-2 text-amber-400" />
                Pending Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <div className="h-8 w-8 rounded-full bg-amber-500/20 text-amber-500 flex items-center justify-center mr-3 font-bold">
                  {pendingActionsCount}
                </div>
                <div>
                  <p className="text-2xl font-bold">{pendingActionsCount} Items</p>
                  <p className="text-slate-400 text-sm">Require Attention</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <Zap className="h-5 w-5 mr-2 text-blue-400" />
                FAA Updates
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <div className="h-8 w-8 rounded-full bg-blue-500/20 text-blue-500 flex items-center justify-center mr-3 font-bold">
                  {recentUpdatesCount}
                </div>
                <div>
                  <p className="text-2xl font-bold">{recentUpdatesCount} New</p>
                  <p className="text-slate-400 text-sm">In the last 4 months</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="flight-plan" className="mb-8">
          <TabsList className="bg-slate-900 border border-slate-800">
            <TabsTrigger value="flight-plan">Flight Plan Analysis</TabsTrigger>
            <TabsTrigger value="updates">Recent FAA Updates</TabsTrigger>
            <TabsTrigger value="actions">Action Items</TabsTrigger>
            <TabsTrigger value="chat">AI Assistant</TabsTrigger>
          </TabsList>

          <TabsContent value="flight-plan" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1">
                <Card className="bg-slate-900 border-slate-800">
                  <CardHeader>
                    <CardTitle>Flight Details</CardTitle>
                    <CardDescription className="text-slate-400">
                      Enter your flight information for compliance analysis
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <FlightPlanForm onAnalysisComplete={handleAnalysisComplete} />
                  </CardContent>
                </Card>
              </div>

              <div className="lg:col-span-2">
                <Card className="bg-slate-900 border-slate-800">
                  <CardHeader>
                    <CardTitle>Compliance Analysis</CardTitle>
                    <CardDescription className="text-slate-400">
                      Contextual FAA rules applicable to your flight
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {analysis ? (
                      <>
                        {analysis.analysis.applicable_regulations.map((regulation, index) => (
                          <ComplianceAlert
                            key={index}
                            title={regulation}
                            description={analysis.analysis.compliance_risks[index] || "Review and ensure compliance"}
                            severity={analysis.analysis.compliance_risks[index]?.toLowerCase().includes("risk") ? "warning" : "info"}
                            date={new Date().toLocaleDateString()}
                          />
                        ))}
                      </>
                    ) : (
                      <p className="text-slate-400">Submit a flight plan to see compliance analysis</p>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="updates" className="mt-6">
            <RecentUpdates updates={faaUpdates} />
          </TabsContent>

          <TabsContent value="actions" className="mt-6">
            <ActionItems 
              items={actionItems} 
              onStatusUpdate={apiService.updateActionItemStatus}
              onItemsChange={setActionItems}
            />
          </TabsContent>

          <TabsContent value="chat" className="mt-6">
            <ChatInterface onSendMessage={apiService.sendChatMessage} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}

