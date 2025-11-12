"use client"

import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useEffect, useState } from "react"

interface UserFiltersProps {
  searchTerm: string
  setSearchTerm: (value: string) => void
  roleFilter?: string
  setRoleFilter?: (value: string) => void
  statusFilter?: string
  setStatusFilter?: (value: string) => void
  approvalStatusFilter?: string
  setApprovalStatusFilter?: (value: string) => void
  showRoleFilter: boolean
  showStatusFilter: boolean
  showApprovalStatusFilter: boolean
}

export function UserFilters({
  searchTerm,
  setSearchTerm,
  roleFilter,
  setRoleFilter,
  statusFilter,
  setStatusFilter,
  approvalStatusFilter,
  setApprovalStatusFilter,
  showRoleFilter,
  showStatusFilter,
  showApprovalStatusFilter
}: UserFiltersProps) {
  const [defaultRoleFilter, setDefaultRoleFilter] = useState<string>('all'); // Set default as 'all'

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const roleParam = urlParams.get('role'); // Look for the 'role' query paramete

    if (roleParam) {
      setDefaultRoleFilter(roleParam); // Set defaultRoleFilter to 'merchants' or 'customers'
    }
  }, []);

  useEffect(() => {
    if (setRoleFilter) {
      setRoleFilter(defaultRoleFilter); // Set the role filter to the determined default value
    }
  }, [defaultRoleFilter, setRoleFilter]);

  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div className="relative w-full md:w-auto">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search here"
          className="pl-8 w-full"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="flex flex-wrap gap-2">
        {showRoleFilter && roleFilter && setRoleFilter && (
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="customer">Customer</SelectItem>
              <SelectItem value="merchant">Merchant</SelectItem>
            </SelectContent>
          </Select>
        )}

        {showStatusFilter && statusFilter && setStatusFilter && (
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Verification Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Verification</SelectItem>
              <SelectItem value="verified">Verified</SelectItem>
              <SelectItem value="unverified">Unverified</SelectItem>
              <SelectItem value="banned">Banned</SelectItem>
           </SelectContent>
          </Select>
        )}

        {showApprovalStatusFilter && approvalStatusFilter && setApprovalStatusFilter && (
          <Select value={approvalStatusFilter} onValueChange={setApprovalStatusFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Approval Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        )}
      </div>
    </div>
  )
}
