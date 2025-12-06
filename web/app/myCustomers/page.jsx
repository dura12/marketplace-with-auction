"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Search, UserCog, Mail, Phone, MapPin, Ban, Shield, Calendar } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { format } from "date-fns"

// Demo data
const demoCustomers = Array.from({ length: 10 }, (_, i) => ({
  id: `user-${i + 1}`,
  fullName: `Customer ${i + 1}`,
  email: `customer${i + 1}@example.com`,
  role: "customer",
  image: "/placeholder.svg",
  phoneNumber: "+1234567890",
  stateName: "California",
  cityName: "Los Angeles",
  isEmailVerified: Math.random() > 0.3,
  isBanned: Math.random() > 0.8,
  bannedBy: Math.random() > 0.8 ? "Admin" : null,
  createdAt: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000),
  totalOrders: Math.floor(Math.random() * 50),
  totalSpent: Math.floor(Math.random() * 10000),
}))

export default function MyCustomersPage() {
  const [customers, setCustomers] = useState(demoCustomers)
  const [filteredCustomers, setFilteredCustomers] = useState(demoCustomers)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCustomer, setSelectedCustomer] = useState(null)
  const router = useRouter()

  useEffect(() => {
    // Replace with actual API call
    // const fetchCustomers = async () => {
    //   const response = await fetch('/api/customers')
    //   const data = await response.json()
    //   setCustomers(data)
    //   setFilteredCustomers(data)
    // }
    // fetchCustomers()
  }, [])

  useEffect(() => {
    const filtered = customers.filter(
      (customer) =>
        customer.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customer.email.toLowerCase().includes(searchQuery.toLowerCase())
    )
    setFilteredCustomers(filtered)
  }, [searchQuery, customers])

  return (
    <div className="container py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">My Customers</h1>
        <div className="relative w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search customers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Orders</TableHead>
              <TableHead>Total Spent</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCustomers.map((customer) => (
              <TableRow key={customer.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={customer.image} alt={customer.fullName} />
                      <AvatarFallback>{customer.fullName.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{customer.fullName}</div>
                      <div className="text-sm text-muted-foreground">{customer.email}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  {customer.cityName}, {customer.stateName}
                </TableCell>
                <TableCell>
                  <div className="flex flex-col gap-1">
                    {customer.isBanned ? (
                      <Badge variant="destructive">Banned</Badge>
                    ) : (
                      <Badge variant="success">Active</Badge>
                    )}
                    {customer.isEmailVerified ? (
                      <Badge variant="outline" className="bg-green-50">
                        Verified
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-yellow-50">
                        Unverified
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell>{customer.totalOrders}</TableCell>
                <TableCell>${customer.totalSpent.toFixed(2)}</TableCell>
                <TableCell>{format(new Date(customer.createdAt), "MMM d, yyyy")}</TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setSelectedCustomer(customer)}
                  >
                    <UserCog className="h-4 w-4" />
                    <span className="sr-only">View details</span>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!selectedCustomer} onOpenChange={() => setSelectedCustomer(null)}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Customer Details</DialogTitle>
            <DialogDescription>
              Detailed information about the customer and their activity.
            </DialogDescription>
          </DialogHeader>
          {selectedCustomer && (
            <div className="grid gap-6">
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={selectedCustomer.image} alt={selectedCustomer.fullName} />
                  <AvatarFallback className="text-2xl">
                    {selectedCustomer.fullName.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-2xl font-bold">{selectedCustomer.fullName}</h2>
                  <p className="text-muted-foreground">{selectedCustomer.role}</p>
                </div>
              </div>

              <div className="grid gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{selectedCustomer.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{selectedCustomer.phoneNumber}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>
                      {selectedCustomer.cityName}, {selectedCustomer.stateName}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>
                      Joined {format(new Date(selectedCustomer.createdAt), "MMMM d, yyyy")}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 rounded-lg border p-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Orders</p>
                    <p className="text-2xl font-bold">{selectedCustomer.totalOrders}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Spent</p>
                    <p className="text-2xl font-bold">
                      ${selectedCustomer.totalSpent.toFixed(2)}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Account Status</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 rounded-lg border p-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Email Status</p>
                      {selectedCustomer.isEmailVerified ? (
                        <Badge variant="success">Verified</Badge>
                      ) : (
                        <Badge variant="warning">Unverified</Badge>
                      )}
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Account Status</p>
                      {selectedCustomer.isBanned ? (
                        <div className="space-y-1">
                          <Badge variant="destructive">Banned</Badge>
                          <p className="text-sm text-muted-foreground">
                            by {selectedCustomer.bannedBy}
                          </p>
                        </div>
                      ) : (
                        <Badge variant="success">Active</Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => router.push(`/customers/${selectedCustomer.id}/orders`)}
                >
                  View Orders
                </Button>
                {!selectedCustomer.isBanned && (
                  <Button variant="destructive" className="gap-2">
                    <Ban className="h-4 w-4" />
                    Ban Customer
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
