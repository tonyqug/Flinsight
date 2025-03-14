"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2 } from "lucide-react"
import { apiService, type FlightPlan, type FlightAnalysisResponse } from "@/lib/api-service"
import { toast } from "@/hooks/use-toast"
import { ProgressSteps } from "@/components/ui/progress-steps"

interface FlightPlanFormProps {
  onAnalysisComplete: (analysis: FlightAnalysisResponse) => void
}

export function FlightPlanForm({ onAnalysisComplete }: FlightPlanFormProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [processingSteps, setProcessingSteps] = useState<{
    steps: { label: string; status: "pending" | "loading" | "complete" }[];
    currentStep: number;
  }>({
    steps: [
      { label: "Gathering weather data", status: "pending" },
      { label: "Analyzing route", status: "pending" },
      { label: "Finding applicable regulations", status: "pending" },
      { label: "Generating compliance analysis", status: "pending" }
    ],
    currentStep: -1
  })
  const [weatherData, setWeatherData] = useState(["",""])
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsAnalyzing(true)

    // Reset progress steps
    setProcessingSteps({
      steps: [
        { label: "Gathering weather data", status: "loading" },
        { label: "Analyzing route", status: "pending" },
        { label: "Finding applicable regulations", status: "pending" },
        { label: "Generating compliance analysis", status: "pending" }
      ],
      currentStep: 0
    })

    const form = e.target as HTMLFormElement
    const formData = new FormData(form)

    try {
      // Simulate progress (in production, this would be based on backend events)
      setTimeout(() => {
        setProcessingSteps(prev => ({
          steps: prev.steps.map((step, i) => ({
            ...step,
            status: i === 0 ? "complete" : i === 1 ? "loading" : "pending"
          })),
          currentStep: 1
        }))
      }, 1000)
      const responseWeather = await fetch("http://localhost:5000/api/weather_at", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          departure: formData.get("departure"),
          arrival: formData.get("arrival"),
        }),
      })
      const weatherDataDict = await responseWeather.json()
      console.log(weatherDataDict)
      setWeatherData([weatherDataDict["departure"], weatherDataDict["arrival"]])
      setTimeout(() => {
        setProcessingSteps(prev => ({
          steps: prev.steps.map((step, i) => ({
            ...step,
            status: i === 1 ? "complete" : i === 2 ? "loading" : "pending"
          })),
          currentStep: 2
        }))
      }, 2000)

      setTimeout(() => {
        setProcessingSteps(prev => ({
          steps: prev.steps.map((step, i) => ({
            ...step,
            status: i === 2 ? "complete" : i === 3 ? "loading" : "pending"
          })),
          currentStep: 3
        }))
      }, 3000)
      

      const response = await fetch("http://localhost:5000/api/analyze-flight", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          departure: formData.get("departure"),
          arrival: formData.get("arrival"),
          aircraft: formData.get("aircraft"),
          date: formData.get("date"),
          passengers: Number(formData.get("passengers")),
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to analyze flight plan")
      }

      const analysis = await response.json()
      console.log(analysis)
      // Complete all steps
      setProcessingSteps(prev => ({
        steps: prev.steps.map(step => ({ ...step, status: "complete" })),
        currentStep: prev.steps.length - 1
      }))

      onAnalysisComplete(analysis)
    } catch (error) {
      console.error("Error analyzing flight plan:", error)
    } finally {
      setIsAnalyzing(false)
      // Reset progress after a delay
      setTimeout(() => {
        setProcessingSteps({
          steps: [
            { label: "Gathering weather data", status: "pending" },
            { label: "Analyzing route", status: "pending" },
            { label: "Finding applicable regulations", status: "pending" },
            { label: "Generating compliance analysis", status: "pending" }
          ],
          currentStep: -1
        })
      }, 1000)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="departure">Departure Airport</Label>
        <Input
          id="departure"
          name="departure"
          placeholder="KJFK"
          required
          className="bg-slate-800 border-slate-700"
        />
        {weatherData[0]}
      </div>
      <div className="space-y-2">
        <Label htmlFor="arrival">Arrival Airport</Label>
        <Input
          id="arrival"
          name="arrival"
          placeholder="KLAX"
          required
          className="bg-slate-800 border-slate-700"
        />
        {weatherData[1]}
      </div>
      <div className="space-y-2">
        <Label htmlFor="aircraft">Aircraft Type</Label>
        <Input
          id="aircraft"
          name="aircraft"
          defaultValue="Gulfstream 550"
          required
          className="bg-slate-800 border-slate-700"
        />
      </div>
      <div className="space-y-2">
      <Label htmlFor="date">Flight Date</Label>
      <Input
        id="date"
        name="date"
        type="date"
        required
        defaultValue={new Date().toISOString().split("T")[0]} // Set default to today's date
        className="bg-slate-800 border-slate-700"
      />
      </div>
      <div className="space-y-2">
        <Label htmlFor="passengers">Number of Passengers</Label>
        <Input
          id="passengers"
          name="passengers"
          type="number"
          min="0"
          required
          className="bg-slate-800 border-slate-700"
        />
      </div>
      <Button
        type="submit"
        className="w-full bg-blue-600 hover:bg-blue-700"
        disabled={isAnalyzing}
      >
        {isAnalyzing ? "Analyzing..." : "Analyze Flight Plan"}
      </Button>
      {isAnalyzing && (
        <div className="mt-4">
          <ProgressSteps 
            steps={processingSteps.steps}
            currentStep={processingSteps.currentStep}
          />
        </div>
      )}
    </form>
  )
}

