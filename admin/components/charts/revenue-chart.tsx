"use client";

import { useEffect, useRef, useState } from "react";
import { Chart, registerables } from "chart.js";

Chart.register(...registerables);

export function RevenueChart({ year }: { year?: number }) {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);
  const [chartData, setChartData] = useState<{
    months: string[];
    revenueData: number[];
    ordersData: number[];
  }>({
    months: [],
    revenueData: [],
    ordersData: [],
  });

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
        const today = new Date("2025-04-14"); // Fixed reference date
        const months: string[] = [];
        const revenueData: number[] = [];
        const ordersData: number[] = [];

        let startDate: Date;
        let endDate: Date;

        if (year) {
          // If year is provided, use full year
          startDate = new Date(year, 0, 1); // Jan 1st of the year
          endDate = new Date(year, 11, 31); // Dec 31st of the year

          // Initialize months for the full year
          for (let i = 0; i < 12; i++) {
            const date = new Date(year, i, 1);
            months.push(date.toLocaleString("default", { month: "short" }));
            revenueData.push(0);
            ordersData.push(0);
          }
        } else {
          // Default behavior: last 12 months
          startDate = new Date(today.getFullYear(), today.getMonth() - 11, 1);
          endDate = today;

          // Initialize months (12 months back)
          for (let i = 11; i >= 0; i--) {
            const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
            months.push(date.toLocaleString("default", { month: "short" }));
            revenueData.push(0);
            ordersData.push(0);
          }
        }

        orders.forEach((order: any) => {
          const orderDate = new Date(order.orderDate);

          if (orderDate >= startDate && orderDate <= endDate) {
            const monthIndex = year
              ? orderDate.getMonth() // 0-11 for specific year
              : (orderDate.getFullYear() - startDate.getFullYear()) * 12 +
                orderDate.getMonth() - startDate.getMonth();

            if (monthIndex >= 0 && monthIndex < 12) {
              // Always count the order
              ordersData[monthIndex] += 1;

              // Only include revenue for orders that are 'Paid To Merchant'
              if (order.paymentStatus === "Paid To Merchant") {
                let totalProductPrice = 0;

                if (order.products && Array.isArray(order.products)) {
                  totalProductPrice = order.products.reduce(
                    (sum: number, product: any) => {
                      const price = product.price || 0;
                      const quantity = product.quantity || 1;
                      return sum + price * quantity;
                    },
                    0
                  );
                }

                revenueData[monthIndex] += totalProductPrice * 0.04;
              }
            }
          }
        });

        setChartData({ months, revenueData, ordersData });
      } catch (error) {
        console.error("Error fetching orders:", error);
      }
    }

    fetchAndProcessOrders();
  }, [year]);

  useEffect(() => {
    if (!chartRef.current || !chartData.months.length) return;

    // Destroy existing chart
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    // Create new chart
    const ctx = chartRef.current.getContext("2d");
    if (ctx) {
      chartInstance.current = new Chart(ctx, {
        type: "line",
        data: {
          labels: chartData.months,
          datasets: [
            {
              label: "Revenue",
              data: chartData.revenueData,
              borderColor: "rgb(59, 130, 246)",
              backgroundColor: "rgba(59, 130, 246, 0.1)",
              borderWidth: 2,
              fill: true,
              tension: 0.3,
              yAxisID: "y",
            },
            {
              label: "Orders",
              data: chartData.ordersData,
              borderColor: "rgb(16, 185, 129)",
              backgroundColor: "rgba(16, 185, 129, 0.1)",
              borderWidth: 2,
              fill: true,
              tension: 0.3,
              yAxisID: "y1",
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          interaction: {
            mode: "index",
            intersect: false,
          },
          scales: {
            y: {
              type: "linear",
              display: true,
              position: "left",
              title: {
                display: true,
                text: "Revenue ($)",
              },
              grid: {
                drawOnChartArea: false,
              },
            },
            y1: {
              type: "linear",
              display: true,
              position: "right",
              title: {
                display: true,
                text: "Orders",
              },
              grid: {
                drawOnChartArea: false,
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
      });
    }

    // Cleanup
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [chartData]);

  return (
    <div className="h-[300px] w-full">
      <canvas ref={chartRef} />
    </div>
  );
}