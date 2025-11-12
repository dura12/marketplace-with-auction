"use client"

import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

interface ReportBarChartProps {
  data: any[]
  dataKeys: string[]
  colors?: string[]
  xAxisKey: string
  yAxisLabel?: string
  height?: number
  stacked?: boolean
  formatter?: (value: number) => string
}

export function ReportBarChart({
  data,
  dataKeys,
  colors = ["#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#a4de6c"],
  xAxisKey,
  yAxisLabel,
  height = 300,
  stacked = false,
  formatter = (value) => `${value}`,
}: ReportBarChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey={xAxisKey} />
        <YAxis label={yAxisLabel ? { value: yAxisLabel, angle: -90, position: "insideLeft" } : undefined} />
        <Tooltip formatter={formatter} />
        <Legend />
        {dataKeys.map((key, index) => (
          <Bar
            key={key}
            dataKey={key}
            fill={colors[index % colors.length]}
            stackId={stacked ? "stack" : undefined}
            name={key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, " $1")}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  )
}

