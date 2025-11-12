"use client"

import { useEffect, useState } from "react"
import { ReportBarChart } from "./report-bar-chart"

export function UserGrowthBarChart({ year, month, period }: { year: number; month: string; period: string }) {
  const [chartData, setChartData] = useState<any[]>([])

  useEffect(() => {
    async function fetchAndProcessData() {
      try {
        // Fetch users
        const usersResponse = await fetch("/api/manageUsers")
        if (!usersResponse.ok) {
          console.error("Failed to fetch users:", usersResponse.statusText)
          return
        }
        const usersData = await usersResponse.json()

        // Fetch admins
        const adminsResponse = await fetch("/api/manageAdmins")
        if (!adminsResponse.ok) {
          console.error("Failed to fetch admins:", adminsResponse.statusText)
          // Continue with users data even if admins fetch fails
        }
        const adminsData = adminsResponse.ok ? await adminsResponse.json() : []

        const selectedYear = year
        const selectedMonth = month === "all" ? null : parseInt(month) - 1 // Convert to 0-based index
        const isCurrentYear = selectedYear === new Date().getFullYear()
        const isCurrentMonth = selectedMonth === new Date().getMonth()

        // Initialize data for all months
        const months = [
          "Jan", "Feb", "Mar", "Apr", "May", "Jun",
          "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
        ]
        const monthlyData = months.map(month => ({
          month,
          customers: 0,
          merchants: 0,
          admins: 0
        }))

        // Determine date range based on period
        let startDate: Date
        let endDate: Date = new Date()

        if (period && isCurrentYear && isCurrentMonth) {
          if (period === "last7days") {
            startDate = new Date(endDate)
            startDate.setDate(endDate.getDate() - 7)
          } else if (period === "last30days") {
            startDate = new Date(endDate)
            startDate.setDate(endDate.getDate() - 30)
          } else if (period === "last90days") {
            startDate = new Date(endDate)
            startDate.setDate(endDate.getDate() - 90)
          } else if (period === "year") {
            startDate = new Date(selectedYear, 0, 1)
            endDate = new Date(selectedYear, 11, 31)
          } else {
            // Default to full year if period is invalid
            startDate = new Date(selectedYear, 0, 1)
            endDate = new Date(selectedYear, 11, 31)
          }
        } else if (selectedMonth !== null) {
          startDate = new Date(selectedYear, selectedMonth, 1)
          endDate = new Date(selectedYear, selectedMonth + 1, 0) // Last day of the month
        } else {
          startDate = new Date(selectedYear, 0, 1)
          endDate = new Date(selectedYear, 11, 31)
        }

        // Process users
        usersData.forEach((user: any) => {
          const createdDate = new Date(user.createdAt)
          if (createdDate >= startDate && createdDate <= endDate && createdDate.getFullYear() === selectedYear) {
            const monthIndex = createdDate.getMonth() // 0-11
            if (user.role === "customer") {
              monthlyData[monthIndex].customers += 1
            } else if (user.role === "merchant") {
              monthlyData[monthIndex].merchants += 1
            }
          }
        })

        // Process admins
        adminsData.forEach((admin: any) => {
          const createdDate = new Date(admin.createdAt)
          if (createdDate >= startDate && createdDate <= endDate && createdDate.getFullYear() === selectedYear) {
            const monthIndex = createdDate.getMonth() // 0-11
            monthlyData[monthIndex].admins += 1
          }
        })

        // Filter data based on selected month
        const filteredData = selectedMonth !== null && !period
          ? [monthlyData[selectedMonth]]
          : monthlyData

        setChartData(filteredData)
      } catch (error) {
        console.error("Error fetching data:", error)
      }
    }

    fetchAndProcessData()
  }, [year, month, period])

  return (
    <div className="w-full overflow-x-auto">
      <div className="min-w-[600px] sm:min-w-full">
        <ReportBarChart
          data={chartData}
          dataKeys={["customers", "merchants", "admins"]}
          xAxisKey="month"
          colors={["#8884d8", "#82ca9d", "#ffc658"]}
          stacked={true}
        />
      </div>
    </div>
  )
}