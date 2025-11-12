// "use client"

// import { useState, useEffect } from "react"
// import { Search, Filter } from "lucide-react"
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
// import { Input } from "@/components/ui/input"
// import { Button } from "@/components/ui/button"
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
// import { AuctionTable } from "@/components/auctions/auction-table"
// import { AuctionPagination } from "@/components/auctions/auction-pagination"
// import { useToast } from "@/components/ui/use-toast"
// import { fetchAuctions, approveAuction, rejectAuction } from "@/utils/data-fetching"
// import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
// import { Slider } from "@/components/ui/slider"
// import { Label } from "@/components/ui/label"

// export function AuctionManagementContent() {
//   const [isLoading, setIsLoading] = useState(true)
//   const [auctions, setAuctions] = useState<any[]>([])
//   const [searchQuery, setSearchQuery] = useState("")
//   const [statusFilter, setStatusFilter] = useState("all")
//   const [conditionFilter, setConditionFilter] = useState("all")
//   const [priceRange, setPriceRange] = useState([0, 10000])
//   const [dateRange, setDateRange] = useState({
//     start: "",
//     end: "",
//   })
//   const [currentPage, setCurrentPage] = useState(1)
//   const [totalPages, setTotalPages] = useState(1)
//   const { toast } = useToast()

//   const itemsPerPage = 15

//   useEffect(() => {
//     loadAuctions()
//   }, []) // Only currentPage is needed here

//   const loadAuctions = async () => {
//     setIsLoading(true)
//     try {
//       const response = await fetchAuctions({
//         page: currentPage,
//         limit: itemsPerPage,
//         search: searchQuery,
//         status: statusFilter,
//         condition: conditionFilter,
//         priceMin: priceRange[0],
//         priceMax: priceRange[1],
//         startDate: dateRange.start,
//         endDate: dateRange.end,
//       })

//       setAuctions(response.auctions)
//       setTotalPages(Math.ceil(response.total / itemsPerPage))
//     } catch (error) {
//       toast({
//         title: "Error",
//         description: "Failed to load auctions. Please try again.",
//         variant: "destructive",
//       })
//     } finally {
//       setIsLoading(false)
//     }
//   }

//   const handleAuctionAction = async (type: string, auctionId: string, rejectionReason?: string) => {
//     try {
//       switch (type) {
//         case "approve":
//           await approveAuction(auctionId)
//           toast({ title: "Auction approved successfully" })
//           break
//         case "reject":
//           await rejectAuction(auctionId, rejectionReason)
//           toast({ title: "Auction rejected successfully" })
//           break
//       }
//       loadAuctions()
//     } catch (error) {
//       toast({
//         title: "Error",
//         description: `Failed to ${type} auction. Please try again.`,
//         variant: "destructive",
//       })
//     }
//   }

//   const handleViewAuction = (auction: any) => {
//     // This is just a placeholder for now
//     // The actual view happens in the AuctionDetailsDialog component
//   }

//   const formatPriceLabel = (value: number) => {
//     return `$${value.toLocaleString()}`
//   }

//   return (
//     <main className="flex-1 space-y-4 p-4 md:p-8 pt-6">
//       <div className="flex items-center justify-between">
//         <h1 className="text-3xl font-bold tracking-tight">Auction Management</h1>
//         <div className="flex items-center gap-2">
//           <span className="text-sm text-muted-foreground">Total Auctions: {totalPages * itemsPerPage}</span>
//         </div>
//       </div>

//       <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
//         <div className="flex flex-1 items-center gap-2">
//           <div className="relative flex-1 md:max-w-sm">
//             <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
//             <Input
//               type="search"
//               placeholder="Search auctions..."
//               className="pl-8"
//               value={searchQuery}
//               onChange={(e) => setSearchQuery(e.target.value)}
//             />
//           </div>

//           <Popover>
//             <PopoverTrigger asChild>
//               <Button variant="outline" size="icon">
//                 <Filter className="h-4 w-4" />
//                 <span className="sr-only">Filter</span>
//               </Button>
//             </PopoverTrigger>
//             <PopoverContent className="w-80">
//               <div className="grid gap-4">
//                 <div className="space-y-2">
//                   <h4 className="font-medium">Price Range</h4>
//                   <div className="pt-4 pb-2">
//                     <Slider
//                       defaultValue={[0, 10000]}
//                       max={10000}
//                       step={100}
//                       value={priceRange}
//                       onValueChange={setPriceRange}
//                     />
//                   </div>
//                   <div className="flex items-center justify-between">
//                     <span className="text-sm text-muted-foreground">{formatPriceLabel(priceRange[0])}</span>
//                     <span className="text-sm text-muted-foreground">{formatPriceLabel(priceRange[1])}</span>
//                   </div>
//                 </div>

//                 <div className="space-y-2">
//                   <h4 className="font-medium">Date Range</h4>
//                   <div className="grid grid-cols-2 gap-2">
//                     <div>
//                       <Label htmlFor="startDate">Start Date</Label>
//                       <Input
//                         id="startDate"
//                         type="date"
//                         value={dateRange.start}
//                         onChange={(e) => setDateRange((prev) => ({ ...prev, start: e.target.value }))}
//                       />
//                     </div>
//                     <div>
//                       <Label htmlFor="endDate">End Date</Label>
//                       <Input
//                         id="endDate"
//                         type="date"
//                         value={dateRange.end}
//                         onChange={(e) => setDateRange((prev) => ({ ...prev, end: e.target.value }))}
//                       />
//                     </div>
//                   </div>
//                 </div>

//                 <Button onClick={loadAuctions}>Apply Filters</Button>
//               </div>
//             </PopoverContent>
//           </Popover>

//           <Select value={statusFilter} onValueChange={setStatusFilter}>
//             <SelectTrigger className="w-[180px]">
//               <SelectValue placeholder="Filter by status" />
//             </SelectTrigger>
//             <SelectContent>
//               <SelectItem value="all">All Auctions</SelectItem>
//               <SelectItem value="requested">Requested</SelectItem>
//               <SelectItem value="active">Active</SelectItem>
//               <SelectItem value="ended">Ended</SelectItem>
//               <SelectItem value="cancelled">Cancelled</SelectItem>
//               <SelectItem value="rejected">Rejected</SelectItem>
//             </SelectContent>
//           </Select>

//           <Select value={conditionFilter} onValueChange={setConditionFilter}>
//             <SelectTrigger className="w-[180px]">
//               <SelectValue placeholder="Filter by condition" />
//             </SelectTrigger>
//             <SelectContent>
//               <SelectItem value="all">All Conditions</SelectItem>
//               <SelectItem value="new">New</SelectItem>
//               <SelectItem value="used">Used</SelectItem>
//             </SelectContent>
//           </Select>
//         </div>
//       </div>

//       <Card>
//         <CardHeader className="p-4">
//           <CardTitle>All Auctions</CardTitle>
//           <CardDescription>Manage all auctions in the marketplace system</CardDescription>
//         </CardHeader>
//         <CardContent className="p-0">
//           <AuctionTable
//             auctions={auctions}
//             isLoading={isLoading}
//             onViewAuction={handleViewAuction}
//             onAction={handleAuctionAction}
//           />
//         </CardContent>
//       </Card>

//       <AuctionPagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
//     </main>
//   )
// }

