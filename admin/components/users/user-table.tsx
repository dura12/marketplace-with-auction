"use client"

import { useState } from "react"
import { CheckCircle, XCircle, AlertTriangle } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { UserDetailsDialog } from "@/components/users/user-details-dialog"

interface UserTableProps {
  users: any[]
  isLoading: boolean
  isTrash?: boolean
  onViewUser: (user: any) => void
  onAction: (type: "approve" | "reject" | "ban" | "unban" | "delete" | "restore" | "permanent-delete", userId: string) => void
}

export function UserTable({ users, isLoading, isTrash = false, onViewUser, onAction }: UserTableProps) {
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)

  const handleRowClick = (user: any) => {
    setSelectedUser(user)
    setViewDialogOpen(true)
  }

  const handleAction = async (type: any, userId: any) => {
    try {
      let response;
      const headers = { "Content-Type": "application/json" };

      switch (type) {
        case "ban":
          response = await fetch("/api/manageUsers", {
            method: "PUT",
            headers,
            body: JSON.stringify({ _id: userId, isBanned: true }),
          });
          break;
        case "unban":
          response = await fetch("/api/manageUsers", {
            method: "PUT",
            headers,
            body: JSON.stringify({ _id: userId, isBanned: false }),
          });
          break;
        case "delete":
          response = await fetch("/api/manageUsers", {
            method: "DELETE",
            headers,
            body: JSON.stringify({ _id: userId }),
          });
          break;
        case "restore":
          response = await fetch("/api/manageUsers", {
            method: "PUT",
            headers,
            body: JSON.stringify({ _id: userId, isDeleted: false }),
          });
          break;
        case "permanent-delete":
          response = await fetch("/api/manageUsers", {
            method: "DELETE",
            headers,
            body: JSON.stringify({ _id: userId }),
          });
          break;
        default:
          throw new Error("Unknown action type");
      }

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Action failed");
      }

      console.log(data.message); 
    } catch (error :any) {
      console.error("Error performing action:", error.message);
    }
  };
  return (
    <>
      <div className="overflow-auto rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px]">Image</TableHead>
            <TableHead className="w-[200px]">Name</TableHead>
            <TableHead className="hidden md:table-cell">Email</TableHead>
            <TableHead className="hidden md:table-cell">Role</TableHead>
            <TableHead className="hidden md:table-cell">Status</TableHead>
            <TableHead>Email Verification</TableHead>
            <TableHead className="hidden md:table-cell">Approval Status</TableHead>
            <TableHead className="hidden md:table-cell">{isTrash ? "Deleted On" : "Joined"}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                Loading users...
              </TableCell>
            </TableRow>
          ) : users.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                {isTrash ? "No deleted users found" : "No users found matching your filters"}
              </TableCell>
            </TableRow>
          ) : (
            users.map((user) => (
              <TableRow
                key={user._id}
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleRowClick(user)}
              >
                <TableCell>
                  <img
                    src={user.image || "/default-avatar.png"}
                    alt={user.fullName}
                    className="h-8 w-8 rounded-full object-cover"
                  />
                </TableCell>
                <TableCell className="font-medium">{user.fullName}</TableCell>
                <TableCell className="hidden md:table-cell">{user.email}</TableCell>
                {!isTrash && <TableCell className="hidden md:table-cell capitalize">{user.role}</TableCell>}
                <TableCell>
                  {!user.isBanned ? (
                    <span className="flex items-center text-green-500">
                      <CheckCircle className="mr-1 h-4 w-4" /> Active
                    </span>
                  ) : (
                    <span className="flex items-center text-yellow-500">
                      <AlertTriangle className="inline-block mr-2 h-4 w-4 text-red-500" />
                      Banned
                    </span>
                  )}
                </TableCell>
                <TableCell>
                  {user.isEmailVerified ? (
                    <span className="flex items-center text-green-500">
                      <CheckCircle className="mr-1 h-4 w-4" /> Verified
                    </span>
                  ) : (
                    <span className="flex items-center text-yellow-500">
                      <XCircle className="mr-1 h-4 w-4" /> Unverified
                    </span>
                  )}
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  {user.role === "merchant" ? (
                    user.approvalStatus === "approved" ? (
                      <span className="flex items-center text-green-500">
                        <CheckCircle className="mr-1 h-4 w-4" /> Approved
                      </span>
                    ) : user.approvalStatus === "pending" ? (
                      <span className="flex items-center text-yellow-500">
                        <AlertTriangle className="mr-1 h-4 w-4" /> Pending
                      </span>
                    ) : (
                      <span className="flex items-center text-red-500">
                        <XCircle className="mr-1 h-4 w-4" /> Rejected
                      </span>
                    )
                  ) : (
                    <span className="text-muted-foreground">N/A</span>
                  )}
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  {isTrash
                    ? new Date(user.trashDate).toLocaleDateString()
                    : new Date(user.createdAt).toLocaleDateString()}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      </div>
      {selectedUser && (
        <UserDetailsDialog
          user={selectedUser}
          open={viewDialogOpen}
          onOpenChange={setViewDialogOpen}
          onAction={onAction}
        />
      )}
    </>
  )
}