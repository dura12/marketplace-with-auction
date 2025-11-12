"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { UserGrowthChart } from "@/components/charts/user-growth-chart"
import { RevenueChart } from "@/components/charts/revenue-chart"
import { ProductSalesChart } from "@/components/charts/product-sales-chart"
import { AuctionPerformanceChart } from "@/components/charts/auction-performance-chart"

interface AnalyticsProps {
  initialYear: string
}

export function Analytics({ initialYear }: AnalyticsProps) {
  const [analyticsYear, setAnalyticsYear] = useState(initialYear)

  useEffect(() => {
    setAnalyticsYear(initialYear)
  }, [initialYear])

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap gap-2">
          <Select
            value={analyticsYear}
            onValueChange={setAnalyticsYear}
            defaultValue={initialYear}
          >
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Select year" />
            </SelectTrigger>
            <SelectContent>
              {[...Array(2025 - 2024 + 1)].map((_, i) => {
                const year = 2025 - i
                return <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
              })}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>User Growth</CardTitle>
            <CardDescription>New user registrations over time</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <UserGrowthChart year={parseInt(analyticsYear)} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sales Performance</CardTitle>
            <CardDescription>Revenue and order trends</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="h-[300px] w-full">
              <RevenueChart year={parseInt(analyticsYear)} />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Product Sales</CardTitle>
          <CardDescription>Monthly product sales data compared to targets</CardDescription>
        </CardHeader>
        <CardContent>
          <ProductSalesChart year={parseInt(analyticsYear)} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Auction Performance</CardTitle>
          <CardDescription>Monthly auction activity breakdown</CardDescription>
        </CardHeader>
        <CardContent>
          <AuctionPerformanceChart year={parseInt(analyticsYear)} />
        </CardContent>
      </Card>
    </div>
  )
}