"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { Search, Filter, X, Calendar, MapPin } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Label } from "@/components/ui/label"
import { format } from "date-fns"
import DistancePicker from "../location/DistancePicker"
import { debounce } from "lodash"

interface LocationData {
  center: { lat: number; lng: number };
  radius: number;
}

interface AdsFilterProps {
  onFilterChange: (filters: any) => void
  onLocationChange: (location: LocationData) => void
  isLoading: boolean
}

export function AdsFilter({ onFilterChange, onLocationChange, isLoading }: AdsFilterProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [approvalStatus, setApprovalStatus] = useState("")
  const [paymentStatus, setPaymentStatus] = useState("")
  const [isActive, setIsActive] = useState("")
  const [dateFrom, setDateFrom] = useState<Date | undefined>(undefined)
  const [dateTo, setDateTo] = useState<Date | undefined>(undefined)
  const [locationRadius, setLocationRadius] = useState(50)
  const [isOpen, setIsOpen] = useState(false)
  const [activeFilterCount, setActiveFilterCount] = useState(0)

  // Debounced filter change handler
  const debouncedFilterChange = useMemo(
    () => debounce((filters: any) => onFilterChange(filters), 300),
    [onFilterChange]
  );

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      debouncedFilterChange.cancel();
    };
  }, [debouncedFilterChange]);

  // Calculate active filter count
  useEffect(() => {
    let count = 0
    if (approvalStatus && approvalStatus !== "ALL") count++
    if (paymentStatus && paymentStatus !== "ALL") count++
    if (isActive && isActive !== "ALL") count++
    if (dateFrom) count++
    if (dateTo) count++
    if (searchTerm) count++
    setActiveFilterCount(count)
  }, [approvalStatus, paymentStatus, isActive, dateFrom, dateTo, searchTerm])

  // Memoized filters object
  const filters = useMemo(() => ({
    approvalStatus: approvalStatus || undefined,
    paymentStatus: paymentStatus || undefined,
    searchTerm: searchTerm || undefined,
    isActive: isActive === "true" ? true : isActive === "false" ? false : undefined,
    dateRange: {
      from: dateFrom ? format(dateFrom, "yyyy-MM-dd") : undefined,
      to: dateTo ? format(dateTo, "yyyy-MM-dd") : undefined,
    },
  }), [approvalStatus, paymentStatus, searchTerm, isActive, dateFrom, dateTo]);

  // Apply filters when they change
  useEffect(() => {
    debouncedFilterChange(filters);
  }, [filters, debouncedFilterChange]);

  const clearFilters = () => {
    setSearchTerm("")
    setApprovalStatus("")
    setPaymentStatus("")
    setIsActive("")
    setDateFrom(undefined)
    setDateTo(undefined)
    setLocationRadius(50)
  }

  const handleLocationChange = useCallback(({ radius, center }: LocationData) => {
    const newRadius = Math.round(radius / 1000);
    setLocationRadius(newRadius);
    onLocationChange({ radius: newRadius * 1000, center });
  }, [onLocationChange]);

  return (
    <Card className="shadow-sm">
      <CardContent className="p-3 sm:p-4">
        <div className="space-y-4">
          <div className="flex items-center gap-3 flex-wrap justify-between">
            <div className="relative w-full lg:w-1/2 flex items-center gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search ads..."
                  className="pl-8 pr-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  disabled={isLoading}
                />
                {searchTerm && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-0"
                    onClick={() => setSearchTerm("")}
                    disabled={isLoading}
                  >
                    <X className="h-4 w-4" />
                    <span className="sr-only">Clear search</span>
                  </Button>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                disabled={isLoading}
                className="text-muted-foreground hover:text-foreground"
              >
                Clear all
              </Button>
            </div>
            <Collapsible open={isOpen} onOpenChange={setIsOpen}>
              <CollapsibleTrigger asChild>
                <Button variant="outline" size="sm" className="gap-1">
                  <Filter className="h-4 w-4" />
                  Filters
                  {activeFilterCount > 0 && (
                    <span className="ml-1 text-xs">({activeFilterCount})</span>
                  )}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-4 w-full">
                <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                  <div className="space-y-4">
                    <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Approval Status</label>
                        <Select value={approvalStatus} onValueChange={setApprovalStatus} disabled={isLoading}>
                          <SelectTrigger>
                            <SelectValue placeholder="All Statuses" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="ALL">All Statuses</SelectItem>
                            <SelectItem value="PENDING">Pending</SelectItem>
                            <SelectItem value="APPROVED">Approved</SelectItem>
                            <SelectItem value="REJECTED">Rejected</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">Payment Status</label>
                        <Select value={paymentStatus} onValueChange={setPaymentStatus} disabled={isLoading}>
                          <SelectTrigger>
                            <SelectValue placeholder="All Payment Statuses" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="ALL">All Payment Statuses</SelectItem>
                            <SelectItem value="PENDING">Pending</SelectItem>
                            <SelectItem value="PAID">Paid</SelectItem>
                            <SelectItem value="FAILED">Failed</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">Active Status</label>
                        <Select value={isActive} onValueChange={setIsActive} disabled={isLoading}>
                          <SelectTrigger>
                            <SelectValue placeholder="All Ads" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="ALL">All Ads</SelectItem>
                            <SelectItem value="true">Active</SelectItem>
                            <SelectItem value="false">Inactive</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">Created Date Range</label>
                        <div className="flex gap-2">
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                className="justify-start text-left font-normal w-[150px]"
                                disabled={isLoading}
                              >
                                <Calendar className="mr-2 h-4 w-4" />
                                {dateFrom ? format(dateFrom, "PPP") : "From date"}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <CalendarComponent
                                mode="single"
                                selected={dateFrom}
                                onSelect={setDateFrom}
                                initialFocus className={undefined} classNames={undefined}                              />
                            </PopoverContent>
                          </Popover>

                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                className="justify-start text-left font-normal w-[150px]"
                                disabled={isLoading}
                              >
                                <Calendar className="mr-2 h-4 w-4" />
                                {dateTo ? format(dateTo, "PPP") : "To date"}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <CalendarComponent
                                mode="single"
                                selected={dateTo}
                                onSelect={setDateTo}
                                initialFocus
                                disabled={(date: Date) => (dateFrom ? date < dateFrom : false)} className={undefined} classNames={undefined}                              />
                            </PopoverContent>
                          </Popover>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 justify-between">
                      <Label className="flex items-center">
                        <MapPin className="h-4 w-4 mr-1 text-red-500" />
                        Location
                      </Label>
                      <div className="flex items-center gap-2">
                        <Label className="hidden md:block">Distance (km)</Label>
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            value={locationRadius}
                            onChange={(e) => {
                              const newRadius = Number(e.target.value) || 50;
                              setLocationRadius(newRadius);
                              onLocationChange({ radius: newRadius * 1000, center: { lat: 0, lng: 0 } });
                            }}
                            min={1}
                            max={1000}
                            className="w-24"
                          />
                          <span className="text-sm text-muted-foreground">KM</span>
                        </div>
                      </div>
                    </div>
                    <div className="border rounded-md p-2">
                      <DistancePicker
                        onChange={handleLocationChange}
                        defaultRadius={locationRadius * 1000}
                      />
                    </div>
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}