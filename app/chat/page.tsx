"use client"

import { useState, useEffect } from "react"
import { FileUpload } from "@/components/file-upload"
import { ChatInterface } from "@/components/chat-interface"
import { DashboardOverview } from "@/components/dashboard-overview"
import { DataManipulationPanel } from "@/components/data-manipulation-panel"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  BarChart3,
  MessageSquare,
  Upload,
  Zap,
  Trash2,
  Download,
  ArrowLeft,
  LayoutDashboard,
  Edit3,
} from "lucide-react"
import Link from "next/link"

interface CSVData {
  schema: string[]
  rowCount: number
  sample: any[]
  fullData: any[] // Added fullData support for complete dataset
  fileName: string
}

interface Message {
  type: "user" | "bot" | "report"
  message: string
  timestamp: Date
  report?: any
}

export default function ChatPage() {
  // Helper to map report fields to PDF format
  function mapReportForPDF(report: any) {
    if (!report) return null;
    return {
      summary: { title: report.summary?.title, content: report.summary?.description },
      churnAnalysis: { title: report.churnAnalysis?.title, content: report.churnAnalysis?.description },
      financialProjections: { title: report.financialProjections?.title, content: report.financialProjections?.description },
      demandForecasting: { title: report.demandForecasting?.title, content: report.demandForecasting?.description },
      scenarioAnalysis: { title: report.scenarioAnalysis?.title, content: report.scenarioAnalysis?.description },
      recommendations: { title: report.recommendations?.title, content: report.recommendations?.description },
      generatedAt: report.generatedAt,
      fileName: report.fileName,
    };
  }

  // Helper to get language-specific welcome message
  const getWelcomeMessage = (lang: string) => {
    switch (lang) {
      case "hi":
        return "👋 नमस्ते! मैं आपका डेटा असिस्टेंट हूं! CSV फ़ाइल अपलोड करें और मुझसे प्रश्न पूछें जैसे 'किस उत्पाद की पिछले महीने सबसे अधिक बिक्री हुई?' या 'क्षेत्रों में खर्चों की तुलना करें।' मैं विश्लेषण करूंगा और आपको रीयल-टाइम अंतर्दृष्टि दूंगा।\n\n💡 **इस कमांड को आज़माएं:** अपनी CSV फ़ाइल अपलोड करने से पहले सिस्टम का परीक्षण करने के लिए 'show sample data' टाइप करें!";
      case "hi_en":
        return "👋 Hi! मैं आपका Data Assistant हूं! CSV file upload करें और मुझसे questions पूछें जैसे 'Which product had the highest sales last month?' या 'Compare expenses across regions.' मैं analyze करूंगा और आपको real-time insights दूंगा।\n\n💡 **Try this command:** अपनी CSV file upload करने से पहले system test करने के लिए 'show sample data' type करें!";
      default:
        return "👋 Hi! I'm your Data Assistant! Upload a CSV file and ask me questions like 'Which product had the highest sales last month?' or 'Compare expenses across regions.' I'll analyze and give you real-time insights.\n\n💡 **Try this command:** Type 'show sample data' to see example data and test the system before uploading your own CSV file!";
    }
  };

  const [csvData, setCsvData] = useState<CSVData | null>(null)
  const [chatHistory, setChatHistory] = useState<Message[]>([
    {
      type: "bot",
      message: getWelcomeMessage("en"),
      timestamp: new Date(),
    },
  ])
  const [activeTab, setActiveTab] = useState("dashboard")
  const [isGeneratingReport, setIsGeneratingReport] = useState(false)
  const [selectedLanguage, setSelectedLanguage] = useState("en")

  const handleFileUpload = (data: CSVData) => {
    // Get language-specific upload success message
    const getUploadSuccessMessage = (lang: string) => {
      switch (lang) {
        case "hi":
          return `बहुत अच्छा! मैंने आपकी CSV फ़ाइल "${data.fileName}" का विश्लेषण किया है। इसमें ${data.rowCount} पंक्तियां और ${data.schema.length} कॉलम हैं: ${data.schema.join(", ")}। आप अपने डेटा के बारे में क्या जानना चाहते हैं?`;
        case "hi_en":
          return `Great! मैंने आपकी CSV file "${data.fileName}" का analysis किया है। इसमें ${data.rowCount} rows और ${data.schema.length} columns हैं: ${data.schema.join(", ")}। आप अपने data के बारे में क्या जानना चाहते हैं?`;
        default:
          return `Great! I've analyzed your CSV file "${data.fileName}". It has ${data.rowCount} rows and ${data.schema.length} columns: ${data.schema.join(", ")}. What would you like to know about your data?`;
      }
    };

    setCsvData(data)
    setChatHistory((prev) => [
      ...prev,
      {
        type: "bot",
        message: getUploadSuccessMessage(selectedLanguage),
        timestamp: new Date(),
      },
    ])
    setActiveTab("chat") // Switch to chat tab after upload
  }

  const handleDataUpdate = (updatedData: CSVData) => {
    // Get language-specific data update message
    const getDataUpdateMessage = (lang: string) => {
      switch (lang) {
        case "hi":
          return `✅ डेटा अपडेट किया गया! आपके डेटासेट में अब ${updatedData.rowCount} पंक्तियां हैं। परिवर्तन लागू किए गए हैं और विश्लेषण के लिए तैयार हैं।`;
        case "hi_en":
          return `✅ Data updated! आपके dataset में अब ${updatedData.rowCount} rows हैं। Changes apply किए गए हैं और analysis के लिए ready हैं।`;
        default:
          return `✅ Data updated! Your dataset now has ${updatedData.rowCount} rows. The changes have been applied and are ready for analysis.`;
      }
    };

    setCsvData(updatedData)
    setChatHistory((prev) => [
      ...prev,
      {
        type: "bot",
        message: getDataUpdateMessage(selectedLanguage),
        timestamp: new Date(),
      },
    ])
  }

  const handleClearChat = () => {
    const initialMessage: Message = {
      type: "bot",
      message: getWelcomeMessage(selectedLanguage),
      timestamp: new Date(),
    }
  setChatHistory([initialMessage])
  setCsvData(null)
  localStorage.removeItem("chat-csv-history")
  localStorage.removeItem("chat-csv-data")
  }

  const handleExportChat = () => {
    const chatText = chatHistory
      .map((msg) => {
        const time = msg.timestamp.toLocaleString()
        const sender = msg.type === "user" ? "You" : "Data Assistant"
        return `[${time}] ${sender}: ${msg.message}`
      })
      .join("\n\n")

    const blob = new Blob([chatText], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `chat-history-${new Date().toISOString().split("T")[0]}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleShowSampleData = () => {
    const sampleData: CSVData = {
      schema: ["Product", "Category", "Sales", "Region", "Date"],
      rowCount: 15,
      sample: [
        { Product: "Laptop Pro", Category: "Electronics", Sales: 2500, Region: "North", Date: "2024-01-15" },
        { Product: "Wireless Mouse", Category: "Accessories", Sales: 45, Region: "South", Date: "2024-01-16" },
        { Product: "Gaming Keyboard", Category: "Electronics", Sales: 120, Region: "East", Date: "2024-01-17" },
        { Product: "USB Cable", Category: "Accessories", Sales: 12, Region: "West", Date: "2024-01-18" },
        { Product: "Monitor 24\"", Category: "Electronics", Sales: 180, Region: "North", Date: "2024-01-19" }
      ],
      fullData: [
        { Product: "Laptop Pro", Category: "Electronics", Sales: 2500, Region: "North", Date: "2024-01-15" },
        { Product: "Wireless Mouse", Category: "Accessories", Sales: 45, Region: "South", Date: "2024-01-16" },
        { Product: "Gaming Keyboard", Category: "Electronics", Sales: 120, Region: "East", Date: "2024-01-17" },
        { Product: "USB Cable", Category: "Accessories", Sales: 12, Region: "West", Date: "2024-01-18" },
        { Product: "Monitor 24\"", Category: "Electronics", Sales: 180, Region: "North", Date: "2024-01-19" },
        { Product: "Webcam HD", Category: "Electronics", Sales: 85, Region: "South", Date: "2024-01-20" },
        { Product: "Mouse Pad", Category: "Accessories", Sales: 8, Region: "East", Date: "2024-01-21" },
        { Product: "Headphones", Category: "Electronics", Sales: 95, Region: "West", Date: "2024-01-22" },
        { Product: "Power Adapter", Category: "Accessories", Sales: 25, Region: "North", Date: "2024-01-23" },
        { Product: "Tablet Mini", Category: "Electronics", Sales: 320, Region: "South", Date: "2024-01-24" },
        { Product: "Phone Case", Category: "Accessories", Sales: 15, Region: "East", Date: "2024-01-25" },
        { Product: "Bluetooth Speaker", Category: "Electronics", Sales: 75, Region: "West", Date: "2024-01-26" },
        { Product: "Cable Organizer", Category: "Accessories", Sales: 18, Region: "North", Date: "2024-01-27" },
        { Product: "Smart Watch", Category: "Electronics", Sales: 450, Region: "South", Date: "2024-01-28" },
        { Product: "Screen Protector", Category: "Accessories", Sales: 22, Region: "East", Date: "2024-01-29" }
      ],
      fileName: "Sample_Data.csv"
    }
    
    // Get language-specific message
    const getSampleDataMessage = (lang: string) => {
      switch (lang) {
        case "hi":
          return `📊 **सैंपल डेटा लोड किया गया!** मैंने ${sampleData.rowCount} पंक्तियों और ${sampleData.schema.length} कॉलम के साथ सैंपल डेटा लोड किया है: ${sampleData.schema.join(", ")}.\n\nयह सिस्टम का परीक्षण करने में आपकी मदद करने के लिए उदाहरण डेटा है। अब आप ये प्रश्न पूछ सकते हैं:\n• "किस उत्पाद की बिक्री सबसे अधिक है?"\n• "क्षेत्र के अनुसार बिक्री दिखाएं"\n• "औसत बिक्री मूल्य क्या है?"\n• "इलेक्ट्रॉनिक्स बनाम एक्सेसरीज़ बिक्री की तुलना करें"\n\nअपना वास्तविक डेटा विश्लेषण करने के लिए किसी भी समय अपनी CSV फ़ाइल अपलोड करें!`;
        case "hi_en":
          return `📊 **Sample Data Loaded!** मैंने ${sampleData.rowCount} rows और ${sampleData.schema.length} columns के साथ sample data load किया है: ${sampleData.schema.join(", ")}.\n\nयह system test करने में help करने के लिए example data है। अब आप ये questions पूछ सकते हैं:\n• "Which product has the highest sales?"\n• "Show me sales by region"\n• "What's the average sales price?"\n• "Compare electronics vs accessories sales"\n\nअपना real data analyze करने के लिए किसी भी time अपनी CSV file upload करें!`;
        default:
          return `📊 **Sample Data Loaded!** I've loaded sample data with ${sampleData.rowCount} rows and ${sampleData.schema.length} columns: ${sampleData.schema.join(", ")}.\n\nThis is example data to help you test the system. You can now ask questions like:\n• "Which product has the highest sales?"\n• "Show me sales by region"\n• "What's the average sales price?"\n• "Compare electronics vs accessories sales"\n\nUpload your own CSV file anytime to analyze your real data!`;
      }
    };
    
    setCsvData(sampleData)
    setChatHistory((prev) => [
      ...prev,
      {
        type: "bot",
        message: getSampleDataMessage(selectedLanguage),
        timestamp: new Date(),
      },
    ])
    setActiveTab("chat")
  }

  const handleGenerateReport = async () => {
    if (!csvData) return

    setIsGeneratingReport(true)
    try {
      const response = await fetch("/api/generate-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ csvData, language: selectedLanguage }),
      })

      if (!response.ok) {
        throw new Error("Failed to generate report")
      }

      const { report } = await response.json()

      // Get language-specific report success message
      const getReportSuccessMessage = (lang: string) => {
        switch (lang) {
          case "hi":
            return "📊 व्यापक व्यावसायिक रिपोर्ट तैयार की गई";
          case "hi_en":
            return "📊 Comprehensive Business Report Generated";
          default:
            return "📊 Comprehensive Business Report Generated";
        }
      };

      setChatHistory((prev) => [
        ...prev,
        {
          type: "report",
          message: getReportSuccessMessage(selectedLanguage),
          timestamp: new Date(),
          report,
        },
      ])

      setActiveTab("chat")
    } catch (error) {
      console.error("Report generation error:", error)
      // Get language-specific error message
      const getReportErrorMessage = (lang: string) => {
        switch (lang) {
          case "hi":
            return "❌ क्षमा करें, मैं रिपोर्ट तैयार नहीं कर सका। कृपया फिर से प्रयास करें।";
          case "hi_en":
            return "❌ Sorry, मैं report generate नहीं कर सका। Please try again।";
          default:
            return "❌ Sorry, I couldn't generate the report. Please try again.";
        }
      };

      setChatHistory((prev) => [
        ...prev,
        {
          type: "bot",
          message: getReportErrorMessage(selectedLanguage),
          timestamp: new Date(),
        },
      ])
    } finally {
      setIsGeneratingReport(false)
    }
  }

  const reportsGenerated = chatHistory.filter((msg) => msg.type === "report").length
  const messagesCount = chatHistory.filter((msg) => msg.type === "user").length

  useEffect(() => {
    // Reset dashboard state on reload or when dataset is removed
    const savedHistory = localStorage.getItem("chat-csv-history")
    const savedCsvData = localStorage.getItem("chat-csv-data")

    const initialMessage: Message = {
      type: "bot",
      message: getWelcomeMessage(selectedLanguage),
      timestamp: new Date(),
    };

    if (savedCsvData) {
      try {
        setCsvData(JSON.parse(savedCsvData))
      } catch (error) {
        setCsvData({
          schema: [],
          rowCount: 0,
          sample: [],
          fullData: [],
          fileName: "N/A",
        })
        console.error("Failed to load CSV data:", error)
      }
    } else {
      setCsvData({
        schema: [],
        rowCount: 0,
        sample: [],
        fullData: [],
        fileName: "N/A",
      })
    }

    if (savedHistory && savedCsvData) {
      try {
        const parsedHistory = JSON.parse(savedHistory).map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp),
        }))
        setChatHistory(parsedHistory)
      } catch (error) {
        setChatHistory([initialMessage])
        console.error("Failed to load chat history:", error)
      }
    } else {
      setChatHistory([initialMessage])
    }
  }, [])

  useEffect(() => {
    localStorage.setItem("chat-csv-history", JSON.stringify(chatHistory))
  }, [chatHistory])

  useEffect(() => {
    if (csvData) {
      const csvString = JSON.stringify(csvData);
      // Check if data size is less than 4MB (localStorage limit is usually 5MB)
      if (csvString.length < 4 * 1024 * 1024) {
        localStorage.setItem("chat-csv-data", csvString);
      } else {
        console.warn("CSV data too large to store in localStorage. Keeping in memory only.");
      }
    }
  }, [csvData])

  // Update welcome message when language changes
  useEffect(() => {
    if (chatHistory.length === 1 && chatHistory[0].type === "bot") {
      setChatHistory([{
        type: "bot",
        message: getWelcomeMessage(selectedLanguage),
        timestamp: new Date(),
      }]);
    }
  }, [selectedLanguage])

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Home
              </Link>
              <div className="flex items-center gap-2">
                <BarChart3 className="w-6 h-6 text-primary" />
                <span className="text-lg font-serif font-bold">DataChat AI</span>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-6">
              <Link href="/" className="text-foreground hover:text-primary transition-colors">
                Home
              </Link>
              <Link href="/about" className="text-foreground hover:text-primary transition-colors">
                About
              </Link>
              <Link href="/help" className="text-foreground hover:text-primary transition-colors">
                Help
              </Link>
              <Link href="/contact" className="text-foreground hover:text-primary transition-colors">
                Contact
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-serif font-bold text-foreground mb-2">Business Analysis Dashboard</h1>
          <p className="text-muted-foreground text-lg mb-6">
            Upload your CSV and get comprehensive business insights with AI-powered analysis
          </p>
          
          {/* Language Selector */}
          <div className="flex justify-center mb-6">
            <div className="flex items-center gap-2 bg-muted/50 rounded-lg p-2">
              <span className="text-sm text-muted-foreground">Language:</span>
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="border rounded px-3 py-1 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="en">🇺🇸 English</option>
                <option value="hi">🇮🇳 हिंदी (Hindi)</option>
                <option value="hi_en">🇮🇳 Hinglish</option>
              </select>
            </div>
          </div>

          {/* Feature badges */}
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            <Badge variant="secondary" className="flex items-center gap-1">
              <Upload className="w-3 h-3" />
              Easy Upload
            </Badge>
            <Badge variant="secondary" className="flex items-center gap-1">
              <LayoutDashboard className="w-3 h-3" />
              Live Dashboard
            </Badge>
            <Badge variant="secondary" className="flex items-center gap-1">
              <Edit3 className="w-3 h-3" />
              Data Manipulation
            </Badge>
            <Badge variant="secondary" className="flex items-center gap-1">
              <MessageSquare className="w-3 h-3" />
              Natural Chat
            </Badge>
            <Badge variant="secondary" className="flex items-center gap-1">
              <BarChart3 className="w-3 h-3" />
              Smart Analysis
            </Badge>
            <Badge variant="secondary" className="flex items-center gap-1">
              <Zap className="w-3 h-3" />
              Instant Reports
            </Badge>
          </div>
        </div>

        {/* Main Dashboard */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-24">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Upload className="w-5 h-5 text-primary" />
                Upload Data
              </h2>
              <FileUpload onFileUpload={handleFileUpload} />

              {!csvData && (
                <div className="mt-4 p-3 bg-muted/50 rounded-lg border border-dashed border-muted-foreground/20">
                  <h3 className="font-medium text-sm mb-2 text-muted-foreground">No Dataset Uploaded</h3>
                  <p className="text-xs text-muted-foreground mb-3">
                    Upload a CSV file to start analyzing your data, or try the sample data to test the system.
                  </p>
                  <Button
                    onClick={handleShowSampleData}
                    variant="outline"
                    size="sm"
                    className="w-full text-xs"
                  >
                    📊 Try Sample Data
                  </Button>
                </div>
              )}

              {csvData && (
                <div className="mt-4 p-3 bg-muted rounded-lg">
                  <h3 className="font-medium text-sm mb-2">
                    {csvData.fileName === "Sample_Data.csv" ? "Sample Data:" : "File Info:"}
                  </h3>
                  <div className="text-xs text-muted-foreground space-y-1">
                    <p>
                      <strong>Name:</strong> {csvData.fileName === "Sample_Data.csv" ? "Sample Data (Example)" : csvData.fileName}
                    </p>
                    <p>
                      <strong>Rows:</strong> {csvData.rowCount.toLocaleString()}
                    </p>
                    <p>
                      <strong>Columns:</strong> {csvData.schema.length}
                    </p>
                    <p>
                      <strong>Fields:</strong> {csvData.schema.slice(0, 3).join(", ")}
                      {csvData.schema.length > 3 ? "..." : ""}
                    </p>
                  </div>
                  <Button
                    onClick={handleGenerateReport}
                    disabled={isGeneratingReport}
                    className="w-full mt-3"
                    size="sm"
                  >
                    {isGeneratingReport ? (
                      <>
                        <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <BarChart3 className="w-3 h-3 mr-2" />
                        Generate Report
                      </>
                    )}
                  </Button>
                </div>
              )}

              {chatHistory.length > 1 && (
                <div className="mt-4 space-y-2">
                  <h3 className="font-medium text-sm">Management:</h3>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleClearChat}
                      className="flex-1 text-xs bg-transparent"
                    >
                      <Trash2 className="w-3 h-3 mr-1" />
                      Clear
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleExportChat}
                      className="flex-1 text-xs bg-transparent"
                    >
                      <Download className="w-3 h-3 mr-1" />
                      Export
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {reportsGenerated} reports • {messagesCount} messages
                  </p>
                </div>
              )}
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="dashboard" className="flex items-center gap-2">
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </TabsTrigger>
                <TabsTrigger value="manipulate" className="flex items-center gap-2" disabled={!csvData}>
                  <Edit3 className="w-4 h-4" />
                  Data Tools
                </TabsTrigger>
                <TabsTrigger value="chat" className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  Chat Analysis
                </TabsTrigger>
              </TabsList>

              <TabsContent value="dashboard" className="space-y-6">
                <DashboardOverview
                  csvData={csvData}
                  reportsGenerated={reportsGenerated}
                  messagesCount={messagesCount}
                />
              </TabsContent>

              <TabsContent value="manipulate" className="space-y-6">
                {csvData ? (
                  <DataManipulationPanel
                    csvData={csvData}
                    onDataUpdate={handleDataUpdate}
                    onGenerateReport={handleGenerateReport}
                    selectedLanguage={selectedLanguage}
                  />
                ) : (
                  <Card className="p-8 text-center">
                    <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Data Available</h3>
                    <p className="text-muted-foreground">
                      Upload a CSV file to access data manipulation tools including filtering, editing, and analysis
                      features.
                    </p>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="chat" className="space-y-6">
                <div className="mb-4">
                  <h2 className="text-xl font-semibold flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-primary" />
                    AI Data Assistant
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Ask questions about your data in natural language and generate comprehensive business reports
                  </p>
                </div>
                <ChatInterface
                  chatHistory={chatHistory}
                  setChatHistory={setChatHistory}
                  csvData={csvData}
                  onShowSampleData={handleShowSampleData}
                  selectedLanguage={selectedLanguage}
                  setSelectedLanguage={setSelectedLanguage}
                />
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center text-sm text-muted-foreground">
          <p>
            Powered by AI • Secure data processing • Advanced business analytics • PDF reports • Data manipulation tools
          </p>
        </div>
      </div>
    </div>
  )
}
