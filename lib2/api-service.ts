import { toast } from "@/hooks/use-toast"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"

export interface FlightPlan {
  departure: string
  arrival: string
  aircraft: string
  date: string
  passengers: number
}

export interface ComplianceAnalysis {
  applicable_regulations: string[]
  required_actions: string[]
  compliance_risks: string[]
}

export interface FlightAnalysisResponse {
  flight_details: FlightPlan
  analysis: ComplianceAnalysis
}

export interface Regulation {
  id: string
  title: string
  content: string
  category: string
  date: string
}

export interface FAAUpdate {
  id?: string
  title: string
  content: string
  date: string
  link: string
  source: string
  type: string
  ai_analysis?: {
    regulation: string
    changes: string
    applicability: string
    deadline: string
    impact: string
  }
}

export interface ActionItem {
  id?: string
  title: string
  description: string
  due_date: string
  responsible_role: string
  priority: "high" | "medium" | "low"
  status: "pending" | "in-progress" | "completed"
  flight_departure?: string
  flight_arrival?: string
  flight_date?: string
}

export interface ChatResponse {
  response: string
  regulations_used: string[][]
}

class APIService {
  async analyzeFlightPlan(flightPlan: FlightPlan): Promise<FlightAnalysisResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/analyze-flight`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(flightPlan),
      })

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error("Error analyzing flight plan:", error)
      toast({
        title: "Error",
        description: "Failed to analyze flight plan. Please try again.",
        variant: "destructive",
      })
      throw error
    }
  }

  async getRegulations(category?: string, search?: string): Promise<Regulation[]> {
    try {
      let url = `${API_BASE_URL}/regulations`
      const params = new URLSearchParams()

      if (category) {
        params.append("category", category)
      }

      if (search) {
        params.append("search", search)
      }

      if (params.toString()) {
        url += `?${params.toString()}`
      }

      const response = await fetch(url)

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error("Error fetching regulations:", error)
      toast({
        title: "Error",
        description: "Failed to fetch regulations. Please try again.",
        variant: "destructive",
      })
      throw error
    }
  }

  async getFAAUpdates(): Promise<FAAUpdate[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/fetch-faa-updates`)

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }

      const data = await response.json()
      console.log(data)
      return data.updates || []
    } catch (error) {
      console.error("Error fetching FAA updates:", error)
      toast({
        title: "Error",
        description: "Failed to fetch FAA updates. Please try again.",
        variant: "destructive",
      })
      throw error
    }
  }

  async generateActionItems(flightId: string): Promise<ActionItem[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/generate-action-items`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ flight_id: flightId }),
      })

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }

      const data = await response.json()
      return data.action_items || []
    } catch (error) {
      console.error("Error generating action items:", error)
      toast({
        title: "Error",
        description: "Failed to generate action items. Please try again.",
        variant: "destructive",
      })
      throw error
    }
  }

  async updateActionItemStatus(itemId: string, status: string): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/action-items/${itemId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      })

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }

      toast({
        title: "Success",
        description: "Action item status updated successfully.",
      })
    } catch (error) {
      console.error("Error updating action item status:", error)
      toast({
        title: "Error",
        description: "Failed to update action item status. Please try again.",
        variant: "destructive",
      })
      throw error
    }
  }

  async sendChatMessage(message: string): Promise<ChatResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message }),
      })

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error("Error sending chat message:", error)
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      })
      throw error
    }
  }
}

export const apiService = new APIService()

