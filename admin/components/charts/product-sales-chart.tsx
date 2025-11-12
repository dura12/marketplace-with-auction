"use client"

import { useEffect, useState } from "react"
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

type ProductSalesChartProps = {
  year?: number;
  month?: string;
};

export function ProductSalesChart({ year, month }: ProductSalesChartProps) {
  const [chartData, setChartData] = useState<any[]>([])

  useEffect(() => {
    async function fetchAndProcessOrders() {
      try {
        const response = await fetch("/api/order")
        if (!response.ok) {
          console.error("Failed to fetch orders:", response.statusText)
          return
        }

        const data = await response.json()
        if (!data.success) {
          console.error("API error:", data.message)
          return
        }

        const orders = data.orders
        const selectedYear = year || new Date().getFullYear()

        const months = [
          "Jan", "Feb", "Mar", "Apr", "May", "Jun",
          "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
        ]
        const monthlyData = months.map(month => ({
          month,
          sales: 0,
          auctions: 0
        }))

        orders.forEach((order: any) => {
          const orderDate = new Date(order.orderDate)
          if (orderDate.getFullYear() === selectedYear) {
            const monthIndex = orderDate.getMonth() // 0-11

            // Categorize as sales or auction
            if (order.products && order.products.length > 0) {
              monthlyData[monthIndex].sales += order.totalPrice
            } else if (order.auction && order.auction.auctionId) {
              monthlyData[monthIndex].auctions += order.totalPrice
            }
          }
        })

        setChartData(monthlyData)
      } catch (error) {
        console.error("Error fetching orders:", error)
      }
    }

    fetchAndProcessOrders()
  }, [year])

  return (
    <div className="w-full overflow-x-auto">
      <div className="min-w-[600px] sm:min-w-full">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="sales" fill="#8884d8" name="Sales" />
            <Bar dataKey="auctions" fill="#82ca9d" name="Auctions" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}