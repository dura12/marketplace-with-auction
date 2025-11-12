"use client";

import { useEffect, useRef, useState } from "react";
import { Chart, registerables } from "chart.js";

Chart.register(...registerables);

export function OrderDistributionPieChart() {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);
  const [orderData, setOrderData] = useState<
    { type: string; value: number; color: string }[]
  >([]);

  useEffect(() => {
    async function fetchAndProcessOrders() {
      try {
        // Fetch orders from /api/orders
        const response = await fetch("/api/order");
        if (!response.ok) {
          console.error("Failed to fetch orders:", response.statusText);
          return;
        }
        const data = await response.json();
        if (!data.success || !Array.isArray(data.orders)) {
          console.error("Invalid orders data:", data);
          return;
        }
        const orders = data.orders;

        // Initialize counts for each category
        const counts = {
          "Auction - Refunded": 0,
          "Auction - Pending Refunds": 0,
          "Auction - Completed": 0,
          "Auction - Dispatched": 0,
          "Product - Refunded": 0,
          "Product - Pending Refunds": 0,
          "Product - Completed": 0,
          "Product - Dispatched": 0,
        };

        // Process each order
        orders.forEach((order: any) => {
          // Determine if it's an Auction or Product order
          const isAuction = order.auction && order.auction.auctionId;
          const prefix = isAuction ? "Auction" : "Product";

          // Categorize based on status and paymentStatus
          if (order.paymentStatus === "Refunded") {
            counts[`${prefix} - Refunded`] += 1;
          } else if (order.paymentStatus === "Pending Refund") {
            counts[`${prefix} - Pending Refunds`] += 1;
          } else if (order.status === "Received") {
            counts[`${prefix} - Completed`] += 1;
          } else if (order.status === "Dispatched") {
            counts[`${prefix} - Dispatched`] += 1;
          }
          // Note: Orders with status: 'Pending' are not categorized since 'Cancelled' isn't in the schema
        });

        // Prepare chart data with the same colors as the sample data
        const newOrderData = [
          { type: "Auction - Refunded", value: counts["Auction - Refunded"], color: "rgba(255, 99, 132, 0.7)" },
          { type: "Auction - Pending Refunds", value: counts["Auction - Pending Refunds"], color: "rgba(255, 159, 64, 0.7)" },
          { type: "Auction - Completed", value: counts["Auction - Completed"], color: "rgba(75, 192, 192, 0.7)" },
          { type: "Auction - Dispatched", value: counts["Auction - Dispatched"], color: "rgba(255, 206, 86, 0.7)" },
          { type: "Product - Refunded", value: counts["Product - Refunded"], color: "rgba(255, 99, 132, 0.5)" },
          { type: "Product - Pending Refunds", value: counts["Product - Pending Refunds"], color: "rgba(255, 159, 64, 0.5)" },
          { type: "Product - Completed", value: counts["Product - Completed"], color: "rgba(75, 192, 192, 0.5)" },
          { type: "Product - Dispatched", value: counts["Product - Dispatched"], color: "rgba(255, 206, 86, 0.5)" },
        ];

        // Update state
        setOrderData(newOrderData);
      } catch (error) {
        console.error("Error fetching orders:", error);
      }
    }

    fetchAndProcessOrders();
  }, []);

  useEffect(() => {
    if (!chartRef.current || !orderData.length) return;

    // Destroy existing chart instance before creating a new one
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const ctx = chartRef.current.getContext("2d");
    if (ctx) {
      chartInstance.current = new Chart(ctx, {
        type: "pie",
        data: {
          labels: orderData.map((item) => item.type),
          datasets: [
            {
              data: orderData.map((item) => item.value),
              backgroundColor: orderData.map((item) => item.color),
              borderColor: orderData.map((item) => item.color.replace("0.7", "1").replace("0.5", "1")),
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
                  return `${label}: ${value} Orders (${percentage}%)`;
                },
              },
            },
          },
        },
      });
    }

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [orderData]);

  return (
    <div className="h-[300px] w-full">
      <canvas ref={chartRef} />
    </div>
  );
}