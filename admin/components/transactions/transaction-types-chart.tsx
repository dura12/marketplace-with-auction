// TransactionTypesChart.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";

interface TransactionTypesChartProps {
  transactions: any[];
  isLoading?: boolean;
}

export function TransactionTypesChart({ transactions, isLoading = false }: TransactionTypesChartProps) {
  const prepareTransactionTypeData = () => {
    if (!transactions || transactions.length === 0) return [];

    const typeCounts: Record<string, number> = {};

    transactions.forEach((transaction) => {
      if (!transaction || !transaction.type) return;
      typeCounts[transaction.type] = (typeCounts[transaction.type] || 0) + 1;
    });

    return Object.entries(typeCounts).map(([type, count]) => ({
      name: type.charAt(0).toUpperCase() + type.slice(1),
      value: count,
    }));
  };

  const transactionTypeData = prepareTransactionTypeData();
  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

  return (
    <Card className="relative">
      {isLoading && (
        <div className="absolute inset-0 bg-background/50 flex items-center justify-center z-10">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        </div>
      )}
      <CardHeader>
        <CardTitle>Transaction Types</CardTitle>
        <CardDescription>Distribution of transaction types</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              {transactionTypeData.length > 0 && (
                <Pie
                  data={transactionTypeData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name || ""}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {transactionTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
              )}
              <Tooltip formatter={(value) => [`${value} transactions`, "Count"]} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}