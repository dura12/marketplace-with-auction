// PaymentMethodsChart.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";

interface PaymentMethodsChartProps {
  transactions: any[];
  isLoading?: boolean;
}

export function PaymentMethodsChart({ transactions, isLoading = false }: PaymentMethodsChartProps) {
  const preparePaymentMethodData = () => {
    if (!transactions || transactions.length === 0) return [];

    const methodCounts: Record<string, number> = {};

    transactions.forEach((transaction) => {
      if (!transaction || !transaction.paymentMethod) return;
      methodCounts[transaction.paymentMethod] = (methodCounts[transaction.paymentMethod] || 0) + 1;
    });

    return Object.entries(methodCounts).map(([method, count]) => {
      let name = method;
      switch (method) {
        case "credit_card": name = "Credit Card"; break;
        case "paypal": name = "PayPal"; break;
        case "bank_transfer": name = "Bank Transfer"; break;
        case "system": name = "System"; break;
      }
      return { name, value: count };
    });
  };

  const paymentMethodData = preparePaymentMethodData();
  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

  return (
    <Card className="relative">
      {isLoading && (
        <div className="absolute inset-0 bg-background/50 flex items-center justify-center z-10">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        </div>
      )}
      <CardHeader>
        <CardTitle>Payment Methods</CardTitle>
        <CardDescription>Distribution of payment methods</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              {paymentMethodData.length > 0 && (
                <Pie
                  data={paymentMethodData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name || ""}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {paymentMethodData.map((entry, index) => (
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