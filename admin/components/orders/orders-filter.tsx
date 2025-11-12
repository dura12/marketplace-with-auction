"use client"

import { useEffect, useState } from "react"
import { Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { OrderFilters } from "@/utils/typeDefinitions"
import {
  CitySelect,
  CountrySelect,
  StateSelect,
  LanguageSelect,
  RegionSelect,
  PhonecodeSelect
} from "react-country-state-city";

interface OrdersFilterProps {
  onFilterChange: (filters: OrderFilters) => void
  isLoading: boolean;
  merchants: string[];
}

export function OrdersFilter({
  onFilterChange,
  isLoading,
  merchants,
}: OrdersFilterProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [status, setStatus] = useState("")
  const [paymentStatus, setPaymentStatus] = useState("")
  const [merchantName, setMerchantName] = useState("")
  const [minPrice, setMinPrice] = useState<string>("")
  const [maxPrice, setMaxPrice] = useState<string>("")

  const applyFilters = () => {
    const filters: OrderFilters = {
      searchTerm: searchTerm || undefined,
      status: status || undefined,
      paymentStatus: paymentStatus || undefined,
      merchantName: merchantName || undefined,
      minPrice: minPrice ? Number.parseFloat(minPrice) : undefined,
      maxPrice: maxPrice ? Number.parseFloat(maxPrice) : undefined,
    }

    onFilterChange(filters)
  }

  console.log("Merchants: ", merchants);

  useEffect(() => {
    const timer = setTimeout(() => {
      applyFilters()
    }, 300) // 300ms debounce

    return () => clearTimeout(timer)
  }, [searchTerm])

  useEffect(() => {
    applyFilters()
  }, [status, paymentStatus, merchantName])

  useEffect(() => {
    const timer = setTimeout(() => {
      applyFilters()
    }, 500) // 500ms debounce for price changes

    return () => clearTimeout(timer)
  }, [minPrice, maxPrice])

  const clearFilters = () => {
    setSearchTerm("")
    setStatus("")
    setPaymentStatus("")
    setMerchantName("")
    setMinPrice("")
    setMaxPrice("")
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="grid grid-cols-2 lg:flex flex-wrap items-end gap-4 w-full">
          {/* Search Input */}
          <div className="relative col-span-2 lg:col-auto">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search orders by customer, transaction ref, or product..."
              className="pl-8 w-full lg:w-[300px]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              disabled={isLoading}
            />
          </div>

          {/* Order Status */}
          <div className="space-y-1">
            <label className="text-sm font-medium">Order Status</label>
            <div className="w-full lg:w-[170px]">
              <Select value={status} onValueChange={setStatus} disabled={isLoading}>
                <SelectTrigger>
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Dispatched">Dispatched</SelectItem>
                  <SelectItem value="Received">Received</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Payment Status */}
          <div className="space-y-1">
            <label className="text-sm font-medium">Payment Status</label>
            <div className="w-full lg:w-[170px]">
              <Select value={paymentStatus} onValueChange={setPaymentStatus} disabled={isLoading}>
                <SelectTrigger>
                  <SelectValue placeholder="All Payment Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Payment Statuses</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Paid">Paid</SelectItem>
                  <SelectItem value="Paid To Merchant">Paid To Merchant</SelectItem>
                  <SelectItem value="Pending Refund">Pending Refund</SelectItem>
                  <SelectItem value="Refunded">Refunded</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Merchant */}
          <div className="space-y-1">
            <label className="text-sm font-medium">Merchant</label>
            <div className="w-full lg:w-[170px]">
              <Select value={merchantName} onValueChange={setMerchantName} disabled={isLoading}>
                <SelectTrigger>
                  <SelectValue placeholder="All Merchants" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Merchants</SelectItem>
                  {merchants.map((merchant) => (
                    <SelectItem key={merchant} value={merchant}>
                      {merchant}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Min Price */}
          <div className="space-y-1">
            <label className="text-sm font-medium">Min Price</label>
            <Input
              type="number"
              placeholder="Min"
              className="w-full lg:w-[100px]"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              disabled={isLoading}
            />
          </div>

          {/* Max Price */}
          <div className="space-y-1">
            <label className="text-sm font-medium">Max Price</label>
            <Input
              type="number"
              placeholder="Max"
              className="w-full lg:w-[100px]"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              disabled={isLoading}
            />
          </div>

          {/* Clear Button */}
          <div className="col-span-2 lg:ml-auto">
            <Button variant="outline" onClick={clearFilters} disabled={isLoading}>
              Clear Filters
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
