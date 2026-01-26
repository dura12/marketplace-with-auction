"use client"

import { useState, useEffect } from "react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useToast } from "@/components/ui/use-toast"
import { format } from "date-fns"

export function RecentSales() {
  const [sales, setSales] = useState([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    const fetchSales = async () => {
      try {
        const response = await fetch('/api/merchant/recent-sales')
        if (!response.ok) throw new Error('Failed to fetch recent sales')
        const data = await response.json()
        setSales(data)
      } catch (error) {
        console.error('Error fetching recent sales:', error)
        toast({
          title: "Error",
          description: "Failed to load recent sales",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchSales()
  }, [toast])

  if (loading) {
    return (
      <div className="rounded-xl border bg-card p-6">
        <div className="space-y-2">
          <h3 className="text-xl font-semibold">Recent Sales</h3>
          <p className="text-sm text-muted-foreground">Loading recent transactions...</p>
        </div>
        <div className="mt-6 flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  if (!sales.length) {
    return (
      <div className="rounded-xl border bg-card p-6">
        <div className="space-y-2">
          <h3 className="text-xl font-semibold">Recent Sales</h3>
          <p className="text-sm text-muted-foreground">No recent transactions found</p>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-xl border bg-card p-6">
      <div className="space-y-2">
        <h3 className="text-xl font-semibold">Recent Sales</h3>
        <p className="text-sm text-muted-foreground">Latest transactions from your store</p>
      </div>
      <div className="mt-6 space-y-6">
        {sales.map((sale, index) => (
          <div key={index} className="flex items-center">
            <Avatar className="h-9 w-9">
              <AvatarFallback>{sale.customerInitials}</AvatarFallback>
            </Avatar>
            <div className="ml-4 space-y-1">
              <p className="text-sm font-medium leading-none">{sale.customerName}</p>
              <div className="flex items-center gap-2">
                <p className="text-sm text-muted-foreground">{sale.productName}</p>
                <span className="text-xs text-muted-foreground">
                  {format(new Date(sale.date), 'MMM d, yyyy')}
                </span>
              </div>
            </div>
            <div className="ml-auto font-medium">
              +${sale.amount.toFixed(2)}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

