"use client";

import { useState, useEffect } from "react";
import { Sidebar } from "@/components/sidebar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Toaster } from "@/components/toaster";
import { fetchDashboardStats } from "@/utils/data-fetching";
import { Sale } from "@/utils/typeDefinitions";
import { Overview } from "@/components/dashboard/Overview";
import { Analytics } from "@/components/dashboard/Analytics";
import { Reports } from "@/components/dashboard/Reports";

const currentYear = new Date().getFullYear();
const currentMonth = new Date().getMonth() + 1;

export default function DashboardClient() {
  const [stats, setStats] = useState<any>(null);
  const [recentSales, setRecentSales] = useState<Sale[]>([]);
  const [salesThisMonth, setSalesThisMonth] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [analyticsYear, setAnalyticsYear] = useState("");
  const [currentYearState, setCurrentYearState] = useState("");
  const [reportYear, setReportYear] = useState(currentYear.toString());
  const [reportMonth, setReportMonth] = useState(currentMonth.toString());
  const [reportPeriod, setReportPeriod] = useState("last30days");

  useEffect(() => {
    async function loadData() {
      const dashboardStats = await fetchDashboardStats();
      setStats(dashboardStats);
    }
    loadData();
  }, []);

  useEffect(() => {
    const fetchRecentSales = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/order");
        if (!response.ok) {
          throw new Error("Failed to fetch orders");
        }
        const data = await response.json();
        const orders = Array.isArray(data.orders) ? data.orders : [];

        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        const salesThisMonth = orders.filter(
          (order: {
            orderDate: string | number | Date;
            paymentStatus: string;
          }) => {
            const orderDate = new Date(order.orderDate);
            return (
              !isNaN(orderDate.getTime()) &&
              orderDate.getMonth() === currentMonth &&
              orderDate.getFullYear() === currentYear &&
              ["Paid", "Paid To Merchant"].includes(order.paymentStatus)
            );
          }
        ).length;

        const recentSales = orders
          .filter((order: { paymentStatus: string }) =>
            ["Paid", "Paid To Merchant"].includes(order.paymentStatus)
          )
          .sort(
            (
              a: { orderDate: string | number | Date },
              b: { orderDate: string | number | Date }
            ) =>
              new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime()
          )
          .slice(0, 10);

        setSalesThisMonth(salesThisMonth);
        setRecentSales(recentSales);
      } catch (err) {
        console.error("Error fetching recent sales:", err);
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("Failed to load sales");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchRecentSales();
  }, []);

  useEffect(() => {
    const year = new Date().getFullYear().toString();
    setCurrentYearState(year);
    setAnalyticsYear(year);
  }, []);

  useEffect(() => {
    if (reportYear !== currentYearState) {
      setReportMonth("1");
    } else {
      setReportMonth(currentMonth.toString());
    }
  }, [reportYear, currentYearState]);

  const shouldShowPeriod =
    reportYear === currentYearState && reportMonth === currentMonth.toString();

  if (!stats) {
    return (
      <div className="flex min-h-screen flex-col">
        <Sidebar />
        <div className="flex-1 md:ml-[var(--sidebar-width)] lg:-mt-12 -mt-8">
          <main className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            </div>
            <div className="flex items-center justify-center h-[80vh]">
              <div className="text-center">
                <h2 className="text-xl font-semibold mb-2">
                  Loading dashboard data...
                </h2>
                <p className="text-muted-foreground">
                  Please wait while we fetch the latest statistics
                </p>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Sidebar />
      <div className="flex-1 md:ml-[calc(var(--sidebar-width)-40px)] md:-mt-12 -mt-8">
        <main className="flex-1 space-y-4 p-4 md:p-8 pt-6">
          <div className="flex items-center justify-between">
            <h1 className="text-xl md:text-3xl font-bold tracking-tight">
              Dashboard
            </h1>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                Last updated: {new Date().toLocaleDateString()}
              </span>
            </div>
          </div>

          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList className="w-full sm:w-auto">
              <TabsTrigger value="overview" className="flex-1 sm:flex-none">
                Overview
              </TabsTrigger>
              <TabsTrigger value="analytics" className="flex-1 sm:flex-none">
                Analytics
              </TabsTrigger>
              <TabsTrigger value="reports" className="flex-1 sm:flex-none">
                Reports
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <Overview
                stats={stats}
                recentSales={recentSales}
                salesThisMonth={salesThisMonth}
              />
            </TabsContent>

            <TabsContent value="analytics" className="space-y-4">
              <Analytics initialYear={analyticsYear} />
            </TabsContent>

            <TabsContent value="reports" className="space-y-4">
              <Reports
                reportYear={reportYear}
                setReportYear={setReportYear}
                reportMonth={reportMonth}
                setReportMonth={setReportMonth}
                reportPeriod={reportPeriod}
                setReportPeriod={setReportPeriod}
                shouldShowPeriod={shouldShowPeriod}
              />
            </TabsContent>
          </Tabs>
        </main>
      </div>
      <Toaster />
    </div>
  );
}
