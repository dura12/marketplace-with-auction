"use client"

import { useEffect, useRef } from "react"
import { Chart, registerables } from "chart.js"

Chart.register(...registerables)

export function MonthlyReportsChart() {
  const chartRef = useRef<HTMLCanvasElement>(null)
  const chartInstance = useRef<Chart | null>(null)

  useEffect(() => {
    if (!chartRef.current) return

    // Destroy existing chart
    if (chartInstance.current) {
      chartInstance.current.destroy()
    }

    // Sample data
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    const revenueData = [12500, 15000, 18000, 16500, 21000, 22000, 25000, 23000, 27000, 29000, 32000, 34000]
    const expensesData = [8000, 9500, 11000, 10500, 12500, 13000, 14500, 14000, 15500, 16000, 17500, 18000]
    const profitData = revenueData.map((revenue, index) => revenue - expensesData[index])

    // Create new chart
    const ctx = chartRef.current.getContext("2d")
    if (ctx) {
      chartInstance.current = new Chart(ctx, {
        type: "bar",
        data: {
          labels: months,
          datasets: [
            {
              label: "Revenue",
              data: revenueData,
              backgroundColor: "rgba(59, 130, 246, 0.7)",
              borderColor: "rgb(59, 130, 246)",
              borderWidth: 1,
            },
            {
              label: "Expenses",
              data: expensesData,
              backgroundColor: "rgba(239, 68, 68, 0.7)",
              borderColor: "rgb(239, 68, 68)",
              borderWidth: 1,
            },
            {
              label: "Profit",
              data: profitData,
              backgroundColor: "rgba(16, 185, 129, 0.7)",
              borderColor: "rgb(16, 185, 129)",
              borderWidth: 1,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: "Amount ($)",
              },
            },
            x: {
              title: {
                display: true,
                text: "Month",
              },
            },
          },
          plugins: {
            legend: {
              position: "top",
            },
            tooltip: {
              mode: "index",
              intersect: false,
            },
          },
        },
      })
    }

    // Cleanup
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy()
      }
    }
  }, [])

  return (
    <div className="h-[400px] w-full">
      <canvas ref={chartRef} />
    </div>
  )
}

