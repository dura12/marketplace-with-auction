"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"

interface TransactionTypesChartProps {
  transactions: any[]
  isLoading?: boolean
  className?: string
}

export function TransactionTypesChart({ transactions, isLoading, className = "" }: TransactionTypesChartProps) {
  // Process transaction data for the chart
  const getTransactionCounts = () => {
    const counts: Record<string, number> = {}

    transactions.forEach((transaction) => {
      if (!transaction) return
      const type = transaction.type || "unknown"
      counts[type] = (counts[type] || 0) + 1
    })

    return Object.entries(counts).map(([name, value]) => ({ name, value }))
  }

  const data = getTransactionCounts()

  // Colors for different transaction types
  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"]

  // Loading state
  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Transaction Types</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center">
          <div className="text-center">
            <p className="text-muted-foreground">Loading transaction data...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  // No data state
  if (data.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Transaction Types</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center">
          <div className="text-center">
            <p className="text-muted-foreground">No transaction data available</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Transaction Types</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => [`${value} transactions`, "Count"]} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

