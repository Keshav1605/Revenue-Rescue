"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { TrendingUp, TrendingDown, Users, DollarSign, BarChart3, FileText, Clock, CheckCircle } from "lucide-react"
import { BusinessChart } from "./business-chart"

interface CSVData {
  schema: string[]
  rowCount: number
  sample: any[]
  fullData: any[] // Added full dataset support
  fileName: string
}

interface DashboardOverviewProps {
  csvData: CSVData | null
  reportsGenerated: number
  messagesCount: number
}

export function DashboardOverview({ csvData, reportsGenerated, messagesCount }: DashboardOverviewProps) {
  const generateRealMetrics = () => {
    if (!csvData || !csvData.fullData || csvData.fullData.length === 0) return null

    const fullData = csvData.fullData
    const schema = csvData.schema

    // Calculate actual revenue metrics
    const revenueColumns = schema.filter(
      (col) =>
        col.toLowerCase().includes("revenue") ||
        col.toLowerCase().includes("sales") ||
        col.toLowerCase().includes("total") ||
        col.toLowerCase().includes("amount") ||
        col.toLowerCase().includes("charges"),
    )

    let totalRevenue = 0
    let monthlyRevenue = 0
    let avgRevenuePerCustomer = 0

    if (revenueColumns.length > 0) {
      const revenueCol = revenueColumns[0]
      const revenues = fullData
        .map((row) => {
          const val = String(row[revenueCol]).replace(/[^0-9.-]/g, "")
          return Number.parseFloat(val) || 0
        })
        .filter((val) => val > 0)

      totalRevenue = revenues.reduce((sum, val) => sum + val, 0)
      avgRevenuePerCustomer = totalRevenue / revenues.length

      // Estimate monthly revenue (assuming data represents monthly charges)
      const monthlyCol = schema.find((col) => col.toLowerCase().includes("monthly"))
      if (monthlyCol) {
        const monthlyCharges = fullData.map((row) => {
          const val = String(row[monthlyCol]).replace(/[^0-9.-]/g, "")
          return Number.parseFloat(val) || 0
        })
        monthlyRevenue = monthlyCharges.reduce((sum, val) => sum + val, 0)
      } else {
        monthlyRevenue = totalRevenue * 0.1 // Estimate
      }
    }

    // Calculate churn metrics
    const churnColumns = schema.filter(
      (col) =>
        col.toLowerCase().includes("churn") ||
        col.toLowerCase().includes("status") ||
        col.toLowerCase().includes("active"),
    )

    let churnRate = 0
    let churnedCustomers = 0
    let activeCustomers = fullData.length

    if (churnColumns.length > 0) {
      const churnCol = churnColumns[0]
      churnedCustomers = fullData.filter((row) => {
        const val = String(row[churnCol]).toLowerCase()
        return val.includes("yes") || val.includes("churn") || val.includes("inactive") || val === "1"
      }).length

      churnRate = (churnedCustomers / fullData.length) * 100
      activeCustomers = fullData.length - churnedCustomers
    }

    // Calculate customer lifetime value
    const tenureColumns = schema.filter(
      (col) =>
        col.toLowerCase().includes("tenure") ||
        col.toLowerCase().includes("months") ||
        col.toLowerCase().includes("years"),
    )

    let avgTenure = 12 // Default
    if (tenureColumns.length > 0) {
      const tenureCol = tenureColumns[0]
      const tenures = fullData
        .map((row) => {
          const val = Number.parseFloat(String(row[tenureCol])) || 0
          return val
        })
        .filter((val) => val > 0)

      if (tenures.length > 0) {
        avgTenure = tenures.reduce((sum, val) => sum + val, 0) / tenures.length
      }
    }

    const customerLifetimeValue = avgRevenuePerCustomer * avgTenure

    return {
      totalRevenue: totalRevenue > 0 ? `$${totalRevenue.toLocaleString()}` : "N/A",
      monthlyRevenue: monthlyRevenue > 0 ? `$${monthlyRevenue.toLocaleString()}` : "N/A",
      growthRate: totalRevenue > 0 ? `${((monthlyRevenue / totalRevenue) * 100).toFixed(1)}%` : "N/A",
      customerCount: fullData.length,
      activeCustomers,
      churnedCustomers,
      churnRate: `${churnRate.toFixed(1)}%`,
      avgRevenuePerCustomer: avgRevenuePerCustomer > 0 ? `$${avgRevenuePerCustomer.toFixed(2)}` : "N/A",
      customerLifetimeValue: customerLifetimeValue > 0 ? `$${customerLifetimeValue.toFixed(2)}` : "N/A",
      avgTenure: `${avgTenure.toFixed(1)} months`,
      dataHealth: Math.floor((fullData.length / (fullData.length + Math.max(100, fullData.length * 0.05))) * 100),
    }
  }

  const generateMockMetrics = () => {
    if (!csvData) return null

    const fullData = csvData.fullData || []

    const hasRevenueData = csvData.schema.some(
      (col) =>
        col.toLowerCase().includes("revenue") ||
        col.toLowerCase().includes("sales") ||
        col.toLowerCase().includes("amount") ||
        col.toLowerCase().includes("price"),
    )

    const hasCustomerData = csvData.schema.some(
      (col) =>
        col.toLowerCase().includes("customer") ||
        col.toLowerCase().includes("user") ||
        col.toLowerCase().includes("client"),
    )

    const hasChurnData = csvData.schema.some(
      (col) =>
        col.toLowerCase().includes("churn") ||
        col.toLowerCase().includes("status") ||
        col.toLowerCase().includes("active"),
    )

    // Calculate real metrics from full dataset
    let totalRevenue = "N/A"
    let churnRate = "N/A"
    const customerCount = csvData.rowCount

    if (hasRevenueData && fullData.length > 0) {
      const revenueColumn = csvData.schema.find(
        (col) =>
          col.toLowerCase().includes("revenue") ||
          col.toLowerCase().includes("sales") ||
          col.toLowerCase().includes("amount"),
      )
      if (revenueColumn) {
        const revenues = fullData
          .map((row) => Number.parseFloat(String(row[revenueColumn]).replace(/[^0-9.-]/g, "")))
          .filter((val) => !isNaN(val))
        const sum = revenues.reduce((acc, val) => acc + val, 0)
        totalRevenue = "$" + sum.toLocaleString()
      }
    }

    if (hasChurnData && fullData.length > 0) {
      const churnColumn = csvData.schema.find(
        (col) => col.toLowerCase().includes("churn") || col.toLowerCase().includes("status"),
      )
      if (churnColumn) {
        const churnedCount = fullData.filter((row) => {
          const value = String(row[churnColumn]).toLowerCase()
          return value.includes("churn") || value.includes("inactive") || value === "yes" || value === "1"
        }).length
        churnRate = ((churnedCount / fullData.length) * 100).toFixed(1) + "%"
      }
    }

    return {
      totalRevenue,
      growthRate: hasRevenueData ? (Math.random() * 20 + 5).toFixed(1) + "%" : "N/A",
      customerCount: hasCustomerData ? customerCount : csvData.rowCount,
      churnRate,
      dataHealth: Math.floor((csvData.rowCount / (csvData.rowCount + Math.max(100, csvData.rowCount * 0.1))) * 100),
    }
  }

  const metrics = csvData?.fullData ? generateRealMetrics() : generateMockMetrics()

  if (!csvData) {
    return (
      <Card className="col-span-full">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <BarChart3 className="w-16 h-16 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Data Uploaded</h3>
          <p className="text-muted-foreground text-center mb-4">
            Upload a CSV file to see your business analytics dashboard with key metrics and insights.
          </p>
          <p className="text-sm text-muted-foreground text-center">
            💡 <strong>Tip:</strong> Type "show sample data" in the chat to test the system with example data!
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Key Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="hover:shadow-lg transition-all duration-300 hover:scale-105">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground font-medium">Total Revenue</p>
                <p className="text-lg font-bold text-foreground">{metrics?.totalRevenue}</p>
              </div>
              <div className="p-2 bg-green-100 rounded-full">
                <DollarSign className="w-4 h-4 text-green-600" />
              </div>
            </div>
            <div className="flex items-center gap-1 mt-2">
              <TrendingUp className="w-3 h-3 text-green-500" />
              <span className="text-xs text-green-600 font-medium">Monthly: {metrics?.monthlyRevenue}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-300 hover:scale-105">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground font-medium">Active Customers</p>
                <p className="text-lg font-bold text-foreground">
                  {metrics?.activeCustomers?.toLocaleString() || metrics?.customerCount?.toLocaleString()}
                </p>
              </div>
              <div className="p-2 bg-blue-100 rounded-full">
                <Users className="w-4 h-4 text-blue-600" />
              </div>
            </div>
            <div className="flex items-center gap-1 mt-2">
              <TrendingDown className="w-3 h-3 text-red-500" />
              <span className="text-xs text-red-600 font-medium">{metrics?.churnRate} churn</span>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-300 hover:scale-105">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground font-medium">Avg Revenue/Customer</p>
                <p className="text-lg font-bold text-foreground">{metrics?.avgRevenuePerCustomer || "N/A"}</p>
              </div>
              <div className="p-2 bg-primary/10 rounded-full">
                <BarChart3 className="w-4 h-4 text-primary" />
              </div>
            </div>
            <div className="flex items-center gap-1 mt-2">
              <span className="text-xs text-muted-foreground">CLV: {metrics?.customerLifetimeValue || "N/A"}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-300 hover:scale-105">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground font-medium">Data Health</p>
                <p className="text-lg font-bold text-foreground">{metrics?.dataHealth}%</p>
              </div>
              <div className="p-2 bg-secondary/10 rounded-full">
                <FileText className="w-4 h-4 text-secondary" />
              </div>
            </div>
            <Progress value={metrics?.dataHealth} className="h-1 mt-2" />
          </CardContent>
        </Card>
      </div>

      {csvData?.fullData && (
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="hover:shadow-lg transition-all duration-300">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-600" />
                Revenue Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Total Revenue</span>
                  <span className="font-bold text-green-600">{metrics?.totalRevenue}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Monthly Revenue</span>
                  <span className="font-medium">{metrics?.monthlyRevenue}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Avg per Customer</span>
                  <span className="font-medium">{metrics?.avgRevenuePerCustomer}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-300">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" />
                Customer Metrics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Total Customers</span>
                  <span className="font-bold">{metrics?.customerCount?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Active</span>
                  <span className="font-medium text-green-600">{metrics?.activeCustomers?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Churned</span>
                  <span className="font-medium text-red-600">{metrics?.churnedCustomers?.toLocaleString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-300">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-purple-600" />
                Business Health
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Churn Rate</span>
                  <span className="font-bold text-red-600">{metrics?.churnRate}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Avg Tenure</span>
                  <span className="font-medium">{metrics?.avgTenure}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Customer LTV</span>
                  <span className="font-medium text-green-600">{metrics?.customerLifetimeValue}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Data Overview */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="hover:shadow-lg transition-all duration-300">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary" />
              Dataset Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">File Name</span>
                <Badge variant={csvData.fileName === "Sample_Data.csv" ? "secondary" : "outline"}>
                  {csvData.fileName === "Sample_Data.csv" ? "Sample Data" : csvData.fileName}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Total Rows</span>
                <span className="font-medium">{csvData.rowCount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Columns</span>
                <span className="font-medium">{csvData.schema.length}</span>
              </div>
              <div className="mt-4">
                <p className="text-sm text-muted-foreground mb-2">
                  {csvData.fileName === "Sample_Data.csv" ? "Sample Fields:" : "Key Fields:"}
                </p>
                <div className="flex flex-wrap gap-1">
                  {csvData.schema.slice(0, 6).map((field, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {field}
                    </Badge>
                  ))}
                  {csvData.schema.length > 6 && (
                    <Badge variant="outline" className="text-xs">
                      +{csvData.schema.length - 6} more
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-300">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="w-5 h-5 text-secondary" />
              Analysis Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Data uploaded</p>
                  <p className="text-xs text-muted-foreground">Ready for analysis</p>
                </div>
                <CheckCircle className="w-4 h-4 text-green-500" />
              </div>

              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-secondary rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Chat messages</p>
                  <p className="text-xs text-muted-foreground">{messagesCount} interactions</p>
                </div>
                <Badge variant="outline" className="text-xs">
                  {messagesCount}
                </Badge>
              </div>

              <div className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${reportsGenerated > 0 ? "bg-green-500" : "bg-gray-300"}`}></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Reports generated</p>
                  <p className="text-xs text-muted-foreground">Business analysis reports</p>
                </div>
                <Badge variant={reportsGenerated > 0 ? "default" : "outline"} className="text-xs">
                  {reportsGenerated}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Insights Chart */}
      <Card className="hover:shadow-lg transition-all duration-300">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            Quick Insights Preview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <BusinessChart
            title="Data Distribution Overview"
            type="bar"
            data={[
              { category: "Records", value: Math.min(csvData.rowCount, 10000), color: "#0891b2" },
              { category: "Fields", value: csvData.schema.length * 100, color: "#a16207" },
              { category: "Sample", value: csvData.sample.length * 50, color: "#10b981" },
            ]}
          />
        </CardContent>
      </Card>
    </div>
  )
}
