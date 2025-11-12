"use client";

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
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input"; // Added for ban reason input
import { CheckCircle, XCircle, Trash2, RefreshCw } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/toaster";

interface AdminDetailsDialogProps {
  admin: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAction: (type: "ban" | "unban" | "delete" | "restore" | "permanent-delete", adminId: string) => void;
}

// Confirmation Dialog for Deleting (Existing)
interface ConfirmDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isPermanent: boolean;
}

const ConfirmDeleteDialog: React.FC<ConfirmDeleteDialogProps> = ({
  open,
  onOpenChange,
  onConfirm,
  isPermanent,
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleConfirm = async () => {
    setIsLoading(true);
    try {
      await onConfirm();
      onOpenChange(false);
    } catch (error) {
      // Error handling managed in onConfirm
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isPermanent ? "Permanently Delete Admin" : "Delete Admin"}
          </DialogTitle>
          <DialogDescription>
            {isPermanent
              ? "Are you sure you want to permanently delete this admin? This action cannot be undone."
              : "Are you sure you want to delete this admin? They will be moved to the trash and can be restored later."}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={isLoading}
          >
            {isLoading ? "Deleting..." : "Confirm"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Confirmation Dialog for Banning (New)
interface ConfirmBanDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (reason: string) => void;
}

const ConfirmBanDialog: React.FC<ConfirmBanDialogProps> = ({
  open,
  onOpenChange,
  onConfirm,
}) => {
  const [banReason, setBanReason] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleConfirm = () => {
    if (!banReason.trim()) {
      setError("Please provide a ban reason.");
      return;
    }
    setError("");
    setIsLoading(true);
    try {
      onConfirm(banReason);
      onOpenChange(false);
    } catch (error) {
      // Error handling managed in onConfirm
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Ban Admin</DialogTitle>
          <DialogDescription>
            Are you sure you want to ban this admin? Please provide a reason for
            the ban.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Label htmlFor="banReason">Ban Reason</Label>
          <Input
            id="banReason"
            value={banReason}
            onChange={(e) => setBanReason(e.target.value)}
            placeholder="Enter ban reason"
          />
          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={isLoading || !banReason.trim()}
          >
            {isLoading ? "Banning..." : "Confirm Ban"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Confirmation Dialog for Restoring (New)
interface ConfirmRestoreDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

const ConfirmRestoreDialog: React.FC<ConfirmRestoreDialogProps> = ({
  open,
  onOpenChange,
  onConfirm,
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleConfirm = async () => {
    setIsLoading(true);
    try {
      await onConfirm();
      onOpenChange(false);
    } catch (error) {
      // Error handling managed in onConfirm
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Restore Admin</DialogTitle>
          <DialogDescription>
            Are you sure you want to restore this admin from the trash?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            variant="default"
            onClick={handleConfirm}
            disabled={isLoading}
          >
            {isLoading ? "Restoring..." : "Confirm Restore"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export function AdminDetailsDialog({
  admin,
  open,
  onOpenChange,
}: AdminDetailsDialogProps) {
  const [isBanning, setIsBanning] = useState(false);
  const [isUnbanning, setIsUnbanning] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmBanOpen, setConfirmBanOpen] = useState(false);
  const [confirmRestoreOpen, setConfirmRestoreOpen] = useState(false);

  // Close all confirmation dialogs when the main dialog closes
  useEffect(() => {
    if (!open) {
      setConfirmOpen(false);
      setConfirmBanOpen(false);
      setConfirmRestoreOpen(false);
    }
  }, [open]);

  // Helper function for API calls
  const apiCall = async (url: string, method: string, body?: any) => {
    const response = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: body ? JSON.stringify(body) : undefined,
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Operation failed");
    }
    return response.json();
  };

  const handleBanAdmin = async (reason: string) => {
    setIsBanning(true);
    try {
      await apiCall("/api/manageAdmins", "PUT", {
        _id: admin._id,
        isBanned: true,
        banReason: reason,
      });
      toast({ title: "Success", description: "Admin banned successfully!" });
      onOpenChange(false);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: (error as Error).message,
      });
    } finally {
      setIsBanning(false);
    }
  };

  const handleUnbanAdmin = async () => {
    setIsUnbanning(true);
    try {
      await apiCall("/api/manageAdmins", "PUT", {
        _id: admin._id,
        isBanned: false,
      });
      toast({ title: "Success", description: "Admin unbanned successfully!" });
      onOpenChange(false);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: (error as Error).message,
      });
    } finally {
      setIsUnbanning(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await apiCall("/api/manageAdmins", "DELETE", { _id: admin._id });
      const message = admin.isDeleted
        ? "Admin permanently deleted!"
        : "Admin moved to trash successfully!";
      toast({ title: "Success", description: message });
      onOpenChange(false);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: (error as Error).message,
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleRestoreAdmin = async () => {
    setIsRestoring(true);
    try {
      await apiCall("/api/manageAdmins", "PUT", {
        _id: admin._id,
        isDeleted: false,
      });
      toast({ title: "Success", description: "Admin restored successfully!" });
      onOpenChange(false);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: (error as Error).message,
      });
    } finally {
      setIsRestoring(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Admin Details</span>
              {admin.isBanned ? (
                <Badge
                  variant="destructive"
                  className="flex items-center gap-1"
                >
                  <XCircle className="h-3 w-3" />
                  Banned
                </Badge>
              ) : (
                <Badge
                  variant="outline"
                  className="flex items-center gap-1 bg-green-50 text-green-700 border-green-200"
                >
                  <CheckCircle className="h-3 w-3" />
                  Active
                </Badge>
              )}
            </DialogTitle>
            <DialogDescription>
              View and manage administrator information
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium">Name</Label>
                <div className="text-sm mt-1">{admin.fullname}</div>
              </div>
              <div>
                <Label className="text-sm font-medium">Email</Label>
                <div className="text-sm mt-1">{admin.email}</div>
              </div>
              <div>
                <Label className="text-sm font-medium">Phone</Label>
                <div className="text-sm mt-1">{admin.phone}</div>
              </div>
              <div>
                <Label className="text-sm font-medium">Created</Label>
                <div className="text-sm mt-1">
                  {new Date(admin.createdAt).toLocaleString()}
                </div>
              </div>

              {admin.isBanned && admin.banReason && (
                <div>
                  <Label className="text-sm font-medium text-red-600">
                    Ban Reason
                  </Label>
                  <div className="text-sm mt-1 text-red-500">
                    {admin.banReason}
                  </div>
                </div>
              )}

              {admin.isDeleted && (
                <div>
                  <Label className="text-sm font-medium">Deleted</Label>
                  <div className="text-sm mt-1">
                    {new Date(admin.trashDate).toLocaleString()}
                  </div>
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="flex-row gap-2">
            {!admin.isDeleted ? (
              <>
                {!admin.isBanned ? (
                  <Button
                    variant="destructive"
                    onClick={() => setConfirmBanOpen(true)}
                    disabled={isBanning}
                    className="w-full sm:w-auto"
                  >
                    <XCircle className="mr-2 h-4 w-4" />
                    Ban Admin
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    onClick={handleUnbanAdmin}
                    disabled={isUnbanning}
                    className="w-full sm:w-auto"
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    {isUnbanning ? "Unbanning..." : "Unban Admin"}
                  </Button>
                )}
                <Button
                  variant="destructive"
                  onClick={() => setConfirmOpen(true)}
                  className="w-full sm:w-auto"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Admin
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="default"
                  onClick={() => setConfirmRestoreOpen(true)}
                  disabled={isRestoring}
                  className="w-full sm:w-auto"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Restore Admin
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => setConfirmOpen(true)}
                  className="w-full sm:w-auto"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Permanently Delete
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDeleteDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        onConfirm={handleDelete}
        isPermanent={admin.isDeleted}
      />

      <ConfirmBanDialog
        open={confirmBanOpen}
        onOpenChange={setConfirmBanOpen}
        onConfirm={handleBanAdmin}
      />

      <ConfirmRestoreDialog
        open={confirmRestoreOpen}
        onOpenChange={setConfirmRestoreOpen}
        onConfirm={handleRestoreAdmin}
      />

      <Toaster />
    </>
  );
}
