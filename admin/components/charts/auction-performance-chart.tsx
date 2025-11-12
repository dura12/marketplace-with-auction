"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useEffect, useState } from "react";

type AuctionPerformanceChartProps = {
  year?: number;
  month?: string;  // Add month as an optional prop
};

export function AuctionPerformanceChart({ year, month }: AuctionPerformanceChartProps) {
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    async function fetchAuctionData() {
      try {
        const res = await fetch("/api/manageAuctions");
        if (!res.ok) {
          console.error("Failed to fetch auctions:", res.statusText);
          return;
        }

        const data = await res.json();
        console.log("Auction API response:", data); // Optional for debugging

        const auctions = data?.auctions || data;

        if (!Array.isArray(auctions)) {
          console.error("API response is not an array");
          return;
        }

        const selectedYear = year || new Date().getFullYear();

        // Initialize months data for chart
        const months = [
          "Jan", "Feb", "Mar", "Apr", "May", "Jun",
          "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
        ];

        const monthlyData = months.map((month) => ({
          month,
          active: 0,
          ended: 0,
          cancelled: 0,
          rejected: 0,
          approved: 0,
          pendingStatus: 0,
        }));

        auctions.forEach((auction: any) => {
          const endDate = new Date(auction.endTime);
          if (endDate.getFullYear() !== selectedYear) return;

          // Use month prop if provided, else use the auction's end date
          const selectedMonth = month || months[endDate.getMonth()];
          const monthIndex = months.indexOf(selectedMonth);

          if (monthIndex !== -1) {
            if (auction.status === "active") monthlyData[monthIndex].active += 1;
            if (auction.status === "ended") monthlyData[monthIndex].ended += 1;
            if (auction.status === "cancelled") monthlyData[monthIndex].cancelled += 1;
            if (auction.status === "pending") monthlyData[monthIndex].pendingStatus += 1;
            if (auction.adminApproval === "rejected") monthlyData[monthIndex].rejected += 1;
            if (auction.adminApproval === "approved") monthlyData[monthIndex].approved += 1;
          }
        });

        setChartData(monthlyData);
      } catch (err) {
        console.error("Error loading auction performance data:", err);
      }
    }

    fetchAuctionData();
  }, [year, month]);  // Depend on both year and month

  return (
    <div className="w-full overflow-x-auto">
      <div className="min-w-[600px] sm:min-w-full">
        <ResponsiveContainer width="100%" height={320}>
          <AreaChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Area type="monotone" dataKey="active" stackId="1" stroke="#8884d8" fill="#8884d8" name="Active" />
            <Area type="monotone" dataKey="ended" stackId="1" stroke="#00C49F" fill="#00C49F" name="Ended" />
            <Area type="monotone" dataKey="cancelled" stackId="1" stroke="#ffc658" fill="#ffc658" name="Cancelled" />
            <Area type="monotone" dataKey="pendingStatus" stackId="1" stroke="#999999" fill="#cccccc" name="Pending (Status)" />
            <Area type="monotone" dataKey="approved" stackId="1" stroke="#339933" fill="#66cc66" name="Approved (Admin)" />
            <Area type="monotone" dataKey="rejected" stackId="1" stroke="#ff0000" fill="#ff6666" name="Rejected (Admin)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
