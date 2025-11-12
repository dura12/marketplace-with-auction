"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RevenueBarChart } from "@/components/charts/revenur-bar-chart";
import { UserGrowthBarChart } from "@/components/charts/user-grouth-bar-chart";
import { CategoryRevenueBarChart } from "@/components/charts/category-revenue-bar-chart";
import { OrderDistributionBarChart } from "@/components/charts/order-bar-chart";
import { MonthlyReportsBarChart } from "@/components/charts/monthly-report-bar-chart";
import { ProductSalesChart } from "@/components/charts/product-sales-chart";
import { AuctionPerformanceChart } from "@/components/charts/auction-performance-chart";

interface ReportsProps {
  reportYear: string;
  setReportYear: (year: string) => void;
  reportMonth: string;
  setReportMonth: (month: string) => void;
  reportPeriod: string;
  setReportPeriod: (period: string) => void;
  shouldShowPeriod: boolean;
}

export function Reports({
  reportYear,
  setReportYear,
  reportMonth,
  setReportMonth,
  reportPeriod,
  setReportPeriod,
  shouldShowPeriod,
}: ReportsProps) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="grid gap-2 grid-cols-2 lg:grid-cols-4">
          <Select value={reportYear} onValueChange={setReportYear}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Select year" />
            </SelectTrigger>
            <SelectContent>
              {[2025, 2024].map((year) => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={reportMonth} onValueChange={setReportMonth}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Select month" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Months</SelectItem>
              {[
                "January",
                "February",
                "March",
                "April",
                "May",
                "June",
                "July",
                "August",
                "September",
                "October",
                "November",
                "December",
              ].map((name, idx) => (
                <SelectItem key={idx + 1} value={(idx + 1).toString()}>
                  {name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {shouldShowPeriod && (
            <Select value={reportPeriod} onValueChange={setReportPeriod}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="last7days">Last 7 days</SelectItem>
                <SelectItem value="last30days">Last 30 days</SelectItem>
                <SelectItem value="last90days">Last 90 days</SelectItem>
                <SelectItem value="year">Full Year</SelectItem>
              </SelectContent>
            </Select>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Monthly Financial Reports</CardTitle>
            <CardDescription>
              Revenue, profit, and expenses breakdown by month
            </CardDescription>
          </CardHeader>
          <CardContent>
            <MonthlyReportsBarChart
              year={parseInt(reportYear)}
              month={reportMonth}
              period={""}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Revenue Report</CardTitle>
            <CardDescription>Monthly revenue trends</CardDescription>
          </CardHeader>
          <CardContent>
            <RevenueBarChart
              year={parseInt(reportYear)}
              month={reportMonth}
              period={""}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>User Growth Report</CardTitle>
            <CardDescription>Monthly user growth by type</CardDescription>
          </CardHeader>
          <CardContent>
            <UserGrowthBarChart
              year={parseInt(reportYear)}
              month={reportMonth}
              period={""}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Product Sales Report</CardTitle>
            <CardDescription>
              Monthly product sales data compared to targets
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ProductSalesChart
              year={parseInt(reportYear)}
              month={reportMonth}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Auction Performance Report</CardTitle>
            <CardDescription>
              Monthly auction activity breakdown
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AuctionPerformanceChart
              year={parseInt(reportYear)}
              month={reportMonth}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Order Distribution</CardTitle>
            <CardDescription>Breakdown of Order Distribution</CardDescription>
          </CardHeader>
          <CardContent>
            <OrderDistributionBarChart
              year={parseInt(reportYear)}
              month={reportMonth}
              period={""}
            />
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Revenue by Category</CardTitle>
          <CardDescription>Top performing categories</CardDescription>
        </CardHeader>
        <CardContent>
          <CategoryRevenueBarChart
            year={parseInt(reportYear)}
            month={reportMonth}
          />
        </CardContent>
      </Card>
    </div>
  );
}
