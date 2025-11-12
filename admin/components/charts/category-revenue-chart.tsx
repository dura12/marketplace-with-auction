"use client"

import { useEffect, useRef } from "react"
import { Chart, registerables } from "chart.js"
import { fetchCategoryRevenueData } from "@/utils/data-fetching"

Chart.register(...registerables)

export function CategoryRevenueChart() {
  const chartRef = useRef<HTMLCanvasElement>(null)
  const chartInstance = useRef<Chart | null>(null)

  useEffect(() => {
    async function loadChart() {
      if (!chartRef.current) return

      // Destroy existing chart
      if (chartInstance.current) {
        chartInstance.current.destroy()
      }

      // Fetch data
      const categoryData = await fetchCategoryRevenueData()

      // Create new chart
      const ctx = chartRef.current.getContext("2d")
      if (ctx) {
        chartInstance.current = new Chart(ctx, {
          type: "pie",
          data: {
            labels: categoryData.map((item) => item.label),
            datasets: [
              {
                data: categoryData.map((item) => item.value),
                backgroundColor: categoryData.map((item) => item.color),
                borderColor: categoryData.map((item) => item.color.replace("0.7", "1")),
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
                    const label = context.label || ""
                    const value = context.raw as number
                    const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0) as number
                    const percentage = Math.round((value / total) * 100)
                    return `${label}: $${value.toFixed(2)} (${percentage}%)`
                  },
                },
              },
            },
          },
        })
      }
    }

    loadChart()

    // Cleanup
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy()
      }
    }
  }, [])

  return (
    <div className="h-[300px] w-full">
      <canvas ref={chartRef} />
    </div>
  )
}

