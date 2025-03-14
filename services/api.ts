import axios from "axios"

// Create an axios instance with the base URL from environment variables
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
})

// Types for our API responses
export interface FlightDetails {
  departure: string
  arrival: string
  aircraft: string
  date: string
  passengers: number
}

export interface RegulationItem {
  id: string
  title: string
  content: string
  category: string
  date: string
}

export interface FlightAnalysis {
  applicable_regulations: string[]
  required_actions: string[]
  compliance_risks: string[]
}

export interface ActionItem {
  title: string
  description: string
  due_date: string
  responsible_role: string
  priority: "high" | "medium" | "low"
  status: "pending" | "completed" | "in-progress"
}

export interface FAAUpdate {
  title: string
  description: string
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

// API functions
export const apiService = {
  // Health check
  async healthCheck() {
    try {
      const response = await api.get("/health")
      return response.data
    } catch (error) {
      console.error("API Health Check Error:", error)
      throw error
    }
  },

  // Analyze a flight plan
  async analyzeFlight(flightDetails: FlightDetails) {
    try {
      const response = await api.post("/analyze-flight", flightDetails)
      return response.data
    } catch (error) {
      console.error("Flight Analysis Error:", error)
      throw error
    }
  },

  // Get regulations
  async getRegulations(params?: { category?: string; search?: string }) {
    try {
      const response = await api.get("/regulations", { params })
      return response.data
    } catch (error) {
      console.error("Get Regulations Error:", error)
      throw error
    }
  },

  // Fetch FAA updates
  async getFAAUpdates() {
    try {
      const response = await api.get("/fetch-faa-updates")
      return response.data
    } catch (error) {
      console.error("FAA Updates Error:", error)
      throw error
    }
  },

  // Generate action items for a flight
  async generateActionItems(flightId: string) {
    try {
      const response = await api.post("/generate-action-items", { flight_id: flightId })
      return response.data
    } catch (error) {
      console.error("Generate Action Items Error:", error)
      throw error
    }
  },

  // Get aircraft data (with Gulfstream 550 prioritized)
  async getAircraftData() {
    try {
      const response = await api.get("/aircraft")
      // Ensure Gulfstream 550 appears at the top of the list if present
      const aircraft = response.data
      const g550Index = aircraft.findIndex(
        (a: any) => a.type.toLowerCase().includes("gulfstream") && a.model.includes("550"),
      )

      if (g550Index > 0) {
        const g550 = aircraft.splice(g550Index, 1)[0]
        aircraft.unshift(g550)
      }

      return aircraft
    } catch (error) {
      console.error("Aircraft Data Error:", error)
      // Fallback to provide at least the Gulfstream 550 data
      return [
        {
          id: "g550",
          type: "Gulfstream",
          model: "550",
          icao: "GLF5",
          description: "Large cabin, ultra-long-range business jet",
          ceiling: 51000,
          range: 6750,
          max_passengers: 19,
        },
        {
          id: "c172",
          type: "Cessna",
          model: "172",
          icao: "C172",
          description: "Single-engine light aircraft",
          ceiling: 14000,
          range: 800,
          max_passengers: 3,
        },
      ]
    }
  },
}

export default apiService

