"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Download, Edit3, Trash2, SortAsc, SortDesc, BarChart3 } from "lucide-react"

interface CSVData {
  schema: string[]
  rowCount: number
  sample: any[]
  fullData: any[]
  fileName: string
}

interface DataManipulationPanelProps {
  csvData: CSVData
  onDataUpdate: (updatedData: CSVData) => void
  onGenerateReport: () => void
  selectedLanguage: string
}

export function DataManipulationPanel({ csvData, onDataUpdate, onGenerateReport, selectedLanguage }: DataManipulationPanelProps) {
  const [filteredData, setFilteredData] = useState(csvData.fullData)
  const [searchTerm, setSearchTerm] = useState("")
  const [sortColumn, setSortColumn] = useState("")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")
  const [selectedRows, setSelectedRows] = useState<number[]>([])
  const [editingCell, setEditingCell] = useState<{ row: number; column: string } | null>(null)
  const [editValue, setEditValue] = useState("")

  const isSampleData = csvData.fileName === "Sample_Data.csv"

  // Filter and search data
  const processedData = useMemo(() => {
    let data = [...csvData.fullData]

    // Apply search filter
    if (searchTerm) {
      data = data.filter((row) =>
        Object.values(row).some((value) => String(value).toLowerCase().includes(searchTerm.toLowerCase())),
      )
    }

    // Apply sorting
    if (sortColumn) {
      data.sort((a, b) => {
        const aVal = a[sortColumn]
        const bVal = b[sortColumn]
        const comparison = String(aVal).localeCompare(String(bVal), undefined, { numeric: true })
        return sortDirection === "asc" ? comparison : -comparison
      })
    }

    return data
  }, [csvData.fullData, searchTerm, sortColumn, sortDirection])

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortColumn(column)
      setSortDirection("asc")
    }
  }

  const handleCellEdit = (rowIndex: number, column: string, value: string) => {
    const updatedData = [...csvData.fullData]
    const actualRowIndex = csvData.fullData.findIndex((row) => row === processedData[rowIndex])
    updatedData[actualRowIndex] = { ...updatedData[actualRowIndex], [column]: value }

    onDataUpdate({
      ...csvData,
      fullData: updatedData,
    })
    setEditingCell(null)
  }

  const handleDeleteRows = () => {
    const updatedData = csvData.fullData.filter((_, index) => !selectedRows.includes(index))
    onDataUpdate({
      ...csvData,
      fullData: updatedData,
      rowCount: updatedData.length,
    })
    setSelectedRows([])
  }

  const exportFilteredData = () => {
    const csv = [
      csvData.schema.join(","),
      ...processedData.map((row) => csvData.schema.map((col) => `"${row[col] || ""}"`).join(",")),
    ].join("\n")

    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = isSampleData ? `sample_data_export.csv` : `filtered_${csvData.fileName}`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      {isSampleData && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-amber-800">
              <BarChart3 className="w-4 h-4" />
              <span className="text-sm font-medium">Sample Data Mode</span>
            </div>
            <p className="text-xs text-amber-700 mt-1">
              You're working with sample data. Changes made here won't affect your actual dataset. Upload your own CSV file to manipulate real data.
            </p>
          </CardContent>
        </Card>
      )}
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Edit3 className="w-5 h-5" />
            Data Manipulation Panel
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="filter" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="filter">Filter & Search</TabsTrigger>
              <TabsTrigger value="edit">Edit Data</TabsTrigger>
              <TabsTrigger value="analyze">Quick Analysis</TabsTrigger>
              <TabsTrigger value="export">Export</TabsTrigger>
            </TabsList>

            <TabsContent value="filter" className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-1">
                  <Input
                    placeholder="Search across all columns..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full"
                  />
                </div>
                <Select value={sortColumn} onValueChange={setSortColumn}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Sort by column" />
                  </SelectTrigger>
                  <SelectContent>
                    {csvData.schema.map((column) => (
                      <SelectItem key={column} value={column}>
                        {column}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  onClick={() => setSortDirection(sortDirection === "asc" ? "desc" : "asc")}
                  disabled={!sortColumn}
                >
                  {sortDirection === "asc" ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />}
                </Button>
              </div>

              <div className="flex items-center gap-4">
                <Badge variant="secondary">
                  {processedData.length} of {csvData.rowCount} rows shown
                </Badge>
                {selectedRows.length > 0 && (
                  <Button variant="destructive" size="sm" onClick={handleDeleteRows}>
                    <Trash2 className="w-4 h-4 mr-1" />
                    Delete {selectedRows.length} rows
                  </Button>
                )}
              </div>
            </TabsContent>

            <TabsContent value="edit" className="space-y-4">
              <div className="max-h-96 overflow-auto border rounded-lg">
                <table className="w-full text-sm">
                  <thead className="bg-muted">
                    <tr>
                      <th className="p-2 text-left">
                        <input
                          type="checkbox"
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedRows(processedData.map((_, i) => i))
                            } else {
                              setSelectedRows([])
                            }
                          }}
                        />
                      </th>
                      {csvData.schema.map((column) => (
                        <th key={column} className="p-2 text-left font-medium">
                          <button
                            onClick={() => handleSort(column)}
                            className="flex items-center gap-1 hover:text-primary"
                          >
                            {column}
                            {sortColumn === column &&
                              (sortDirection === "asc" ? (
                                <SortAsc className="w-3 h-3" />
                              ) : (
                                <SortDesc className="w-3 h-3" />
                              ))}
                          </button>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {processedData.slice(0, 50).map((row, rowIndex) => (
                      <tr key={rowIndex} className="border-b hover:bg-muted/50">
                        <td className="p-2">
                          <input
                            type="checkbox"
                            checked={selectedRows.includes(rowIndex)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedRows([...selectedRows, rowIndex])
                              } else {
                                setSelectedRows(selectedRows.filter((i) => i !== rowIndex))
                              }
                            }}
                          />
                        </td>
                        {csvData.schema.map((column) => (
                          <td key={column} className="p-2">
                            {editingCell?.row === rowIndex && editingCell?.column === column ? (
                              <Input
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                onBlur={() => handleCellEdit(rowIndex, column, editValue)}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                    handleCellEdit(rowIndex, column, editValue)
                                  } else if (e.key === "Escape") {
                                    setEditingCell(null)
                                  }
                                }}
                                className="h-8 text-xs"
                                autoFocus
                              />
                            ) : (
                              <div
                                className="cursor-pointer hover:bg-muted p-1 rounded"
                                onClick={() => {
                                  setEditingCell({ row: rowIndex, column })
                                  setEditValue(String(row[column] || ""))
                                }}
                              >
                                {String(row[column] || "")}
                              </div>
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {processedData.length > 50 && (
                <p className="text-sm text-muted-foreground">
                  Showing first 50 rows. Use filters to narrow down results.
                </p>
              )}
            </TabsContent>

            <TabsContent value="analyze" className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold">{processedData.length}</div>
                    <div className="text-sm text-muted-foreground">Filtered Rows</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold">{csvData.schema.length}</div>
                    <div className="text-sm text-muted-foreground">Columns</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold">{selectedRows.length}</div>
                    <div className="text-sm text-muted-foreground">Selected</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold">
                      {Math.round((processedData.length / csvData.rowCount) * 100)}%
                    </div>
                    <div className="text-sm text-muted-foreground">Data Shown</div>
                  </CardContent>
                </Card>
              </div>

              <Button onClick={onGenerateReport} className="w-full">
                <BarChart3 className="w-4 h-4 mr-2" />
                {isSampleData ? "Generate Sample Report" : "Generate Full Dataset Report"}
              </Button>
            </TabsContent>

            <TabsContent value="export" className="space-y-4">
              <div className="grid gap-4">
                <Button onClick={exportFilteredData} variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  {isSampleData ? "Export Sample Data as CSV" : "Export Filtered Data as CSV"}
                </Button>
                <Button onClick={onGenerateReport}>
                  <Download className="w-4 h-4 mr-2" />
                  {isSampleData ? "Generate Sample Report" : "Generate & Download Business Report"}
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
