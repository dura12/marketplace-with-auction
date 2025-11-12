"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, AlertTriangle, Loader2 } from "lucide-react";
import { Toaster } from "@/components/toaster";
import { toast } from "@/components/ui/use-toast";

interface ApproveAdDialogProps {
  ad: any;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function ApproveAdDialog({ ad, isOpen, onClose, onSuccess }: ApproveAdDialogProps) {
  const [activateImmediately, setActivateImmediately] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleApprove = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/manageAds", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          _id: ad._id,
          action: "APPROVE",
          activateImmediately, // Include activateImmediately in the request
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to approve ad.");
      }

      toast({
        variant: "default", // Use "success" if supported
        title: "Success",
        description: "Ad approved successfully",
      });
      onSuccess();
      onClose(); // Close the dialog after success
    } catch (err: any) {
      const message = err.message || "Failed to approve ad. Please try again.";
      setError(message);
      toast({
        variant: "destructive",
        title: "Error",
        description: message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Toaster /> {/* Render Toaster component */}
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <CheckCircle className="h-5 w-5 mr-2 text-green-500" />
              Approve Ad
            </DialogTitle>
          </DialogHeader>

          <div className="py-4">
            <p className="mb-4">You are about to approve the following ad:</p>

            <div className="bg-muted p-3 rounded-md mb-4">
              <div className="font-medium">{ad.product.productName}</div>
              <div className="text-sm text-muted-foreground">by {ad.merchantDetail.merchantName}</div>
            </div>

            {ad.paymentStatus === "PAID" && (
              <div className="flex items-start space-x-2 mt-4">
                <Checkbox
                  id="activate"
                  checked={activateImmediately}
                  onCheckedChange={(checked) => setActivateImmediately(checked === true)}
                />
                <div className="grid gap-1.5 leading-none">
                  <Label
                    htmlFor="activate"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Activate immediately
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    The ad will become active and visible to users right away.
                  </p>
                </div>
              </div>
            )}

            {ad.paymentStatus !== "PAID" && (
              <Alert variant="destructive" className="mt-4">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  This ad has not been paid for yet. It will not be activated until payment is received.
                </AlertDescription>
              </Alert>
            )}

            {error && (
              <Alert variant="destructive" className="mt-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button onClick={handleApprove} disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Confirm Approval
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
