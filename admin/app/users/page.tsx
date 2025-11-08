/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sidebar } from "@/components/sidebar";
import { UserTable } from "@/components/users/user-table";
import { UserFilters } from "@/components/users/user-filters";
import { PaginationControls } from "@/components/users/pagination-controls";
import { toast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/toaster";
import {
  banUser,
  deleteUser,
  permanentlyDeleteUser,
  restoreUser,
  unbanUser,
  approveUser,
  rejectUser,
} from "@/utils/adminFunctions";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";

export default function UsersPage() {
  // State definitions
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [approvalStatusFilter, setApprovalStatusFilter] = useState("all");
  const [activeTab, setActiveTab] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState<{
    ban?: boolean;
    unban?: boolean;
    delete?: boolean;
    restore?: boolean;
    permanentDelete?: boolean;
    approve?: boolean;
    reject?: boolean;
  }>({});
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 15,
    totalPages: 1,
  });
  const [showBanDialog, setShowBanDialog] = useState<string | null>(null);
  const [showApproveDialog, setShowApproveDialog] = useState<string | null>(
    null
  );
  const [showRejectDialog, setShowRejectDialog] = useState<string | null>(null);
  const [showRestoreDialog, setShowRestoreDialog] = useState<string | null>(
    null
  );
  const [showPermanentDeleteDialog, setShowPermanentDeleteDialog] = useState<
    string | null
  >(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState<{
    type: string;
    userId: string;
    message: string;
  } | null>(null);
  const [selectedBanReason, setSelectedBanReason] = useState("");
  const [banDescription, setBanDescription] = useState("");
  const [selectedRejectionReason, setSelectedRejectionReason] = useState("");
  const [rejectionDescription, setRejectionDescription] = useState("");
  const [uniqueTin, setUniqueTin] = useState<string | null>(null);

  // Predefined reasons
  const banReasons = [
    "Inappropriate behavior",
    "Spam",
    "Policy violation",
    "Other",
  ];

  const rejectionReasons = [
    "Incomplete profile",
    "Invalid documents",
    "Policy violation",
    "Other",
  ];

  // Fetch users on component mount
  useEffect(() => {
    async function loadAllUsers() {
      setIsLoading(true);
      try {
        const response = await fetch("/api/manageUsers");
        const users = await response.json();
        setAllUsers(users);
      } catch (error) {
        console.error("Error loading users:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load users. Please try again.",
        });
      } finally {
        setIsLoading(false);
      }
    }
    loadAllUsers();
  }, []);

  const getFilteredUsers = () => {
    let filtered = [...allUsers];

    // Apply search term filter
    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (user) =>
          user.fullName?.toLowerCase().includes(lowerSearch) ||
          user.address?.state?.toLowerCase().includes(lowerSearch) ||
          user.address?.city?.toLowerCase().includes(lowerSearch)
      );
    }

    // Apply role filter
    if (roleFilter !== "all") {
      filtered = filtered.filter((user) => user.role === roleFilter);
    }

    // Apply approval status filter for merchants
    if (roleFilter === "merchant" && approvalStatusFilter !== "all") {
      filtered = filtered.filter(
        (user) => user.approvalStatus === approvalStatusFilter
      );
    }

    // Apply verification status filter
    if (statusFilter !== "all") {
      if (statusFilter === "verified") {
        filtered = filtered.filter(
          (user) => user.isEmailVerified && !user.isBanned && !user.isDeleted
        );
      } else if (statusFilter === "unverified") {
        filtered = filtered.filter(
          (user) => !user.isEmailVerified && !user.isBanned && !user.isDeleted
        );
      } else if (statusFilter === "banned") {
        filtered = filtered.filter((user) => user.isBanned && !user.isDeleted);
      }
    }

    // Apply tab filter
    if (activeTab === "active") {
      filtered = filtered.filter((user) => !user.isDeleted);
    } else if (activeTab === "trash") {
      filtered = filtered.filter((user) => user.isDeleted);
    }
    // Note: "all" tab shows all users regardless of isDeleted status

    return filtered;
  };

  // Compute filtered and paginated users
  const filteredUsers = getFilteredUsers();
  const totalFiltered = filteredUsers.length;
  const totalPages = Math.ceil(totalFiltered / pagination.limit);
  const paginatedUsers = filteredUsers.slice(
    (pagination.page - 1) * pagination.limit,
    pagination.page * pagination.limit
  );

  // Update pagination when filters change
  useEffect(() => {
    setPagination((prev) => ({
      ...prev,
      total: totalFiltered,
      totalPages: totalPages,
      page: 1,
    }));
  }, [
    searchTerm,
    roleFilter,
    statusFilter,
    approvalStatusFilter,
    activeTab,
    allUsers,
  ]);

  // Handle page navigation
  const handlePageChange = (newPage: number) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  };

  // Initiate a user action with confirmation
  const handleUserAction = (
    type:
      | "approve"
      | "reject"
      | "ban"
      | "unban"
      | "delete"
      | "restore"
      | "permanent-delete",
    userId: string
  ) => {
    switch (type) {
      case "reject":
        setShowRejectDialog(userId);
        setSelectedRejectionReason("");
        setRejectionDescription("");
        break;
      case "ban":
        setShowBanDialog(userId);
        setSelectedBanReason("");
        setBanDescription("");
        break;
      case "restore":
        setShowRestoreDialog(userId);
        break;
      case "permanent-delete":
        setShowPermanentDeleteDialog(userId);
        break;
      case "approve":
        setShowApproveDialog(userId);
        setUniqueTin("");
        break;
      case "unban":
        setShowConfirmDialog({
          type,
          userId,
          message: "Are you sure you want to unban this user?",
        });
        break;
      case "delete":
        setShowConfirmDialog({
          type,
          userId,
          message: "Are you sure you want to delete this user?",
        });
        break;
    }
  };

  // Execute confirmed user action
  const handleConfirmAction = async (
    type:
      | "approve"
      | "reject"
      | "ban"
      | "unban"
      | "delete"
      | "restore"
      | "permanent-delete",
    userId: string,
    actionData?: Record<string, any>
  ) => {
    try {
      // Set loading state for the specific action
      setIsActionLoading((prev) => ({ ...prev, [type]: true }));

      let result;
      switch (type) {
        case "approve":
          if (uniqueTin) {
            result = await approveUser(userId, uniqueTin);
            if (result.success) {
              setAllUsers((prev) =>
                prev.map((user) =>
                  user._id === userId
                    ? {
                        ...user,
                        approvalStatus: "approved",
                        rejectionReason: null,
                      }
                    : user
                )
              );
            }
          } else {
            console.error("Unique TIN is required to approve user.");
          }
          break;
        case "reject":
          if (!actionData) throw new Error("Rejection reason is required");
          result = await rejectUser(
            userId,
            actionData as { reason: string; description: string }
          );
          if (result.success) {
            setAllUsers((prev) =>
              prev.map((user) =>
                user._id === userId
                  ? {
                      ...user,
                      approvalStatus: "rejected",
                      rejectionReason: actionData,
                    }
                  : user
              )
            );
          }
          break;
        case "ban":
          if (!actionData) throw new Error("Ban reason is required");
          result = await banUser(
            userId,
            actionData as { reason: string; description: string }
          );
          if (result.success) {
            setAllUsers((prev) =>
              prev.map((user) =>
                user._id === userId
                  ? { ...user, isBanned: true, banReason: actionData }
                  : user
              )
            );
          }
          break;
        case "unban":
          result = await unbanUser(userId);
          if (result.success) {
            setAllUsers((prev) =>
              prev.map((user) =>
                user._id === userId
                  ? {
                      ...user,
                      isBanned: false,
                      banReason: null,
                      bannedBy: null,
                    }
                  : user
              )
            );
          }
          break;
        case "delete":
          result = await deleteUser(userId);
          if (result.success) {
            setAllUsers((prev) =>
              prev.map((user) =>
                user._id === userId
                  ? { ...user, isDeleted: true, trashDate: new Date() }
                  : user
              )
            );
          }
          break;
        case "restore":
          result = await restoreUser(userId);
          if (result.success) {
            setAllUsers((prev) =>
              prev.map((user) =>
                user._id === userId
                  ? { ...user, isDeleted: false, trashDate: null }
                  : user
              )
            );
          }
          break;
        case "permanent-delete":
          result = await permanentlyDeleteUser(userId);
          if (result.success) {
            setAllUsers((prev) => prev.filter((user) => user._id !== userId));
          }
          break;
      }
      if (result?.success) {
        toast({
          title: "Success",
          description: result.message,
        });
      } else {
        throw new Error(result?.message || `Failed to ${type} user`);
      }
    } catch (error) {
      if (error instanceof Error) {
        toast({
          variant: "destructive",
          title: "Error",
          description:
            error.message || `Failed to ${type} user. Please try again.`,
        });
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: `Failed to ${type} user. Please try again.`,
        });
      }
    } finally {
      // Clear loading state for the specific action
      setIsActionLoading((prev) => ({ ...prev, [type]: false }));
    }
  };

  // Render the UI
  return (
    <div className="flex min-h-screen flex-col">
      <Sidebar />
      <div className="flex-1 md:ml-[calc(var(--sidebar-width)-40px)] md:-mt-12 -mt-8">
        <main className="flex-1 space-y-4 p-4 md:p-8 pt-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold tracking-tight">
              User Management
            </h1>
            <span className="text-sm text-muted-foreground">
              Total Users: {filteredUsers.length}
            </span>
          </div>

          <Tabs
            value={activeTab}
            className="space-y-4"
            onValueChange={setActiveTab}
          >
            <TabsList className="w-full sm:w-auto grid grid-cols-4 sm:flex">
              <TabsTrigger value="all">All Users</TabsTrigger>
              <TabsTrigger value="active">Active</TabsTrigger>
              <TabsTrigger value="trash">Trash</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-4">
              <UserFilters
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                roleFilter={roleFilter}
                setRoleFilter={setRoleFilter}
                statusFilter={statusFilter}
                setStatusFilter={setStatusFilter}
                approvalStatusFilter={approvalStatusFilter}
                setApprovalStatusFilter={setApprovalStatusFilter}
                showRoleFilter={true}
                showStatusFilter={true}
                showApprovalStatusFilter={roleFilter === "merchant"}
              />
              <Card className="overflow-hidden">
                <CardHeader className="p-4 bg-muted/50">
                  <CardTitle>All Users</CardTitle>
                  <CardDescription>
                    Manage all users in the marketplace system
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <UserTable
                    users={paginatedUsers}
                    isLoading={isLoading}
                    onViewUser={() => {}}
                    onAction={handleUserAction}
                  />
                </CardContent>
              </Card>
              <PaginationControls
                currentPage={pagination.page}
                totalPages={pagination.totalPages}
                onPageChange={handlePageChange}
              />
            </TabsContent>

            <TabsContent value="active" className="space-y-4">
              <UserFilters
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                roleFilter={roleFilter}
                setRoleFilter={setRoleFilter}
                statusFilter={statusFilter}
                setStatusFilter={setStatusFilter}
                approvalStatusFilter={approvalStatusFilter}
                setApprovalStatusFilter={setApprovalStatusFilter}
                showRoleFilter={true}
                showStatusFilter={true}
                showApprovalStatusFilter={roleFilter === "merchant"}
              />
              <Card className="overflow-hidden">
                <CardHeader className="p-4 bg-muted/50">
                  <CardTitle>Active Users</CardTitle>
                  <CardDescription>
                    Manage active users in the marketplace system
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <UserTable
                    users={paginatedUsers}
                    isLoading={isLoading}
                    onViewUser={() => {}}
                    onAction={handleUserAction}
                  />
                </CardContent>
              </Card>
              <PaginationControls
                currentPage={pagination.page}
                totalPages={pagination.totalPages}
                onPageChange={handlePageChange}
              />
            </TabsContent>

            <TabsContent value="trash" className="space-y-4">
              <UserFilters
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                roleFilter={roleFilter}
                setRoleFilter={setRoleFilter}
                statusFilter={statusFilter}
                setStatusFilter={setStatusFilter}
                approvalStatusFilter={approvalStatusFilter}
                setApprovalStatusFilter={setApprovalStatusFilter}
                showRoleFilter={true}
                showStatusFilter={true}
                showApprovalStatusFilter={roleFilter === "merchant"}
              />
              <Card className="overflow-hidden">
                <CardHeader className="p-4 bg-muted/50">
                  <CardTitle>Trash</CardTitle>
                  <CardDescription>
                    Manage deleted users in the marketplace system
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <UserTable
                    users={paginatedUsers}
                    isLoading={isLoading}
                    onViewUser={() => {}}
                    onAction={handleUserAction}
                  />
                </CardContent>
              </Card>
              <PaginationControls
                currentPage={pagination.page}
                totalPages={pagination.totalPages}
                onPageChange={handlePageChange}
              />
            </TabsContent>
          </Tabs>

          {/* Ban Confirmation Dialog */}
          {showBanDialog && (
            <Dialog
              open={!!showBanDialog}
              onOpenChange={() => setShowBanDialog(null)}
            >
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Confirm Ban</DialogTitle>
                  <DialogDescription>
                    Are you sure you want to ban this user? Please provide a
                    reason and additional details.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="banReason">Ban Reason</Label>
                    <Select
                      value={selectedBanReason}
                      onValueChange={setSelectedBanReason}
                    >
                      <SelectTrigger id="banReason">
                        <SelectValue placeholder="Select a reason" />
                      </SelectTrigger>
                      <SelectContent>
                        {banReasons.map((reason) => (
                          <SelectItem key={reason} value={reason}>
                            {reason}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="banDescription">Additional Details</Label>
                    <Textarea
                      id="banDescription"
                      value={banDescription}
                      onChange={(e) => setBanDescription(e.target.value)}
                      placeholder="Enter additional details about the ban"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setShowBanDialog(null)}
                    disabled={isActionLoading.ban}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={async () => {
                      if (!selectedBanReason) {
                        toast({
                          variant: "destructive",
                          title: "Error",
                          description: "Please select a ban reason.",
                        });
                        return;
                      }
                      await handleConfirmAction("ban", showBanDialog, {
                        reason: selectedBanReason,
                        description: banDescription,
                      });
                      setShowBanDialog(null);
                    }}
                    disabled={!selectedBanReason || isActionLoading.ban}
                  >
                    {isActionLoading.ban ? "Loading..." : "Confirm Ban"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}

          {showApproveDialog && (
            <Dialog
              open={!!showApproveDialog}
              onOpenChange={() => setShowApproveDialog(null)}
            >
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Confirm Approve</DialogTitle>
                  <DialogDescription>
                    Are you sure you want to approve this user? Please provide a
                    unique TIN number.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="uniqueTin">Unique TIN Number</Label>
                    <Input
                      id="uniqueTin"
                      value={uniqueTin ?? ""}
                      onChange={(e) => setUniqueTin(e.target.value)}
                      placeholder="Enter unique TIN number"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setShowApproveDialog(null)}
                    disabled={isActionLoading.approve}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={async () => {
                      if (!uniqueTin) {
                        toast({
                          variant: "destructive",
                          title: "Error",
                          description: "Please enter unique TIN number.",
                        });
                        return;
                      }
                      await handleConfirmAction("approve", showApproveDialog, {
                        uniqueTin,
                      });
                      setShowApproveDialog(null);
                    }}
                    disabled={!uniqueTin || isActionLoading.approve}
                  >
                    {isActionLoading.approve ? "Loading..." : "Confirm Approve"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}

          {/* Reject Confirmation Dialog */}
          {showRejectDialog && (
            <Dialog
              open={!!showRejectDialog}
              onOpenChange={() => setShowRejectDialog(null)}
            >
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Confirm Rejection</DialogTitle>
                  <DialogDescription>
                    Are you sure you want to reject this user? Please provide a
                    reason and additional details.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="rejectionReason">Rejection Reason</Label>
                    <Select
                      value={selectedRejectionReason}
                      onValueChange={setSelectedRejectionReason}
                    >
                      <SelectTrigger id="rejectionReason">
                        <SelectValue placeholder="Select a reason" />
                      </SelectTrigger>
                      <SelectContent>
                        {rejectionReasons.map((reason) => (
                          <SelectItem key={reason} value={reason}>
                            {reason}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="rejectionDescription">
                      Additional Details
                    </Label>
                    <Textarea
                      id="rejectionDescription"
                      value={rejectionDescription}
                      onChange={(e) => setRejectionDescription(e.target.value)}
                      placeholder="Enter additional details about the rejection"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setShowRejectDialog(null)}
                    disabled={isActionLoading.reject}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={async () => {
                      if (!selectedRejectionReason) {
                        toast({
                          variant: "destructive",
                          title: "Error",
                          description: "Please select a rejection reason.",
                        });
                        return;
                      }
                      await handleConfirmAction("reject", showRejectDialog, {
                        reason: selectedRejectionReason,
                        description: rejectionDescription,
                      });
                      setShowRejectDialog(null);
                    }}
                    disabled={
                      !selectedRejectionReason || isActionLoading.reject
                    }
                  >
                    {isActionLoading.reject
                      ? "Loading..."
                      : "Confirm Rejection"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}

          {/* Generic Confirmation Dialog */}
          {showConfirmDialog && (
            <Dialog
              open={!!showConfirmDialog}
              onOpenChange={() => setShowConfirmDialog(null)}
            >
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Confirm Action</DialogTitle>
                  <DialogDescription>
                    {showConfirmDialog.message}
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setShowConfirmDialog(null)}
                    disabled={
                      isActionLoading[
                        showConfirmDialog.type as keyof typeof isActionLoading
                      ]
                    }
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={async () => {
                      await handleConfirmAction(
                        showConfirmDialog.type as
                          | "approve"
                          | "reject"
                          | "ban"
                          | "unban"
                          | "delete"
                          | "restore"
                          | "permanent-delete",
                        showConfirmDialog.userId
                      );
                      setShowConfirmDialog(null);
                    }}
                    disabled={
                      isActionLoading[
                        showConfirmDialog.type as keyof typeof isActionLoading
                      ]
                    }
                  >
                    {isActionLoading[
                      showConfirmDialog.type as keyof typeof isActionLoading
                    ]
                      ? "Loading..."
                      : "Confirm"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}

          {/* Restore Confirmation Dialog */}
          {showRestoreDialog && (
            <Dialog
              open={!!showRestoreDialog}
              onOpenChange={() => setShowRestoreDialog(null)}
            >
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Confirm Restore</DialogTitle>
                  <DialogDescription>
                    Are you sure you want to restore this user?
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setShowRestoreDialog(null)}
                    disabled={isActionLoading.restore}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={async () => {
                      await handleConfirmAction("restore", showRestoreDialog);
                      setShowRestoreDialog(null);
                    }}
                    disabled={isActionLoading.restore}
                  >
                    {isActionLoading.restore ? "Loading..." : "Confirm"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}

          {/* Permanent Delete Confirmation Dialog */}
          {showPermanentDeleteDialog && (
            <Dialog
              open={!!showPermanentDeleteDialog}
              onOpenChange={() => setShowPermanentDeleteDialog(null)}
            >
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Confirm Permanent Delete</DialogTitle>
                  <DialogDescription>
                    Are you sure you want to permanently delete this user? This
                    action cannot be undone.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setShowPermanentDeleteDialog(null)}
                    disabled={isActionLoading.permanentDelete}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={async () => {
                      await handleConfirmAction(
                        "permanent-delete",
                        showPermanentDeleteDialog
                      );
                      setShowPermanentDeleteDialog(null);
                    }}
                    disabled={isActionLoading.permanentDelete}
                  >
                    {isActionLoading.permanentDelete
                      ? "Loading..."
                      : "Confirm Delete"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </main>
      </div>
      <Toaster />
    </div>
  );
}
