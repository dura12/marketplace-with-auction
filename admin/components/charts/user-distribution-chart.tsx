"use client";

import { useEffect, useRef, useState } from "react";
import { Chart, registerables } from "chart.js";

Chart.register(...registerables);

export function UserDistributionChart() {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);
  const [userData, setUserData] = useState<
    { label: string; value: number; color: string }[]
  >([]);

  useEffect(() => {
    async function fetchAndProcessUsers() {
      try {
        // Fetch users (customers and merchants) from /api/manageUsers
        const usersResponse = await fetch("/api/manageUsers");
        if (!usersResponse.ok) {
          console.error("Failed to fetch users:", usersResponse.statusText);
          return;
        }
        const usersData = await usersResponse.json();
        if (!Array.isArray(usersData)) {
          console.error("Invalid users data:", usersData);
          return;
        }

        // Categorize users by role
        const customerCount = usersData.filter((user: any) => user.role === "customer").length;
        const merchantCount = usersData.filter((user: any) => user.role === "merchant").length;

        // Fetch admins from /api/manageAdmins
        const adminsResponse = await fetch("/api/manageAdmins");
        if (!adminsResponse.ok) {
          console.error("Failed to fetch admins:", adminsResponse.statusText);
          return;
        }
        const adminsData = await adminsResponse.json();
        if (!Array.isArray(adminsData)) {
          console.error("Invalid admins data:", adminsData);
          return;
        }
        const adminCount = adminsData.length;

        // Prepare chart data
        const newUserData = [
          { label: "Customers", value: customerCount, color: "rgba(59, 130, 246, 0.7)" },
          { label: "Merchants", value: merchantCount, color: "rgba(16, 185, 129, 0.7)" },
          { label: "Admins", value: adminCount, color: "rgba(249, 115, 22, 0.7)" },
        ];

        // Update state
        setUserData(newUserData);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    }

    fetchAndProcessUsers();
  }, []);

  useEffect(() => {
    if (!chartRef.current || !userData.length) return;

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
          labels: userData.map((item) => item.label),
          datasets: [
            {
              data: userData.map((item) => item.value),
              backgroundColor: userData.map((item) => item.color),
              borderColor: userData.map((item) => item.color.replace("0.7", "1")),
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
                  return `${label}: ${value} (${percentage}%)`;
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
  }, [userData]);

  return (
    <div className="h-[300px] w-full">
      <canvas ref={chartRef} />
    </div>
  );
}