"use client";

import { useEffect, useRef, useState } from "react";
import { Chart, registerables } from "chart.js";

Chart.register(...registerables);

export function RevenueDistributionChart() {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);
  const [revenueData, setRevenueData] = useState<
    { label: string; value: number; color: string }[]
  >([]);

  useEffect(() => {
    async function fetchAndProcessOrders() {
      try {
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
  
        let auctionRevenue = 0;
        let salesRevenue = 0;
  
        orders.forEach((order: any) => {
          // Only include revenue if paymentStatus is 'Paid To Merchant'
          if (order.paymentStatus === "Paid To Merchant") {
            let totalProductPrice = 0;
  
            if (order.products && Array.isArray(order.products)) {
              totalProductPrice = order.products.reduce((sum: number, product: any) => {
                const price = product.price || 0;
                const quantity = product.quantity || 1;
                return sum + price * quantity;
              }, 0);
            }
  
            const orderRevenue = totalProductPrice * 0.04;
  
            if (order.auction && order.auction.auctionId) {
              auctionRevenue += orderRevenue;
            } else {
              salesRevenue += orderRevenue;
            }
          }
        });
  
        const newRevenueData = [
          {
            label: "Auctions",
            value: auctionRevenue,
            color: "rgba(59, 130, 246, 0.7)",
          },
          {
            label: "Sales",
            value: salesRevenue,
            color: "rgba(16, 185, 129, 0.7)",
          },
        ];
  
        setRevenueData(newRevenueData);
      } catch (error) {
        console.error("Error fetching orders:", error);
      }
    }
  
    fetchAndProcessOrders();
  }, []);
  

  useEffect(() => {
    if (!chartRef.current || !revenueData.length) return;

    // Destroy existing chart
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    // Create new chart
    const ctx = chartRef.current.getContext("2d");
    if (ctx) {
      chartInstance.current = new Chart(ctx, {
        type: "pie",
        data: {
          labels: revenueData.map((item) => item.label),
          datasets: [
            {
              data: revenueData.map((item) => item.value),
              backgroundColor: revenueData.map((item) => item.color),
              borderColor: revenueData.map((item) => item.color.replace("0.7", "1")),
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

    // Cleanup
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [revenueData]);

  return (
    <div className="h-[300px] w-full">
      <canvas ref={chartRef} />
    </div>
  );
}