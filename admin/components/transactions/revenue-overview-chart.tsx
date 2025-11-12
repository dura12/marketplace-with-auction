// RevenueOverviewChart.tsx
"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface RevenueOverviewChartProps {
  transactions: any[];
  isLoading?: boolean;
}

export function RevenueOverviewChart({ transactions, isLoading = false }: RevenueOverviewChartProps) {
  const [chartView, setChartView] = useState<"daily" | "weekly" | "monthly">("daily");

  const prepareTimeSeriesData = (groupBy: "daily" | "weekly" | "monthly") => {
    if (!transactions || transactions.length === 0) return [];

    const groupedData: Record<string, { date: string; revenue: number; transactions: number }> = {};

    transactions.forEach((transaction) => {
      if (!transaction || !transaction.date) return;

      const date = new Date(transaction.date);
      let key = "";

      if (groupBy === "daily") {
        key = date.toISOString().split("T")[0]; // YYYY-MM-DD
      } else if (groupBy === "weekly") {
        const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
        const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
        const weekNumber = Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
        key = `${date.getFullYear()}-W${weekNumber}`;
      } else if (groupBy === "monthly") {
        key = `${date.getFullYear()}-${date.getMonth() + 1}`; // YYYY-MM
      }

      if (!groupedData[key]) {
        groupedData[key] = { date: key, revenue: 0, transactions: 0 };
      }

      if (transaction.type === "purchase" && transaction.status === "completed") {
        groupedData[key].revenue += transaction.amount;
        groupedData[key].transactions += 1;
      } else if (transaction.type === "refund" && transaction.status === "completed") {
        groupedData[key].revenue -= transaction.amount;
      }
    });

    return Object.values(groupedData).sort((a, b) => a.date.localeCompare(b.date));
  };

  const formatDateLabel = (dateStr: string) => {
    if (!dateStr) return "";

    if (chartView === "daily") {
      const date = new Date(dateStr);
      return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    } else if (chartView === "weekly") {
      const [year, week] = dateStr.split("-W");
      return `Week ${week}`;
    } else if (chartView === "monthly") {
      const [year, month] = dateStr.split("-");
      return new Date(parseInt(year), parseInt(month) - 1, 1).toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      });
    }
    return dateStr;
  };

  const timeSeriesData = prepareTimeSeriesData(chartView);

  return (
    <Card className="col-span-2 relative">
      {isLoading && (
        <div className="absolute inset-0 bg-background/50 flex items-center justify-center z-10">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        </div>
      )}
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle>Revenue Overview</CardTitle>
          <Tabs value={chartView} onValueChange={(value) => setChartView(value as "daily" | "weekly" | "monthly")}>
            <TabsList>
              <TabsTrigger value="daily">Daily</TabsTrigger>
              <TabsTrigger value="weekly">Weekly</TabsTrigger>
              <TabsTrigger value="monthly">Monthly</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        <CardDescription>Revenue and transaction count over time</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{
            revenue: { label: "Revenue", color: "hsl(var(--chart-1))" },
            transactions: { label: "Transactions", color: "hsl(var(--chart-2))" },
          }}
          className="h-[300px]"
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={timeSeriesData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tickFormatter={formatDateLabel} tick={{ fontSize: 12 }} />
              <YAxis yAxisId="left" tickFormatter={(value) => `$${value}`} tick={{ fontSize: 12 }} />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Legend />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="revenue"
                stroke="var(--color-revenue)"
                name="Revenue"
                activeDot={{ r: 8 }}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="transactions"
                stroke="var(--color-transactions)"
                name="Transactions"
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}