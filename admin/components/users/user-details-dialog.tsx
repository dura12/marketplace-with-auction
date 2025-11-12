"use client";

import { CheckCircle, XCircle, Trash2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

interface UserDetailsDialogProps {
  user: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAction: (
    type:
      | "approve"
      | "reject"
      | "ban"
      | "unban"
      | "delete"
      | "restore"
      | "permanent-delete",
    userId: string
  ) => void;
}

export function UserDetailsDialog({
  user,
  open,
  onOpenChange,
  onAction,
}: UserDetailsDialogProps) {
  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl overflow-y-auto max-h-[90vh] md:max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-2">
            {user.fullName}
            {/* Conditional badge rendering for role */}
            {user.role === "merchant" && (
              <Badge
                variant="outline"
                className="ml-2 bg-blue-50 text-blue-700 hover:bg-blue-100"
              >
                Merchant
              </Badge>
            )}
            {user.isDeleted && (
              <Badge
                variant="outline"
                className="ml-2 bg-red-50 text-red-700 hover:bg-red-100"
              >
                Deleted
              </Badge>
            )}
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            User ID: {user._id}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          {/* Status Badges */}
          <div className="flex flex-wrap gap-2">
            {/* Email Verified Status */}
            {user.isEmailVerified ? (
              <Badge
                variant="outline"
                className="bg-green-50 text-green-700 hover:bg-green-100"
              >
                <CheckCircle className="mr-1 h-3 w-3" /> Email Verified
              </Badge>
            ) : (
              <Badge
                variant="outline"
                className="bg-yellow-50 text-yellow-700 hover:bg-yellow-100"
              >
                <XCircle className="mr-1 h-3 w-3" /> Email Not Verified
              </Badge>
            )}

            {/* Ban Status */}
            {user.isBanned ? (
              <Badge
                variant="outline"
                className="bg-red-50 text-red-700 hover:bg-red-100"
              >
                <AlertTriangle className="mr-1 h-3 w-3" /> Banned
              </Badge>
            ) : (
              <Badge
                variant="outline"
                className="bg-green-50 text-green-700 hover:bg-green-100"
              >
                <CheckCircle className="mr-1 h-3 w-3" /> Active
              </Badge>
            )}

            {/* Merchant Approval Status */}
            {user.role === "merchant" && user.approvalStatus === "approved" && (
              <Badge
                variant="outline"
                className="bg-blue-50 text-blue-700 hover:bg-blue-100"
              >
                <CheckCircle className="mr-1 h-3 w-3" /> Merchant Approved
              </Badge>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              {/* Basic User Information */}
              <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                <h3 className="text-sm font-medium">Basic Information</h3>
                <div className="grid grid-cols-1 gap-2 text-sm">
                  <div className="flex justify-between">
                    <span className="font-medium text-muted-foreground">
                      Full Name:
                    </span>
                    <span>{user.fullName}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="font-medium text-muted-foreground">
                      Email:
                    </span>
                    <span>{user.email}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="font-medium text-muted-foreground">
                      Role:
                    </span>
                    <span className="capitalize">{user.role}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="font-medium text-muted-foreground">
                      Phone:
                    </span>
                    <span>{user.phoneNumber || "Not provided"}</span>
                  </div>
                </div>
              </div>

              {/* Location Information */}
              <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                <h3 className="text-sm font-medium">Location Information</h3>
                <div className="grid grid-cols-1 gap-2 text-sm">
                  <div className="flex justify-between">
                    <span className="font-medium text-muted-foreground">
                      State:
                    </span>
                    <span>{user.stateName || "Not provided"}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="font-medium text-muted-foreground">
                      City:
                    </span>
                    <span>{user.cityName || "Not provided"}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Merchant Information */}
            {user.role === "merchant" && (
              <div className="space-y-4">
                <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                  <h3 className="text-sm font-medium">Merchant Information</h3>
                  <div className="grid grid-cols-1 gap-2 text-sm">
                    <div className="flex justify-between">
                      <span className="font-medium text-muted-foreground">
                        TIN Number:
                      </span>
                      {user.tinNumber ? (
                        <a
                          href={user.tinNumber}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          View TIN Document
                        </a>
                      ) : (
                        <span>Not provided</span>
                      )}
                    </div>

                    <div className="flex justify-between">
                      <span className="font-medium text-muted-foreground">
                        Unique TIN Number:
                      </span>
                      <span>{user.uniqueTinNumber || "Not assigned"}</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="font-medium text-muted-foreground">
                        National ID:
                      </span>
                      {user.nationalId ? (
                        <a
                          href={user.nationalId}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          View National ID
                        </a>
                      ) : (
                        <span>Not provided</span>
                      )}
                    </div>

                    <div className="flex justify-between">
                      <span className="font-medium text-muted-foreground">
                        Approved By:
                      </span>
                      <span>{user.approvedBy || "Not approved yet"}</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="font-medium text-muted-foreground">
                        Account Name:
                      </span>
                      <span>{user.account_name || "Not provided"}</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="font-medium text-muted-foreground">
                        Account Number:
                      </span>
                      <span>{user.account_number || "Not provided"}</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="font-medium text-muted-foreground">
                        Bank Code:
                      </span>
                      <span>{user.bank_code || "Not provided"}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Account Information */}
            <div className="space-y-4">
              <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                <h3 className="text-sm font-medium">Account Information</h3>
                <div className="grid grid-cols-1 gap-2 text-sm">
                  <div className="flex justify-between">
                    <span className="font-medium text-muted-foreground">
                      Created At:
                    </span>
                    <span>{new Date(user.createdAt).toLocaleString()}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="font-medium text-muted-foreground">
                      Updated At:
                    </span>
                    <span>{new Date(user.updatedAt).toLocaleString()}</span>
                  </div>

                  {user.isDeleted && user.trashDate && (
                    <div className="flex justify-between">
                      <span className="font-medium text-muted-foreground">
                        Deleted At:
                      </span>
                      <span>{new Date(user.trashDate).toLocaleString()}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Actions (Approve/Reject, Ban/Unban, Delete/Restore) */}
          <div className="flex flex-wrap justify-end gap-2 pt-2">
            {!user.isDeleted ? (
              <>
                {/* Merchant approval buttons */}
                {user.role === "merchant" &&
                  user.approvalStatus === "pending" && (
                    <>
                      <Button
                        variant="default"
                        onClick={() => {
                          onOpenChange(false);
                          onAction("approve", user._id);
                        }}
                      >
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Approve
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() => {
                          onOpenChange(false);
                          onAction("reject", user._id);
                        }}
                      >
                        <AlertTriangle className="mr-2 h-4 w-4" />
                        Reject
                      </Button>
                    </>
                  )}

                {/* Ban/Unban buttons */}
                {user.isBanned ? (
                  <Button
                    variant="default"
                    onClick={() => {
                      onOpenChange(false);
                      onAction("unban", user._id);
                    }}
                  >
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Unban User
                  </Button>
                ) : (
                  <Button
                    variant="destructive"
                    onClick={() => {
                      onOpenChange(false);
                      onAction("ban", user._id);
                    }}
                  >
                    <AlertTriangle className="mr-2 h-4 w-4" />
                    Ban User
                  </Button>
                )}

                <Button
                  variant="destructive"
                  onClick={() => {
                    onOpenChange(false);
                    onAction("delete", user._id);
                  }}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete User
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="default"
                  onClick={() => {
                    onOpenChange(false);
                    onAction("restore", user._id);
                  }}
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Restore User
                </Button>

                <Button
                  variant="destructive"
                  onClick={() => {
                    onOpenChange(false);
                    onAction("permanent-delete", user._id);
                  }}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Permanently
                </Button>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
