"use client"

import { useEffect, useRef, useState } from "react"
import { Chart, registerables } from "chart.js"

Chart.register(...registerables)

export function UserGrowthChart({ year }: { year: number }) {
  const chartRef = useRef<HTMLCanvasElement | null>(null);
  const chartInstance = useRef<Chart | null>(null)
  const [chartData, setChartData] = useState({
    customerData: new Array(12).fill(0),
    merchantData: new Array(12).fill(0)
  })

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch('/api/manageUsers')
        const users = await response.json()

        // Initialize arrays for monthly counts
        const customerCounts = new Array(12).fill(0)
        const merchantCounts = new Array(12).fill(0)

        // Process users by creation date and role
        users.forEach((user: { createdAt: string | number | Date; role: string }) => {
          const createdDate = new Date(user.createdAt)
          if (createdDate.getFullYear() === year) {
            const month = createdDate.getMonth() // 0-11
            if (user.role === 'customer') {
              customerCounts[month]++
            } else if (user.role === 'merchant') {
              merchantCounts[month]++
            }
          }
        })

        setChartData({
          customerData: customerCounts,
          merchantData: merchantCounts
        })
      } catch (error) {
        console.error('Error fetching user data:', error)
      }
    }

    fetchUserData()
  }, [year])

  useEffect(() => {
    if (!chartRef.current) return

    // Destroy existing chart
    if (chartInstance.current) {
      chartInstance.current.destroy()
    }

    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

    // Create new chart
    const ctx = chartRef.current.getContext("2d")
    if (ctx) {
      chartInstance.current = new Chart(ctx, {
        type: "bar",
        data: {
          labels: months,
          datasets: [
            {
              label: "New Customers",
              data: chartData.customerData,
              backgroundColor: "rgba(59, 130, 246, 0.7)",
              borderColor: "rgb(59, 130, 246)",
              borderWidth: 1,
            },
            {
              label: "New Merchants",
              data: chartData.merchantData,
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
                text: "Number of Users",
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
  }, [chartData])

  return (
    <div className="h-[300px] w-full">
      <canvas ref={chartRef} />
    </div>
  )
}