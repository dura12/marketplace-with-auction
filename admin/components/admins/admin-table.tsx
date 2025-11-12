"use client"

import { useState } from "react"
import { CheckCircle, Trash2, MoreHorizontal, AlertTriangle, Eye } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { AdminDetailsDialog } from "@/components/admins/admin-details-dialog"

interface AdminTableProps {
  admins: any[]
  isLoading: boolean
  isTrash?: boolean
  onViewAdmin: (admin: any) => void
  onAction: (type: "ban" | "unban" | "delete" | "restore" | "permanent-delete", adminId: string) => void
}

export function AdminTable({ admins, isLoading, isTrash = false, onViewAdmin, onAction }: AdminTableProps) {
  const [selectedAdmin, setSelectedAdmin] = useState<any>(null)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)

  const handleRowClick = (admin: any) => {
    setSelectedAdmin(admin)
    setViewDialogOpen(true)
  }

  const handleViewAdmin = (admin: any) => {
    setSelectedAdmin(admin)
    setViewDialogOpen(true)
    onViewAdmin(admin)
  }

  return (
    <>
      <div className="overflow-auto rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[200px]">Name</TableHead>
              <TableHead className="hidden md:table-cell">Email</TableHead>
              <TableHead className="hidden md:table-cell">Phone</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="hidden md:table-cell">{isTrash ? "Deleted On" : "Created"}</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  Loading admins...
                </TableCell>
              </TableRow>
            ) : admins.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  {isTrash ? "No deleted admins found" : "No admins found matching your filters"}
                </TableCell>
              </TableRow>
            ) : (
              admins.map((admin) => (
                <TableRow
                  key={admin._id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleRowClick(admin)}
                >
                  <TableCell className="font-medium">{admin.fullname}</TableCell>
                  <TableCell className="hidden md:table-cell">{admin.email}</TableCell>
                  <TableCell className="hidden md:table-cell">{admin.phone || "Not provided"}</TableCell>
                  <TableCell>
                    {admin.isBanned ? (
                      <span className="flex items-center text-red-500">
                        <AlertTriangle className="mr-1 h-4 w-4" /> Banned
                      </span>
                    ) : (
                      <span className="flex items-center text-green-500">
                        <CheckCircle className="mr-1 h-4 w-4" /> Active
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {isTrash
                      ? new Date(admin.trashDate).toLocaleDateString()
                      : new Date(admin.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleViewAdmin(admin)
                        }}
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                        <span className="sr-only">View</span>
                      </Button>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="icon" onClick={(e) => e.stopPropagation()}>
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Actions</span>
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>{isTrash ? "Deleted Admin Actions" : "Admin Actions"}</DialogTitle>
                            <DialogDescription>Choose an action for {admin.fullname}</DialogDescription>
                          </DialogHeader>
                          <div className="grid gap-4 py-4">
                            <Button className="w-full" variant="outline" onClick={() => handleViewAdmin(admin)}>
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </Button>

                            {!isTrash ? (
                              <>
                                {admin.isBanned ? (
                                  <Button
                                    className="w-full"
                                    variant="default"
                                    onClick={() => onAction("unban", admin._id)}
                                  >
                                    <CheckCircle className="mr-2 h-4 w-4" />
                                    Unban Admin
                                  </Button>
                                ) : (
                                  <Button
                                    className="w-full"
                                    variant="destructive"
                                    onClick={() => onAction("ban", admin._id)}
                                  >
                                    <AlertTriangle className="mr-2 h-4 w-4" />
                                    Ban Admin
                                  </Button>
                                )}
                                <Button
                                  className="w-full"
                                  variant="destructive"
                                  onClick={() => onAction("delete", admin._id)}
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete Admin
                                </Button>
                              </>
                            ) : (
                              <>
                                <Button
                                  className="w-full"
                                  variant="default"
                                  onClick={() => onAction("restore", admin._id)}
                                >
                                  <CheckCircle className="mr-2 h-4 w-4" />
                                  Restore Admin
                                </Button>
                                <Button
                                  className="w-full"
                                  variant="destructive"
                                  onClick={() => onAction("permanent-delete", admin._id)}
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete Permanently
                                </Button>
                              </>
                            )}
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {selectedAdmin && (
        <AdminDetailsDialog
          admin={selectedAdmin}
          open={viewDialogOpen}
          onOpenChange={setViewDialogOpen}
          onAction={onAction}
        />
      )}
    </>
  )
}

