"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowUpDown } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { Skeleton } from "@/components/ui/skeleton"
import { type OrderFilters } from "@/utils/typeDefinitions"
import { OrdersFilter } from "@/components/orders/orders-filter"

export function OrdersTable() {
  const router = useRouter()
  const [orders, setOrders] = useState<any[]>([])
  const [filteredOrders, setFilteredOrders] = useState<any[]>([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [filters, setFilters] = useState<OrderFilters>({})
  const [isFilterVisible, setIsFilterVisible] = useState(false)
  const [merchants, setMerchants] = useState<string[]>([]);
  const ordersPerPage = 10

  useEffect(() => {
    const loadOrders = async () => {
      setIsLoading(true);
      try {
        const response = await fetch("/api/order");
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result = await response.json();
        setOrders(result.orders);
        setFilteredOrders(result.orders);
        setTotalPages(Math.ceil(result.orders.length / ordersPerPage));
    
        const uniqueMerchants = Array.from(
          new Set(result.orders.map((order: { merchantDetail: { merchantName: any } }) => order.merchantDetail.merchantName))
        ) as string[];
    
        setMerchants(uniqueMerchants); 
      } catch (error) {
        console.error("Failed to fetch orders:", error);
      } finally {
        setIsLoading(false);
      }
    };
    

    loadOrders()
  }, [])

  useEffect(() => {
    // Apply filters to the orders array
    const applyFilters = () => {
      let filtered = [...orders]
  
      if (filters.searchTerm) {
        const term = filters.searchTerm.toLowerCase()
        filtered = filtered.filter(
          (order) =>
            order.customerDetail.customerName.toLowerCase().includes(term) ||
            order.transactionRef.toLowerCase().includes(term) ||
            order.merchantDetail.merchantName.toLowerCase().includes(term) ||
            order.products.some(
              (product: any) =>
                product.productName.toLowerCase().includes(term) ||
                product.delivery.toLowerCase().includes(term)
            )
        )
      }
  
      if (filters.city) {
        filtered = filtered.filter(
          (order) => order.customerDetail.address.city === filters.city
        )
      }
  
      if (filters.state) {
        filtered = filtered.filter(
          (order) => order.customerDetail.address.state === filters.state
        )
      }
  
      if (filters.status && filters.status !== "all") {
        filtered = filtered.filter((order) => order.status === filters.status)
      }
  
      if (filters.paymentStatus && filters.paymentStatus !== "all") {
        filtered = filtered.filter(
          (order) => order.paymentStatus === filters.paymentStatus
        )
      }
  
      if (filters.merchantName && filters.merchantName !== "all") {
        filtered = filtered.filter(
          (order) => order.merchantDetail.merchantName === filters.merchantName
        )
      }
  
      if (filters?.minPrice !== undefined) {
        filtered = filtered.filter((order) => order.totalPrice >= filters.minPrice!);
      }
      
      if (filters?.maxPrice !== undefined) {
        filtered = filtered.filter((order) => order.totalPrice <= filters.maxPrice!);
      }      
  
      setFilteredOrders(filtered)
      setTotalPages(Math.ceil(filtered.length / ordersPerPage))
      setPage(1)
    }

    applyFilters()
  }, [filters, orders])

  const handleFilterChange = (newFilters: OrderFilters) => {
    setFilters(newFilters)
  }

  const handleRowClick = (orderId: string) => {
    router.push(`/orders/${orderId}`)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
      case "Dispatched":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
      case "Received":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
    }
  }

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "Pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
      case "Paid":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      case "Paid To Merchant":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      case "Pending Refund":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
      case "Refunded":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "ETB",
    }).format(amount)
  }

  // Calculate orders to display for current page
  const startIndex = (page - 1) * ordersPerPage
  const paginatedOrders = filteredOrders.slice(
    startIndex,
    startIndex + ordersPerPage
  )

  return (
    <div className="space-y-4">
      <div className="block sm:hidden">
        <label>
          <input
            type="checkbox"
            checked={isFilterVisible}
            onChange={() => setIsFilterVisible(!isFilterVisible)}
          />
          Show Filters
        </label>
      </div>
      <div className={`sm:block ${isFilterVisible ? "block" : "hidden"}`}>
        <OrdersFilter
          onFilterChange={handleFilterChange}
          isLoading={isLoading}
          merchants={merchants}
        />      
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="hidden sm:table-cell w-[180px]">
                <div className="flex items-center space-x-1">
                  <span>Transaction Ref</span>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <ArrowUpDown className="h-4 w-4" />
                  </Button>
                </div>
              </TableHead>
              <TableHead>Customer</TableHead>
              <TableHead className="hidden sm:table-cell">Merchant</TableHead>
              <TableHead>
                <div className="flex items-center space-x-1">
                  <span>Amount</span>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <ArrowUpDown className="h-4 w-4" />
                  </Button>
                </div>
              </TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="hidden sm:table-cell">Payment</TableHead>
              <TableHead className="hidden sm:table-cell">
                <div className="flex items-center space-x-1">
                  <span>Date</span>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <ArrowUpDown className="h-4 w-4" />
                  </Button>
                </div>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array(5)
                .fill(null)
                .map((_, index) => (
                  <TableRow key={index}>
                    <TableCell className="hidden sm:table-cell">
                      <Skeleton className="h-5 w-24" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-5 w-32" />
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <Skeleton className="h-5 w-32" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-5 w-20" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-5 w-24" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-5 w-28" />
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <Skeleton className="h-5 w-36" />
                    </TableCell>
                  </TableRow>
                ))
            ) : paginatedOrders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  No orders found.
                </TableCell>
              </TableRow>
            ) : (
              paginatedOrders.map((order) => (
                <TableRow
                  key={order.id}
                  onClick={() => handleRowClick(order._id)}
                  className="cursor-pointer hover:bg-muted/50"
                >
                  <TableCell className="hidden sm:table-cell font-medium">
                    {order.transactionRef}
                  </TableCell>
                  <TableCell>{order.customerDetail.customerName}</TableCell>
                  <TableCell className="hidden sm:table-cell">
                    {order.merchantDetail.merchantName}
                  </TableCell>
                  <TableCell>{formatCurrency(order.totalPrice)}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={getStatusColor(order.status)}>
                      {order.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <Badge
                      variant="outline"
                      className={getPaymentStatusColor(order.paymentStatus)}
                    >
                      {order.paymentStatus}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    {formatDate(order.orderDate)}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        <div className="p-4 border-t">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className={page <= 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNumber = i + 1
                return (
                  <PaginationItem key={pageNumber}>
                    <PaginationLink
                      onClick={() => setPage(pageNumber)}
                      isActive={page === pageNumber}
                    >
                      {pageNumber}
                    </PaginationLink>
                  </PaginationItem>
                )
              })}
              <PaginationItem>
                <PaginationNext
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className={
                    page >= totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </div>
    </div>
  )
}

