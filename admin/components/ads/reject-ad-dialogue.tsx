"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { XCircle, Loader2 } from "lucide-react";
import { Toaster } from "@/components/toaster";
import { toast } from "@/components/ui/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface RejectAdDialogProps {
  ad: any;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function RejectAdDialog({ ad, isOpen, onClose, onSuccess }: RejectAdDialogProps) {
  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const rejectionReasons = [
    { id: "policy_violation", label: "Policy Violation" },
    { id: "inappropriate_content", label: "Inappropriate Content" },
    { id: "misleading_information", label: "Misleading Information" },
    { id: "prohibited_product", label: "Prohibited Product" },
    { id: "other", label: "Other" },
  ];

  const handleReject = async () => {
    console.log("Add to reject: ", ad);
    if (!reason) {
      const errorMessage = "Please select a rejection reason";
      setError(errorMessage);
      toast({
        variant: "destructive",
        title: "Error",
        description: errorMessage,
      });
      return;
    }

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
          action: "REJECT",
          reason: rejectionReasons.find((r) => r.id === reason)?.label || reason,
          description,
          tx_ref: ad.chapaRef,
          amount: ad.price,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to reject ad");
      }

      toast({
        variant: "default", // Use "success" if your toast component supports it
        title: "Success",
        description: "Ad rejected successfully",
      });
      onSuccess();
      onClose(); // Close the dialog after success
    } catch (err: any) {
      const message = err.message || "Failed to reject ad. Please try again.";
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
              <XCircle className="h-5 w-5 mr-2 text-destructive" />
              Reject Ad
            </DialogTitle>
          </DialogHeader>

          <div className="py-4">
            <p className="mb-4">You are about to reject the following ad:</p>

            <div className="bg-muted p-3 rounded-md mb-4">
              <div className="font-medium">{ad.product.productName}</div>
              <div className="text-sm text-muted-foreground">by {ad.merchantDetail.merchantName}</div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Rejection Reason</Label>
                <Select value={reason} onValueChange={setReason}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a reason" />
                  </SelectTrigger>
                  <SelectContent>
                    {rejectionReasons.map((item) => (
                      <SelectItem key={item.id} value={item.id}>
                        {item.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Additional Details</Label>
                <Textarea
                  id="description"
                  placeholder="Provide additional details about the rejection reason..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                />
              </div>
            </div>

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
            <Button variant="destructive" onClick={handleReject} disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Confirm Rejection
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}