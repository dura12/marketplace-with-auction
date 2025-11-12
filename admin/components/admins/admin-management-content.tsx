// "use client"

// import { useState, useEffect } from "react"
// import { Search, Filter, Plus } from "lucide-react"
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
// import { Input } from "@/components/ui/input"
// import { Button } from "@/components/ui/button"
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
// import { AdminTable } from "@/components/admins/admin-table"
// import { CreateAdminDialog } from "@/components/admins/create-admin-dialog"
// import { AdminPagination } from "@/components/admins/admin-pagination"
// import { useToast } from "@/components/ui/use-toast"
// import {
//   fetchAdmins,
//   createAdmin,
//   banAdmin,
//   unbanAdmin,
//   deleteAdmin,
//   restoreAdmin,
//   permanentDeleteAdmin,
// } from "@/utils/data-fetching"

// export function AdminManagementContent() {
//   const [isLoading, setIsLoading] = useState(true)
//   const [admins, setAdmins] = useState<any[]>([])
//   const [searchQuery, setSearchQuery] = useState("")
//   const [statusFilter, setStatusFilter] = useState("all")
//   const [isTrashView, setIsTrashView] = useState(false)
//   const [createDialogOpen, setCreateDialogOpen] = useState(false)
//   const [currentPage, setCurrentPage] = useState(1)
//   const [totalPages, setTotalPages] = useState(1)
//   const { toast } = useToast()

//   const itemsPerPage = 15

//   useEffect(() => {
//     loadAdmins()
//   }, []) // Only currentPage is needed here

//   const loadAdmins = async () => {
//     setIsLoading(true)
//     try {
//       const response = await fetchAdmins({
//         page: currentPage,
//         limit: itemsPerPage,
//         search: searchQuery,
//         status: statusFilter,
//         isDeleted: isTrashView,
//       })

//       setAdmins(response.admins)
//       setTotalPages(Math.ceil(response.total / itemsPerPage))
//     } catch (error) {
//       toast({
//         title: "Error",
//         description: "Failed to load admins. Please try again.",
//         variant: "destructive",
//       })
//     } finally {
//       setIsLoading(false)
//     }
//   }

//   const handleCreateAdmin = async (adminData: any) => {
//     try {
//       await createAdmin(adminData)
//       toast({
//         title: "Success",
//         description: "Admin created successfully",
//       })
//       setCreateDialogOpen(false)
//       loadAdmins()
//     } catch (error) {
//       toast({
//         title: "Error",
//         description: "Failed to create admin. Please try again.",
//         variant: "destructive",
//       })
//     }
//   }

//   const handleAdminAction = async (type: string, adminId: string) => {
//     try {
//       switch (type) {
//         case "ban":
//           await banAdmin(adminId)
//           toast({ title: "Admin banned successfully" })
//           break
//         case "unban":
//           await unbanAdmin(adminId)
//           toast({ title: "Admin unbanned successfully" })
//           break
//         case "delete":
//           await deleteAdmin(adminId)
//           toast({ title: "Admin moved to trash" })
//           break
//         case "restore":
//           await restoreAdmin(adminId)
//           toast({ title: "Admin restored successfully" })
//           break
//         case "permanent-delete":
//           await permanentDeleteAdmin(adminId)
//           toast({ title: "Admin permanently deleted" })
//           break
//       }
//       loadAdmins()
//     } catch (error) {
//       toast({
//         title: "Error",
//         description: `Failed to ${type} admin. Please try again.`,
//         variant: "destructive",
//       })
//     }
//   }

//   const handleViewAdmin = (admin: any) => {
//     // This is just a placeholder for now
//     // The actual view happens in the AdminDetailsDialog component
//   }

//   return (
//     <main className="flex-1 space-y-4 p-4 md:p-8 pt-6">
//       <div className="flex items-center justify-between">
//         <h1 className="text-3xl font-bold tracking-tight">Admin Management</h1>
//         <div className="flex items-center gap-2">
//           <span className="text-sm text-muted-foreground">
//             {isTrashView ? "Trash" : "Total Admins"}: {totalPages * itemsPerPage}
//           </span>
//         </div>
//       </div>

//       <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
//         <div className="flex flex-1 items-center gap-2">
//           <div className="relative flex-1 md:max-w-sm">
//             <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
//             <Input
//               type="search"
//               placeholder="Search admins..."
//               className="pl-8"
//               value={searchQuery}
//               onChange={(e) => setSearchQuery(e.target.value)}
//             />
//           </div>
//           <Button variant="outline" size="icon">
//             <Filter className="h-4 w-4" />
//             <span className="sr-only">Filter</span>
//           </Button>
//           <Select value={statusFilter} onValueChange={setStatusFilter}>
//             <SelectTrigger className="w-[180px]">
//               <SelectValue placeholder="Filter by status" />
//             </SelectTrigger>
//             <SelectContent>
//               <SelectItem value="all">All Admins</SelectItem>
//               <SelectItem value="active">Active</SelectItem>
//               <SelectItem value="banned">Banned</SelectItem>
//             </SelectContent>
//           </Select>
//           <Select value={isTrashView ? "trash" : "active"} onValueChange={(value) => setIsTrashView(value === "trash")}>
//             <SelectTrigger className="w-[180px]">
//               <SelectValue placeholder="View" />
//             </SelectTrigger>
//             <SelectContent>
//               <SelectItem value="active">Active Admins</SelectItem>
//               <SelectItem value="trash">Trash</SelectItem>
//             </SelectContent>
//           </Select>
//         </div>

//         <Button onClick={() => setCreateDialogOpen(true)}>
//           <Plus className="mr-2 h-4 w-4" />
//           Create Admin
//         </Button>
//       </div>

//       <Card>
//         <CardHeader className="p-4">
//           <CardTitle>{isTrashView ? "Trash" : "All Admins"}</CardTitle>
//           <CardDescription>
//             {isTrashView
//               ? "Admins in trash will be permanently deleted after 30 days"
//               : "Manage all admins in the marketplace system"}
//           </CardDescription>
//         </CardHeader>
//         <CardContent className="p-0">
//           <AdminTable
//             admins={admins}
//             isLoading={isLoading}
//             isTrash={isTrashView}
//             onViewAdmin={handleViewAdmin}
//             onAction={handleAdminAction}
//           />
//         </CardContent>
//       </Card>

//       <AdminPagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />

//       <CreateAdminDialog open={createDialogOpen} onOpenChange={setCreateDialogOpen} onSubmit={handleCreateAdmin} />
//     </main>
//   )
// }

