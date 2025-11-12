"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  CheckCircle,
  XCircle,
  AlertCircle,
  MapPin,
  Calendar,
  DollarSign,
  Clock,
  Ban,
  User,
  Mail,
  Phone,
  Tag,
  ShoppingBag,
} from "lucide-react";
import Image from "next/image";
import { format } from "date-fns";
import LocationMap from "../location/LocationMap";

interface AdDetailDialogProps {
  ad: any;
  isOpen: boolean;
  onClose: () => void;
  onApprove?: () => void;
  onReject?: () => void;
}

export function AdDetailDialog({
  ad,
  isOpen,
  onClose,
  onApprove,
  onReject,
}: AdDetailDialogProps) {
  if (!ad) return null;

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Not set";
    return format(new Date(dateString), "PPP");
  };

  const getApprovalStatusBadge = (status: string) => {
    switch (status) {
      case "APPROVED":
        return (
          <Badge className="flex items-center gap-1">
            <CheckCircle className="h-3 w-3" /> Approved
          </Badge>
        );
      case "REJECTED":
        return (
          <Badge variant="destructive" className="flex items-center gap-1">
            <XCircle className="h-3 w-3" /> Rejected
          </Badge>
        );
      case "PENDING":
      default:
        return (
          <Badge variant="outline" className="flex items-center gap-1">
            <Clock className="h-3 w-3" /> Pending
          </Badge>
        );
    }
  };

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case "PAID":
        return (
          <Badge className="flex items-center gap-1">
            <DollarSign className="h-3 w-3" /> Paid
          </Badge>
        );
      case "FAILED":
        return (
          <Badge variant="destructive" className="flex items-center gap-1">
            <Ban className="h-3 w-3" /> Failed
          </Badge>
        );
      case "PENDING":
      default:
        return (
          <Badge variant="outline" className="flex items-center gap-1">
            <AlertCircle className="h-3 w-3" /> Pending
          </Badge>
        );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center justify-between">
            <span>Ad Details</span>
            <div className="flex items-center gap-2">
              {getApprovalStatusBadge(ad.approvalStatus)}
              {getPaymentStatusBadge(ad.paymentStatus)}
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          <Card>
            <CardContent className="p-4">
              <h3 className="text-lg font-semibold flex items-center mb-4">
                <ShoppingBag className="h-5 w-5 mr-2" />
                Product Information
              </h3>

              <div className="flex flex-col md:flex-row gap-4 items-start">
                <div className="relative w-[120px] h-[120px] flex-shrink-0">
                  <Image
                    src={
                      ad.product.image ||
                      "/placeholder.svg?height=120&width=120"
                    }
                    alt={ad.product.productName}
                    fill
                    className="object-cover rounded-md"
                  />
                </div>

                <div className="space-y-2 flex-1">
                  <div>
                    <span className="text-sm text-muted-foreground">
                      Product Name:
                    </span>
                    <p className="font-medium">{ad.product.productName}</p>
                  </div>

                  <div>
                    <span className="text-sm text-muted-foreground">
                      Product ID:
                    </span>
                    <p className="font-mono text-sm">{ad.product.productId}</p>
                  </div>

                  <div>
                    <span className="text-sm text-muted-foreground">
                      Product Price:
                    </span>
                    <p className="font-medium">
                      ${ad.product.price.toFixed(2)}
                    </p>
                  </div>

                  <div>
                    <span className="text-sm text-muted-foreground">
                      Ad Price:
                    </span>
                    <p className="font-medium text-green-600">
                      ${ad.adPrice.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Merchant Information */}
          <Card>
            <CardContent className="p-4">
              <h3 className="text-lg font-semibold flex items-center mb-4">
                <User className="h-5 w-5 mr-2" />
                Merchant Information
              </h3>

              <div className="space-y-3">
                <div className="flex items-center">
                  <User className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground w-24">
                    Name:
                  </span>
                  <span className="font-medium">
                    {ad.merchantDetail.merchantName}
                  </span>
                </div>

                <div className="flex items-center">
                  <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground w-24">
                    Email:
                  </span>
                  <span className="font-medium">
                    {ad.merchantDetail.merchantEmail}
                  </span>
                </div>

                <div className="flex items-center">
                  <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground w-24">
                    Phone:
                  </span>
                  <span className="font-medium">
                    {ad.merchantDetail.phoneNumber}
                  </span>
                </div>

                <div className="flex items-center">
                  <Tag className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground w-24">
                    Merchant ID:
                  </span>
                  <span className="font-mono text-sm">
                    {ad.merchantDetail.merchantId}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Ad Status */}
          <Card>
            <CardContent className="p-4">
              <h3 className="text-lg font-semibold flex items-center mb-4">
                <AlertCircle className="h-5 w-5 mr-2" />
                Ad Status
              </h3>

              <div className="space-y-3">
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground w-24">
                    Created:
                  </span>
                  <span>{formatDate(ad.createdAt)}</span>
                </div>

                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground w-24">
                    Starts:
                  </span>
                  <span>{formatDate(ad.startsAt)}</span>
                </div>

                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground w-24">
                    Ends:
                  </span>
                  <span>{formatDate(ad.endsAt)}</span>
                </div>

                <div className="flex items-center">
                  <AlertCircle className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground w-24">
                    Active:
                  </span>
                  <span>{ad.isActive ? "Yes" : "No"}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <h3 className="text-lg font-semibold flex items-center mb-4">
                <MapPin className="h-5 w-5 mr-2" />
                Location
              </h3>

              <div className="space-y-3">
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground w-24">
                    Coordinates:
                  </span>
                  <span className="font-mono text-sm">
                    {ad.location.coordinates[0]}, {ad.location.coordinates[1]}
                  </span>
                </div>

                <div className="h-40 md:h-64 rounded-md overflow-hidden border">
                  <LocationMap
                    location={ad.location.coordinates} // [lng, lat]
                    title="Ad Location"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Rejection Reason (if rejected) */}
        {ad.approvalStatus === "REJECTED" && ad.rejectionReason && (
          <Card className="mt-6 border-destructive/20 bg-destructive/5">
            <CardContent className="p-4">
              <h3 className="text-lg font-semibold flex items-center text-destructive mb-2">
                <XCircle className="h-5 w-5 mr-2" />
                Rejection Reason
              </h3>

              <div className="space-y-2">
                <div>
                  <span className="text-sm font-medium">Reason:</span>
                  <p>{ad.rejectionReason.reason}</p>
                </div>

                {ad.rejectionReason.description && (
                  <div>
                    <span className="text-sm font-medium">Description:</span>
                    <p className="text-sm text-muted-foreground">
                      {ad.rejectionReason.description}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        <Separator className="my-4" />

        <DialogFooter className="flex items-center justify-between sm:justify-between">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>

          <div className="flex gap-2">
            {ad.approvalStatus === "PENDING" && (
              <>
                {onReject && (
                  <Button variant="destructive" onClick={onReject}>
                    <XCircle className="h-4 w-4 mr-2" />
                    Reject
                  </Button>
                )}

                {onApprove && (
                  <Button variant="default" onClick={onApprove}>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Approve
                  </Button>
                )}
              </>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
