"use client";

import { useEffect, useState } from "react";
import { ReportBarChart } from "./report-bar-chart";

export function OrderDistributionBarChart({ year, month, period }: { year: number; month: string; period: string }) {
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

        // Determine date range based on month and period
        let startDate: Date;
        let endDate: Date = new Date();

        if (selectedMonth !== null && !period) {
          // Specific month selected
          startDate = new Date(selectedYear, selectedMonth, 1);
          endDate = new Date(selectedYear, selectedMonth + 1, 0); // Last day of the month
        } else if (period && isCurrentYear && isCurrentMonth) {
          // Period-based filtering for current year/month
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
        } else {
          // Full year if no specific month or period
          startDate = new Date(selectedYear, 0, 1);
          endDate = new Date(selectedYear, 11, 31);
        }

        // Initialize data for order types with abbreviated labels
        const orderTypes = [
          { type: "Auct.", key: "auction" },
          { type: "Prod.", key: "product" },
          { type: "Ref.", key: "refunded" },
          { type: "Pend. Ref.", key: "pendingRefund" },
          { type: "Comp.", key: "completed" },
          { type: "Canc.", key: "cancelled" },
          { type: "Disp.", key: "dispatched" }
        ];

        const orderData = orderTypes.map(({ type }) => ({
          type,
          count: 0,
          value: 0
        }));

        // Process orders
        orders.forEach((order: any) => {
          const orderDate = new Date(order.orderDate);
          if (orderDate >= startDate && orderDate <= endDate && orderDate.getFullYear() === selectedYear) {
            // Additional check for specific month if selected
            if (selectedMonth !== null && !period && orderDate.getMonth() !== selectedMonth) {
              return;
            }

            // Categorize orders
            if (order.auction && order.auction.auctionId) {
              orderData[0].count += 1; // Auction Orders
              orderData[0].value += order.totalPrice;
            }
            if (order.products && order.products.length > 0) {
              orderData[1].count += 1; // Product Orders
              orderData[1].value += order.totalPrice;
            }
            if (order.paymentStatus === "Refunded") {
              orderData[2].count += 1; // Refunded Orders
              orderData[2].value += order.totalPrice;
            }
            if (order.paymentStatus === "Pending Refund") {
              orderData[3].count += 1; // Pending Refunds
              orderData[3].value += order.totalPrice;
            }
            if (order.status === "Received") {
              orderData[4].count += 1; // Completed Orders
              orderData[4].value += order.totalPrice;
            }
            if (order.status === "Pending" && order.paymentStatus === "Pending") {
              orderData[5].count += 1; // Cancelled Orders
              orderData[5].value += order.totalPrice;
            }
            if (order.status === "Dispatched") {
              orderData[6].count += 1; // Dispatched Orders
              orderData[6].value += order.totalPrice;
            }
          }
        });

        setChartData(orderData);
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
          dataKeys={["count"]}
          xAxisKey="type"
          colors={["#4CAF50", "#FF9800", "#F44336", "#2196F3", "#FFC107", "#9C27B0"]}
          formatter={(value: number) =>
            value > 1000 ? `$${value.toLocaleString()}` : `${value} Orders`
          }
        />
      </div>
    </div>
  );
}