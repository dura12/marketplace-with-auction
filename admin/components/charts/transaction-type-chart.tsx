"use client";

import { useEffect, useRef } from "react";
import { Chart, registerables } from "chart.js";

Chart.register(...registerables);

export function TransactionTypeDistributionChart() {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);

  useEffect(() => {
    async function loadChart() {
      if (!chartRef.current) return;

      // Destroy existing chart
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }

      const transactionData = await fetchTransactionTypeData();

      const ctx = chartRef.current.getContext("2d");
      if (ctx) {
        chartInstance.current = new Chart(ctx, {
          type: "pie",
          data: {
            labels: transactionData.map((item) => item.label),
            datasets: [
              {
                data: transactionData.map((item) => item.value),
                backgroundColor: transactionData.map((item) => item.color),
                borderColor: transactionData.map((item) => item.color.replace("0.7", "1")),
                borderWidth: 1,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: "right",
              },
              tooltip: {
                callbacks: {
                  label: (context) => {
                    const label = context.label || "";
                    const value = context.raw as number;
                    const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0) as number;
                    const percentage = Math.round((value / total) * 100);
                    return `${label}: $${value.toFixed(2)} (${percentage}%)`;
                  },
                },
              },
            },
          },
        });
      }
    }

    loadChart();

    // Cleanup on unmount
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, []);

  return (
    <div className="h-[300px] w-full">
      <canvas ref={chartRef} />
    </div>
  );
}


export async function fetchTransactionTypeData() {
    // Demo Data (Replace with API call when ready)
    return [
      { label: "Purchase", value: 45000, color: "rgba(54, 162, 235, 0.7)" },
      { label: "Pay to Merchant", value: 30000, color: "rgba(255, 99, 132, 0.7)" },
      { label: "Refund", value: 5000, color: "rgba(255, 206, 86, 0.7)" },
      { label: "Auctions", value: 20000, color: "rgba(75, 192, 192, 0.7)" },
      { label: "Revenue", value: 15000, color: "rgba(153, 102, 255, 0.7)" },
    ];
  }