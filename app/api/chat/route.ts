function isGeneralBusinessQuestion(message: string): boolean {
  const keywords = [
    "start a business",
    "startup",
    "how to start",
    "guide me",
    "business idea",
    "business plan",
    "funding",
    "marketing",
    "manufacturing",
    "sales",
    "customer service",
    "legal structure",
    "operations",
    "production",
    "inventory",
    "financial management",
    "accounting",
    "forecasting",
    "mentor",
    "advice",
    "industry",
    "market research",
    "product development",
    "USP",
    "supplier",
    "retail",
    "wholesale",
    "online store",
    "brand loyalty",
    "repeat business"
  ];
  return keywords.some((kw) => message.toLowerCase().includes(kw));
}
import { type NextRequest, NextResponse } from "next/server"

interface CSVData {
  schema: string[]
  rowCount: number
  sample: any[]
  fileName: string
}

interface Message {
  type: "user" | "bot"
  message: string
  timestamp: Date
}

interface ChatRequest {
  message: string
  csvData: CSVData | null
  chatHistory: Message[]
  language: string
}

function sanitizeOutput(text: string): string {
  return text
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, "")
    .replace(/javascript:/gi, "")
    .replace(/on\w+\s*=/gi, "")
    .trim()
}

export async function POST(request: NextRequest) {
  try {
    const chatRequest: ChatRequest = await request.json();
    const { message: userMessage, csvData, chatHistory, language } = chatRequest;

    if (!userMessage?.trim()) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    // If the question is general business/startup advice, answer even if dataset is missing or irrelevant
    const isGeneral = isGeneralBusinessQuestion(userMessage);

    // Language-specific instructions
    const getLanguageInstructions = (lang: string) => {
      switch (lang) {
        case "hi":
          return "IMPORTANT: Respond ONLY in Hindi (हिंदी). Use Devanagari script and provide all analysis, insights, and recommendations in Hindi. If you need to use English terms for business concepts, provide Hindi translations or explanations.";
        case "hi_en":
          return "IMPORTANT: Respond in Hinglish - a mix of Hindi and English. Use both Hindi (Devanagari script) and English words naturally. This is common in Indian business communication. Provide analysis, insights, and recommendations in this mixed language style.";
        case "en":
        default:
          return "IMPORTANT: Respond in English. Provide all analysis, insights, and recommendations in clear, professional English.";
      }
    };

    const languageInstruction = getLanguageInstructions(language);

    const systemInstruction = isGeneral
      ? `You are a professional business advisor and startup mentor. Your role is to:

1. Guide users step-by-step in starting and growing a business, even if no dataset is provided.
2. Provide clear, actionable advice in simple language.
3. Cover topics such as market research, product development, business planning, funding, legal structure, operations, marketing, sales, customer service, and financial management.
4. Offer practical tips, common pitfalls, and best practices for new entrepreneurs.
5. If the user asks about a specific industry (e.g., footwear), tailor your advice to that field.

Always be supportive, accurate, and focus on business success. If the user uploads a dataset, use it for analysis; otherwise, provide general guidance.

${languageInstruction}`
      : `You are a professional business data analyst and AI assistant. Your role is to:

1. Analyze CSV business data (sales, customers, revenue, expenses, churn, etc.)
2. Provide clear, actionable insights in simple language
3. Suggest specific business strategies and recommendations
4. Identify trends, patterns, and opportunities in the data
5. Offer quantitative analysis with numbers and percentages when possible

Always be professional, accurate, and focus on business value. If asked about generating reports, mention that comprehensive business reports can be generated separately.

Key areas to focus on:
- Revenue and profit analysis
- Customer behavior and churn patterns
- Sales performance and trends
- Cost optimization opportunities
- Growth forecasting and predictions
- Risk assessment and mitigation

${languageInstruction}`

    let csvContext = ""
    if (csvData) {
      csvContext = `
BUSINESS DATASET CONTEXT:
- File: ${csvData.fileName}
- Total Records: ${csvData.rowCount}
- Data Fields (${csvData.schema.length}): ${csvData.schema.join(", ")}

Sample Business Data (${csvData.sample.length} rows analyzed):
${csvData.sample.map((row, index) => `Record ${index + 1}: ${JSON.stringify(row)}`).join("\n")}

ANALYSIS SCOPE: This analysis covers ${csvData.sample.length} sample records from a total dataset of ${csvData.rowCount} records. Insights are extrapolated to represent the full dataset where applicable.`
    } else {
      csvContext =
        isGeneral
          ? "No business data uploaded. You can still ask for business advice, startup guidance, or industry-specific tips."
          : "No business data uploaded yet. Please upload a CSV file containing your business data (sales, customers, revenue, etc.) to begin analysis."
    }

    // Limit to last 10 messages to manage token usage while maintaining context
    const recentHistory = chatHistory.slice(-10).filter((msg) => msg.type === "user" || msg.type === "bot")
    const historyContext =
      recentHistory.length > 0
        ? `\nRecent conversation:\n${recentHistory
            .map((msg) => `${msg.type === "user" ? "User" : "Assistant"}: ${msg.message}`)
            .join("\n")}\n`
        : ""

    // Construct the full prompt
    const fullPrompt = `${systemInstruction}
Current user question: ${userMessage}
${csvContext}
${historyContext}

IMPORTANT LANGUAGE REQUIREMENT: The user has selected "${language}" as their preferred language. Please ensure your response is in the appropriate language:
- For "en": Respond in English
- For "hi": Respond ONLY in Hindi (हिंदी) using Devanagari script
- For "hi_en": Respond in Hinglish (mix of Hindi and English)

Please provide a helpful, clear response based on the available data. If the question requires analysis of specific data that isn't in the sample, mention that the analysis is limited to the sample data shown. If the user asks for general business advice, answer fully even if no dataset is provided.`

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=AIzaSyDMaMEBq6Y3P68jSiVHq2Be8x8seI9AT8k",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: fullPrompt,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 1000,
          },
        }),
      },
    )

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error("Gemini API Error:", response.status, errorData)

      if (response.status === 429) {
        return NextResponse.json({ error: "AI service quota exceeded. Please try again later." }, { status: 429 })
      }
      if (response.status === 401 || response.status === 403) {
        return NextResponse.json({ error: "AI service configuration error. Please check API key." }, { status: 500 })
      }

      return NextResponse.json({ error: "Failed to get response from AI service." }, { status: 500 })
    }

    const data = await response.json()
    let text = data.candidates?.[0]?.content?.parts?.[0]?.text || "Sorry, I couldn't generate a response."

    text = sanitizeOutput(text)

    return NextResponse.json({ response: text })
  } catch (error) {
    console.error("Chat API Error:", error)

    // Handle specific API errors
    if (error instanceof Error) {
      if (error.message.includes("fetch")) {
        return NextResponse.json(
          { error: "Network error. Please check your connection and try again." },
          { status: 500 },
        )
      }
    }

    return NextResponse.json({ error: "Failed to process your request. Please try again." }, { status: 500 })
  }
}
