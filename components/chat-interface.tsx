"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Send, Bot, User, Loader2, AlertCircle, FileText, BarChart3 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { BusinessReport } from "./business-report"
import { cn } from "@/lib/utils"

interface Message {
  type: "user" | "bot" | "report"
  message: string
  timestamp: Date
  report?: any
}

interface CSVData {
  schema: string[]
  rowCount: number
  sample: any[]
  fileName: string
}

interface ChatInterfaceProps {
  chatHistory: Message[]
  setChatHistory: React.Dispatch<React.SetStateAction<Message[]>>
  csvData: CSVData | null
  onShowSampleData?: () => void
  selectedLanguage: string
  setSelectedLanguage: (language: string) => void
}

export function ChatInterface({ chatHistory, setChatHistory, csvData, onShowSampleData, selectedLanguage, setSelectedLanguage }: ChatInterfaceProps) {
  const [inputMessage, setInputMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isGeneratingReport, setIsGeneratingReport] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const [streamingMessage, setStreamingMessage] = useState("")

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      const scrollElement = scrollAreaRef.current
      scrollElement.scrollTop = scrollElement.scrollHeight
    }
  }

  useEffect(() => {
    scrollToBottom()
  }, [chatHistory, streamingMessage])

  const sanitizeMessage = (message: string): string => {
    return message
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, "")
      .replace(/javascript:/gi, "")
      .replace(/on\w+\s*=/gi, "")
      .replace(/\*\*(.*?)\*\*/g, "$1") // Remove markdown bold
      .replace(/\*(.*?)\*/g, "$1") // Remove markdown italic
      .replace(/#{1,6}\s/g, "") // Remove markdown headers
      .trim()
  }

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return

    // Check for special commands
    const message = inputMessage.trim().toLowerCase()
    if (message.includes('show sample data') || message.includes('sample data') || message.includes('example data')) {
      if (onShowSampleData) {
        onShowSampleData()
        setInputMessage("")
        return
      }
    }

    const userMessage: Message = {
      type: "user",
      message: inputMessage.trim(),
      timestamp: new Date(),
    }

    setChatHistory((prev) => [...prev, userMessage])
    setInputMessage("")
    setIsLoading(true)
    setError(null)

    setTimeout(scrollToBottom, 100)

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: inputMessage.trim(),
          csvData,
          chatHistory,
          language: selectedLanguage,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || `HTTP ${response.status}: Failed to get response`)
      }

      const sanitizedResponse = sanitizeMessage(data.response)

      setStreamingMessage("")
      const words = sanitizedResponse.split(" ")

      for (let i = 0; i < words.length; i++) {
        await new Promise((resolve) => setTimeout(resolve, 50))
        setStreamingMessage(words.slice(0, i + 1).join(" "))
        scrollToBottom()
      }

      const botMessage: Message = {
        type: "bot",
        message: sanitizedResponse,
        timestamp: new Date(),
      }

      setChatHistory((prev) => [...prev, botMessage])
      setStreamingMessage("")
    } catch (error) {
      console.error("Chat error:", error)
      const errorMsg = error instanceof Error ? error.message : "Unknown error occurred"
      setError(errorMsg)

      // Get language-specific error message
      const getErrorMessage = (lang: string) => {
        switch (lang) {
          case "hi":
            return "क्षमा करें, आपके अनुरोध को संसाधित करते समय मुझे एक त्रुटि का सामना करना पड़ा। कृपया फिर से प्रयास करें।";
          case "hi_en":
            return "Sorry, आपके request को process करते time मुझे error का सामना करना पड़ा। Please try again।";
          default:
            return "Sorry, I encountered an error while processing your request. Please try again.";
        }
      };

      const errorMessage: Message = {
        type: "bot",
        message: getErrorMessage(selectedLanguage),
        timestamp: new Date(),
      }
      setChatHistory((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
      inputRef.current?.focus()
    }
  }

  const handleGenerateReport = async () => {
    if (!csvData || isGeneratingReport) return

    setIsGeneratingReport(true)
    setError(null)

    try {
      const response = await fetch("/api/generate-report", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          csvData,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate business report")
      }

      const reportMessage: Message = {
        type: "report",
        message: "Comprehensive Business Analysis Report Generated",
        timestamp: new Date(),
        report: data.report,
      }

      setChatHistory((prev) => [...prev, reportMessage])

      const botMessage: Message = {
        type: "bot",
        message:
          "I've generated a comprehensive business analysis report based on your data. The report includes churn analysis, financial projections, demand forecasting, scenario analysis, and strategic recommendations. You can download it as a PDF using the button in the report.",
        timestamp: new Date(),
      }

      setChatHistory((prev) => [...prev, botMessage])
    } catch (error) {
      console.error("Report generation error:", error)
      const errorMsg = error instanceof Error ? error.message : "Failed to generate report"
      setError(errorMsg)

      const errorMessage: Message = {
        type: "bot",
        message:
          "Sorry, I couldn't generate the business report. Please try again or check if your data contains the necessary business metrics.",
        timestamp: new Date(),
      }
      setChatHistory((prev) => [...prev, errorMessage])
    } finally {
      setIsGeneratingReport(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className="space-y-4">
      {error && (
        <Alert variant="destructive" className="animate-in slide-in-from-top duration-300">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {csvData && (
        <div className="flex justify-center animate-in slide-in-from-top duration-500">
          <Button
            onClick={handleGenerateReport}
            disabled={isGeneratingReport}
            className="bg-secondary hover:bg-secondary/90 text-secondary-foreground transition-all duration-300 hover:scale-105 hover:shadow-lg"
            size="lg"
          >
            {isGeneratingReport ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating Report...
              </>
            ) : (
              <>
                <FileText className="w-4 h-4 mr-2" />
                Generate Business Report
              </>
            )}
          </Button>
        </div>
      )}

      <Card className="flex flex-col h-[600px] transition-all duration-300 hover:shadow-lg">
        {/* Chat Messages */}
        <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
          <div className="space-y-4">
            {chatHistory.map((msg, index) => (
              <div
                key={index}
                className="animate-in slide-in-from-bottom duration-500"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {msg.type === "report" ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-center">
                      <Badge variant="secondary" className="flex items-center gap-2 px-4 py-2">
                        <BarChart3 className="w-4 h-4" />
                        {msg.message}
                        <span className="text-xs opacity-70">
                          {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </Badge>
                    </div>
                    {msg.report && <BusinessReport report={msg.report} />}
                  </div>
                ) : (
                  <div className={cn("flex gap-3", msg.type === "user" ? "justify-end" : "justify-start")}>
                    {msg.type === "bot" && (
                      <div className="flex-shrink-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-lg">
                        <Bot className="w-4 h-4 text-primary-foreground" />
                      </div>
                    )}

                    <div
                      className={cn(
                        "max-w-[80%] rounded-lg px-4 py-2 text-sm transition-all duration-300 hover:scale-[1.02] hover:shadow-md",
                        msg.type === "user"
                          ? "bg-primary text-primary-foreground ml-auto"
                          : "bg-muted text-muted-foreground",
                      )}
                    >
                      <div className="whitespace-pre-wrap leading-relaxed">
                        {msg.message.split("\n").map((line, lineIndex) => (
                          <div key={lineIndex} className={line.startsWith("•") || line.startsWith("-") ? "ml-2" : ""}>
                            {line}
                          </div>
                        ))}
                      </div>
                      <p className="text-xs opacity-70 mt-2 transition-opacity duration-300 hover:opacity-100">
                        {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>

                    {msg.type === "user" && (
                      <div className="flex-shrink-0 w-8 h-8 bg-secondary rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-lg">
                        <User className="w-4 h-4 text-secondary-foreground" />
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}

            {(isLoading || isGeneratingReport || streamingMessage) && (
              <div className="flex gap-3 justify-start animate-in slide-in-from-bottom duration-300">
                <div className="flex-shrink-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                  <Bot className="w-4 h-4 text-primary-foreground" />
                </div>
                <div className="bg-muted rounded-lg px-4 py-2 text-sm max-w-[80%]">
                  {streamingMessage ? (
                    <div className="whitespace-pre-wrap leading-relaxed">
                      {streamingMessage}
                      <span className="animate-pulse">|</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="text-muted-foreground">
                        {isGeneratingReport 
                          ? selectedLanguage === "hi"
                            ? "व्यापक व्यावसायिक रिपोर्ट तैयार कर रहा हूं..."
                            : selectedLanguage === "hi_en"
                            ? "Comprehensive business report generate कर रहा हूं..."
                            : "Generating comprehensive business report..."
                          : selectedLanguage === "hi"
                          ? "आपके डेटा का विश्लेषण कर रहा हूं..."
                          : selectedLanguage === "hi_en"
                          ? "आपके data का analysis कर रहा हूं..."
                          : "Analyzing your data..."
                        }
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="border-t p-4 bg-muted/20">
          <div className="flex gap-2 items-center">
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="border rounded px-2 py-1 text-xs bg-muted/40 focus:outline-none focus:ring-2 focus:ring-primary"
              style={{ minWidth: 110 }}
              disabled={isLoading || isGeneratingReport}
            >
              <option value="en">English</option>
              <option value="hi">Hindi</option>
              <option value="hi_en">Hinglish</option>
            </select>
            <Input
              ref={inputRef}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={
                csvData 
                  ? selectedLanguage === "hi" 
                    ? "अपने डेटा के बारे में कुछ भी पूछें..." 
                    : selectedLanguage === "hi_en"
                    ? "अपने data के बारे में कुछ भी पूछें..."
                    : "Ask me anything about your data..."
                  : selectedLanguage === "hi"
                  ? "चैटिंग शुरू करने के लिए पहले CSV फ़ाइल अपलोड करें..."
                  : selectedLanguage === "hi_en"
                  ? "Chatting start करने के लिए पहले CSV file upload करें..."
                  : "Upload a CSV file first to start chatting..."
              }
              disabled={!csvData || isLoading || isGeneratingReport}
              className="flex-1 transition-all duration-300 focus:ring-2 focus:ring-primary/20 focus:scale-[1.02]"
            />
            <Button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || !csvData || isLoading || isGeneratingReport}
              size="icon"
              className="transition-all duration-300 hover:scale-110 hover:shadow-lg active:scale-95 disabled:hover:scale-100"
            >
              <Send className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5" />
            </Button>
          </div>

          {csvData && (
            <div className="mt-2 flex items-center justify-between">
              <div className="text-xs text-muted-foreground animate-in slide-in-from-bottom duration-500 delay-200">
                {selectedLanguage === "hi"
                  ? `विश्लेषण: ${csvData.fileName} (${csvData.rowCount} पंक्तियां, ${csvData.schema.length} कॉलम)`
                  : selectedLanguage === "hi_en"
                  ? `Analysis: ${csvData.fileName} (${csvData.rowCount} rows, ${csvData.schema.length} columns)`
                  : `Analyzing: ${csvData.fileName} (${csvData.rowCount} rows, ${csvData.schema.length} columns)`
                }
              </div>
              <Badge variant="outline" className="text-xs">
                {selectedLanguage === "hi"
                  ? "व्यावसायिक विश्लेषण तैयार"
                  : selectedLanguage === "hi_en"
                  ? "Business Analysis Ready"
                  : "Business Analysis Ready"
                }
              </Badge>
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}
