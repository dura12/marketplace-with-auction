"use client";

import { useEffect, useState } from "react";
import { ReportBarChart } from "./report-bar-chart";

export function RevenueBarChart({ year, month, period }: { year: number; month: string; period: string }) {
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    async function fetchAndProcessOrders() {
      try {
        const response = await fetch("/api/order");
        if (!response.ok) {
          console.error("Failed to fetch orders:", response.statusText);
          return;
        }

        const data = await response.json();
        if (!data.success) {
          console.error("API error:", data.message);
          return;
        }

        const orders = data.orders;
        const selectedYear = year;
        const selectedMonth = month === "all" ? null : parseInt(month) - 1; // Convert to 0-based index
        const isCurrentYear = selectedYear === new Date().getFullYear();
        const isCurrentMonth = selectedMonth === new Date().getMonth();

        // Initialize data for all months
        const months = [
          "Jan", "Feb", "Mar", "Apr", "May", "Jun",
          "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
        ];
        const monthlyData = months.map(month => ({
          month,
          revenue: 0,
          orders: 0
        }));

        // Determine date range based on period
        let startDate: Date;
        let endDate: Date = new Date();

        if (period && isCurrentYear && isCurrentMonth) {
          if (period === "last7days") {
            startDate = new Date(endDate);
            startDate.setDate(endDate.getDate() - 7);
          } else if (period === "last30days") {
            startDate = new Date(endDate);
            startDate.setDate(endDate.getDate() - 30);
          } else if (period === "last90days") {
            startDate = new Date(endDate);
            startDate.setDate(endDate.getDate() - 90);
          } else if (period === "year") {
            startDate = new Date(selectedYear, 0, 1);
            endDate = new Date(selectedYear, 11, 31);
          } else {
            // Default to full year if period is invalid
            startDate = new Date(selectedYear, 0, 1);
            endDate = new Date(selectedYear, 11, 31);
          }
        } else if (selectedMonth !== null) {
          startDate = new Date(selectedYear, selectedMonth, 1);
          endDate = new Date(selectedYear, selectedMonth + 1, 0); // Last day of the month
        } else {
          startDate = new Date(selectedYear, 0, 1);
          endDate = new Date(selectedYear, 11, 31);
        }

        // Process orders
        orders.forEach((order: any) => {
          const orderDate = new Date(order.orderDate);
          if (orderDate >= startDate && orderDate <= endDate && orderDate.getFullYear() === selectedYear) {
            const monthIndex = orderDate.getMonth(); // 0-11

            // Count all orders
            monthlyData[monthIndex].orders += 1;

            // Calculate revenue for Paid To Merchant orders (4% of totalPrice)
            if (order.paymentStatus === "Paid To Merchant") {
              monthlyData[monthIndex].revenue += order.totalPrice * 0.04;
            }
          }
        });

        // Filter data based on selected month
        const filteredData = selectedMonth !== null && !period
          ? [monthlyData[selectedMonth]]
          : monthlyData;

        setChartData(filteredData);
      } catch (error) {
        console.error("Error fetching orders:", error);
      }
    }

    fetchAndProcessOrders();
  }, [year, month, period]);

  return (
    <div className="w-full overflow-x-auto">
      <div className="min-w-[600px] sm:min-w-full">
        <ReportBarChart
          data={chartData}
          dataKeys={["revenue", "orders"]}
          xAxisKey="month"
          colors={["#8884d8", "#82ca9d"]}
          formatter={(value) =>
            typeof value === "number" ? (value >= 1000 ? `$${value}` : `${value} Orders`) : value
          }
        />
      </div>
    </div>
  );
}