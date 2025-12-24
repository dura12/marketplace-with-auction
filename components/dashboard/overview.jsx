
"use client";

import { useState, useEffect } from "react";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, PieChart, Pie, Cell } from "recharts";
import { ArrowUpRight, ArrowDownRight, Users, Package, DollarSign, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { RecentSales } from "./recent-sales";
import { useToast } from "@/components/ui/use-toast";

const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#0088fe"];

export default function Overview() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/merchant/overview');
        if (!response.ok) throw new Error('Failed to fetch overview data');
        const result = await response.json();
        setData(result);
      } catch (error) {
        console.error('Error fetching overview data:', error);
        toast({
          title: "Error",
          description: "Failed to load overview data",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [toast]);

  if (loading) {
    return (
      <div className="container p-6">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          <span className="ml-4">Loading overview...</span>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="container p-6">
        <div className="text-center">
          <p className="text-muted-foreground">No data available</p>
        </div>
      </div>
    );
  }

  const metrics = [
    { title: "Total Revenue", value: `$${data.metrics.totalRevenue}`, change: "+12.5%", trend: "up", icon: DollarSign },
    { title: "Total Orders", value: data.metrics.totalOrders, change: "+8.2%", trend: "up", icon: Package },
    { title: "Avg. Order Value", value: `$${data.metrics.avgOrderValue}`, change: "-3.1%", trend: "down", icon: DollarSign },
    { title: "Conversion Rate", value: data.metrics.conversionRate, change: "+0.5%", trend: "up", icon: TrendingUp },
  ];

  return (
    <div className="container p-6">
      <div className="mb-6">
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight">Overview</h2>
        <p className="text-sm sm:text-base text-muted-foreground">Dashboard overview of your merchant metrics</p>
      </div>
      <div className="rounded-xl border bg-card p-4 md:p-6 mt-4">
        <div className="space-y-6">
          {/* Metrics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
            {metrics.map((metric, index) => (
              <Card key={index}>
                <CardContent className="p-4 flex justify-between items-center">
                  <div>
                    <p className="text-sm text-muted-foreground">{metric.title}</p>
                    <p className="text-2xl font-bold mt-1">{metric.value}</p>
                    <div className="flex items-center mt-1">
                      {metric.trend === "up" ? (
                        <ArrowUpRight className="h-4 w-4 text-success mr-1" />
                      ) : (
                        <ArrowDownRight className="h-4 w-4 text-destructive mr-1" />
                      )}
                      <span className={metric.trend === "up" ? "text-success text-sm" : "text-destructive text-sm"}>
                        {metric.change}
                      </span>
                    </div>
                  </div>
                  <div className="bg-primary/10 p-3 rounded-full">
                    <metric.icon className="h-5 w-5 text-primary" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Recent Sales */}
          <RecentSales />

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="rounded-xl border bg-card p-4">
              <h3 className="text-lg font-semibold">Revenue Overview</h3>
              <div className="flex justify-between text-sm text-muted-foreground">
                <p>Monthly revenue from all sales channels</p>
                <p className="text-lg font-bold">${data.metrics.totalRevenue}</p>
              </div>
              <div className="h-52 mt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.monthlyData}>
                    <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
                    <Tooltip />
                    <Bar dataKey="total" fill="#8884d8" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="rounded-xl border bg-card p-4">
              <h3 className="text-lg font-semibold">Sales by Category</h3>
              <p className="text-sm text-muted-foreground">Distribution of sales across product categories</p>
              <div className="h-52 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart className="my-4">
                    <Pie data={data.categoryData} cx="50%" cy="50%" outerRadius={80} fill="#8884d8" dataKey="value">
                      {data.categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Additional Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <h4 className="text-sm font-medium text-muted-foreground">Top Selling Item</h4>
                <p className="text-lg font-semibold mt-1">{data.topSellingProduct?.name || "No sales yet"}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {data.topSellingProduct ? `${data.topSellingProduct.unitsSold} units sold this month` : "No sales data available"}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <h4 className="text-sm font-medium text-muted-foreground">Highest Bid</h4>
                <p className="text-lg font-semibold mt-1">{data.highestBid?.name || "No active auctions"}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {data.highestBid ? `$${data.highestBid.currentBid} current bid` : "No active auctions"}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <h4 className="text-sm font-medium text-muted-foreground">Customer Satisfaction</h4>
                <p className="text-lg font-semibold mt-1">{data.customerSatisfaction}</p>
                <p className="text-sm text-muted-foreground mt-1">Based on customer reviews</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}