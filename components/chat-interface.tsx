import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Bot, Send, User, Book } from "lucide-react"
import { useState } from "react"
import { type ChatResponse } from "@/lib/api-service"
import ReactMarkdown from 'react-markdown';
import { ProgressSteps } from "@/components/ui/progress-steps"
import { Tooltip, TooltipContent, TooltipTrigger , TooltipProvider} from "@/components/ui/tooltip";

interface Message {
  role: "user" | "assistant"
  content: string
  regulations?: any[]
}

interface ChatInterfaceProps {
  onSendMessage: (message: string) => Promise<ChatResponse>
}

export function ChatInterface({ onSendMessage }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hello! I'm your FAA regulations assistant. I can help you understand Part 135 regulations and answer any questions you have about flight compliance. How can I help you today?"
    }
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [processingSteps, setProcessingSteps] = useState<{
    steps: { label: string; status: "pending" | "loading" | "complete" }[];
    currentStep: number;
  }>({
    steps: [
      { label: "Finding relevant regulations", status: "pending" },
      { label: "Analyzing context", status: "pending" },
      { label: "Generating response", status: "pending" }
    ],
    currentStep: -1
  })

  const handleSend = async () => {
    if (!input.trim() || isLoading) return

    const userMessage = input.trim()
    setInput("")
    setIsLoading(true)

    // Reset progress steps
    setProcessingSteps({
      steps: [
        { label: "Finding relevant regulations", status: "loading" },
        { label: "Analyzing context", status: "pending" },
        { label: "Generating response", status: "pending" }
      ],
      currentStep: 0
    })

    // Add user message immediately
    setMessages(prev => [...prev, { role: "user", content: userMessage }])

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

      setTimeout(() => {
        setProcessingSteps(prev => ({
          steps: prev.steps.map((step, i) => ({
            ...step,
            status: i === 2 ? "loading" : "complete"
          })),
          currentStep: 2
        }))
      }, 2000)

      const response = await onSendMessage(userMessage)
      
      // Complete all steps
      setProcessingSteps(prev => ({
        steps: prev.steps.map(step => ({ ...step, status: "complete" })),
        currentStep: prev.steps.length - 1
      }))

      // Add assistant response with regulations
      setMessages(prev => [...prev, { 
        role: "assistant", 
        content: response.response,
        regulations: response.regulations_used[0]
      }])
    } catch (error) {
      console.error("Error sending message:", error)
      setMessages(prev => [...prev, { 
        role: "assistant", 
        content: "I apologize, but I encountered an error processing your request. Please try again." 
      }])
    } finally {
      setIsLoading(false)
      // Reset progress after a delay
      setTimeout(() => {
        setProcessingSteps({
          steps: [
            { label: "Finding relevant regulations", status: "pending" },
            { label: "Analyzing context", status: "pending" },
            { label: "Generating response", status: "pending" }
          ],
          currentStep: -1
        })
      }, 1000)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <Card className="bg-slate-900 border-slate-800">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bot className="h-5 w-5 text-blue-400" />
          Compliance Assistant
        </CardTitle>
        <CardDescription className="text-slate-400">
          Ask questions about FAA Part 135 regulations and compliance requirements
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col h-[500px]">
          <ScrollArea className="flex-1 pr-4">
            <div className="space-y-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex items-start gap-3 ${
                    message.role === "assistant" ? "flex-row" : "flex-row-reverse"
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      message.role === "assistant"
                        ? "bg-blue-500/20 text-blue-500"
                        : "bg-slate-500/20 text-slate-500"
                    }`}
                  >
                    {message.role === "assistant" ? (
                      <Bot className="h-5 w-5" />
                    ) : (
                      <User className="h-5 w-5" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div
                      className={`rounded-lg px-4 py-2 ${
                        message.role === "assistant"
                          ? "bg-slate-800/50 border border-slate-800"
                          : "bg-blue-600/20 border border-blue-800"
                      }`}
                    >
                      <div className="text-sm whitespace-pre-wrap">
                      <ReactMarkdown>
                        
                        {message.content}
                      </ReactMarkdown>
                      </div>
                    </div>
                    {message.regulations && message.regulations.length > 0 && (
                      <TooltipProvider>
                      <div className="mt-2 flex flex-wrap gap-2">
                        <div className="flex items-center text-xs text-slate-400">
                          <Book className="h-3 w-3 mr-1" />
                          Referenced sections:
                        </div>
                        {message.regulations.map((reg, idx) => (
                          <Tooltip key={idx}>
                            <TooltipTrigger asChild>
                              <Badge
                                variant="outline"
                                className="text-xs bg-slate-800/50 border-slate-700"
                              >
                                {reg?.id} {reg?.title}
                              </Badge>
                            </TooltipTrigger>
                            <TooltipContent side="top" className="max-w-xs text-xs p-2">
                              {reg?.content.slice(0,200)}...
                            </TooltipContent>
                          </Tooltip>
                        ))}
                      </div>
                      </TooltipProvider>
                    )}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-500 flex items-center justify-center">
                    <Bot className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <div className="rounded-lg px-4 py-2 bg-slate-800/50 border border-slate-800">
                      <ProgressSteps 
                        steps={processingSteps.steps}
                        currentStep={processingSteps.currentStep}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
          <div className="mt-4 flex gap-2">
            <Input
              placeholder="Ask about FAA regulations..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isLoading}
              className="bg-slate-800 border-slate-700 text-white"
            />
            <Button
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 