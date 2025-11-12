"use client"

import Link from "next/link"
import {
  BarChart3,
  Users,
  ShoppingCart,
  Package,
  Layers,
  Gavel,
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
  ShieldCheck,
  Bell,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RevenueChart } from "@/components/charts/revenue-chart"
import { UserDistributionChart } from "@/components/charts/user-distribution-chart"
import { RevenueDistributionChart } from "@/components/charts/revenue-distribution-chart"
import { CategoryRevenueChart } from "@/components/charts/category-revenue-chart"
import { OrderDistributionPieChart } from "@/components/charts/order-distribution-chart"
import { Sale } from "@/utils/typeDefinitions"

interface OverviewProps {
  stats: any
  recentSales: Sale[]
  salesThisMonth: number
}

export function Overview({ stats, recentSales, salesThisMonth }: OverviewProps) {
  const renderStatsCards = () => (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Link href="/transactions" className="block">
        <Card className="transition-all hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.transactions.total.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <span
                className={`flex items-center ${stats.transactions.isIncrease ? "text-green-500" : "text-red-500"}`}
              >
                {stats.transactions.isIncrease ? "+" : "-"}
                {stats.transactions.percentChange}%{" "}
                {stats.transactions.isIncrease ? (
                  <ArrowUpRight className="ml-1 h-3 w-3" />
                ) : (
                  <ArrowDownRight className="ml-1 h-3 w-3" />
                )}
              </span>{" "}
              from last month
            </p>
          </CardContent>
        </Card>
      </Link>

      <Link href="/" className="block">
        <Card className="transition-all hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Revenue</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.revenue.total.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <span className={`flex items-center ${stats.revenue.isIncrease ? "text-green-500" : "text-red-500"}`}>
                {stats.revenue.isIncrease ? "+" : "-"}
                {stats.revenue.percentChange}%{" "}
                {stats.revenue.isIncrease ? (
                  <ArrowUpRight className="ml-1 h-3 w-3" />
                ) : (
                  <ArrowDownRight className="ml-1 h-3 w-3" />
                )}
              </span>{" "}
              from last month
            </p>
          </CardContent>
        </Card>
      </Link>

      <Link href="/users?role=merchant" className="block relative">
        {stats.merchants.pendingApproval > 0 && (
          <span className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white z-10">
            {stats.merchants.pendingApproval}
          </span>
        )}
        <Card className="transition-all hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Merchants
              {stats.merchants.pendingApproval > 0 && (
                <span className="ml-2 text-red-500">
                  <Bell className="inline h-3 w-3" />
                </span>
              )}
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2。近2xl font-bold">+{stats.merchants.total}</div>
            <p className="text-xs text-muted-foreground">
              <span className={`flex items-center ${stats.merchants.isIncrease ? "text-green-500" : "text-red-500"}`}>
                {stats.merchants.isIncrease ? "+" : "-"}
                {stats.merchants.percentChange}%{" "}
                {stats.merchants.isIncrease ? (
                  <ArrowUpRight className="ml-1 h-3 w-3" />
                ) : (
                  <ArrowDownRight className="ml-1 h-3 w-3" />
                )}
              </span>{" "}
              from last month
            </p>
          </CardContent>
        </Card>
      </Link>

      <Link href="/users?role=customer" className="block">
        <Card className="transition-all hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{stats.customers.total}</div>
            <p className="text-xs text-muted-foreground">
              <span className={`flex items-center ${stats.customers.isIncrease ? "text-green-500" : "text-red-500"}`}>
                {stats.customers.isIncrease ? "+" : "-"}
                {stats.customers.percentChange}%{" "}
                {stats.customers.isIncrease ? (
                  <ArrowUpRight className="ml-1 h-3 w-3" />
                ) : (
                  <ArrowDownRight className="ml-1 h-3 w-3" />
                )}
              </span>{" "}
              from last month
            </p>
          </CardContent>
        </Card>
      </Link>

      <Link href="/users" className="block">
        <Card className="transition-all hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total System Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.users.total}</div>
            <p className="text-xs text-muted-foreground">
              <span className={`flex items-center ${stats.users.isIncrease ? "text-green-500" : "text-red-500"}`}>
                {stats.users.isIncrease ? "+" : "-"}
                {stats.users.percentChange}%{" "}
                {stats.users.isIncrease ? (
                  <ArrowUpRight className="ml-1 h-3 w-3" />
                ) : (
                  <ArrowDownRight className="ml-1 h-3 w-3" />
                )}
              </span>{" "}
              from last month
            </p>
          </CardContent>
        </Card>
      </Link>

      <Link href="/products" className="block">
        <Card className="transition-all hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.products.total.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <span className={`flex items-center ${stats.products.isIncrease ? "text-green-500" : "text-red-500"}`}>
                {stats.products.isIncrease ? "+" : "-"}
                {stats.products.percentChange}%{" "}
                {stats.products.isIncrease ? (
                  <ArrowUpRight className="ml-1 h-3 w-3" />
                ) : (
                  <ArrowDownRight className="ml-1 h-3 w-3" />
                )}
              </span>{" "}
              from last month
            </p>
          </CardContent>
        </Card>
      </Link>

      <Link href="/orders" className="block relative">
        {stats.orders.pendingRefunds > 0 && (
          <span className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white z-10">
            {stats.orders.pendingRefunds}
          </span>
        )}
        <Card className="transition-all hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Orders
              {stats.orders.pendingRefunds > 0 && (
                <span className="ml-2 text-red-500">
                  <Bell className="inline h-3 w-3" />
                </span>
              )}
            </CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{stats.orders.total.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <span className={`flex items-center ${stats.orders.isIncrease ? "text-green-500" : "text-red-500"}`}>
                {stats.orders.isIncrease ? "+" : "-"}
                {stats.orders.percentChange}%{" "}
                {stats.orders.isIncrease ? (
                  <ArrowUpRight className="ml-1 h-3 w-3" />
                ) : (
                  <ArrowDownRight className="ml-1 h-3 w-3" />
                )}
              </span>{" "}
              from last month
            </p>
          </CardContent>
        </Card>
      </Link>

      <Link href="/auctions" className="block relative">
        {stats.auctions.pendingApproval > 0 && (
          <span className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white z-10">
            {stats.auctions.pendingApproval}
          </span>
        )}
        <Card className="transition-all hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Auctions
              {stats.auctions.pendingApproval > 0 && (
                <span className="ml-2 text-red-500">
                  <Bell className="inline h-3 w-3" />
                </span>
              )}
            </CardTitle>
            <Gavel className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{stats.auctions.total}</div>
            <p className="text-xs text-muted-foreground">
              <span className={`flex items-center ${stats.auctions.isIncrease ? "text-green-500" : "text-red-500"}`}>
                {stats.auctions.isIncrease ? "+" : "-"}
                {Math.abs(stats.auctions.percentChange)}%{" "}
                {stats.auctions.isIncrease ? (
                  <ArrowUpRight className="ml-1 h-3 w-3" />
                ) : (
                  <ArrowDownRight className="ml-1 h-3 w-3" />
                )}
              </span>{" "}
              from last month
            </p>
          </CardContent>
        </Card>
      </Link>

      <Link href="/categories" className="block">
        <Card className="transition-all hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Categories</CardTitle>
            <Layers className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.categories.total}</div>
            <p className="text-xs text-muted-foreground">
              <span className={`flex items-center ${stats.categories.isIncrease ? "text-green-500" : "text-red-500"}`}>
                {stats.categories.isIncrease ? "+" : "-"}
                {stats.categories.percentChange}{" "}
                {stats.categories.isIncrease ? (
                  <ArrowUpRight className="ml-1 h-3 w-3" />
                ) : (
                  <ArrowDownRight className="ml-1 h-3 w-3" />
                )}
              </span>{" "}
              from last month
            </p>
          </CardContent>
        </Card>
      </Link>

      <Link href="/admins" className="block">
        <Card className="transition-all hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Admins</CardTitle>
            <ShieldCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.admins.total}</div>
            <p className="text-xs text-muted-foreground">
              <span className={`flex items-center ${stats.admins.isIncrease ? "text-green-500" : "text-red-500"}`}>
                {stats.admins.isIncrease ? "+" : "-"}
                {stats.admins.percentChange}{" "}
                {stats.admins.isIncrease ? (
                  <ArrowUpRight className="ml-1 h-3 w-3" />
                ) : (
                  <ArrowDownRight className="ml-1 h-3 w-3" />
                )}
              </span>{" "}
              from last month
            </p>
          </CardContent>
        </Card>
      </Link>
    </div>
  )

  const renderRecentSales = () => (
    <Card>
      <CardHeader>
        <CardTitle>Recent Sales</CardTitle>
        <CardDescription>
          You made {salesThisMonth} {salesThisMonth === 1 ? "sale" : "sales"} this month.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 justify-end">
          {recentSales.length > 0 ? (
            recentSales.map((sale, i) => (
              <div className="flex items-center space-x-4 justify-between" key={sale._id || i}>
                <div className="space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {sale.customerDetail?.customerName || "Unknown Customer"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {sale.customerDetail?.customerEmail || "No email"}
                  </p>
                </div>
                <div className="ml-auto font-medium">
                  +${(Number(sale.totalPrice) || 0).toFixed(2)}
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground col-span-2">No recent sales found.</p>
          )}
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="space-y-4">
      {renderStatsCards()}
      <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Revenue Overview</CardTitle>
            <CardDescription>Monthly revenue and order trends</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <RevenueChart />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>User Distribution</CardTitle>
            <CardDescription>Breakdown by user type</CardDescription>
          </CardHeader>
          <CardContent>
            <UserDistributionChart />
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Revenue Distribution</CardTitle>
            <CardDescription>Breakdown by revenue source</CardDescription>
          </CardHeader>
          <CardContent>
            <RevenueDistributionChart />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Revenue by Category</CardTitle>
            <CardDescription>Top performing categories</CardDescription>
          </CardHeader>
          <CardContent>
            <CategoryRevenueChart />
          </CardContent>
        </Card>
        {/* <Card>
          <CardHeader>
            <CardTitle>Transaction Distribution</CardTitle>
            <CardDescription>Breakdown by transaction types</CardDescription>
          </CardHeader>
          <CardContent>
            <TransactionTypeDistributionChart />
          </CardContent>
        </Card> */}
      </div>
      <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Order Distribution</CardTitle>
            <CardDescription>Order classification</CardDescription>
          </CardHeader>
          <CardContent>
            <OrderDistributionPieChart />
          </CardContent>
        </Card>
      </div>
      {renderRecentSales()}
    </div>
  )
}