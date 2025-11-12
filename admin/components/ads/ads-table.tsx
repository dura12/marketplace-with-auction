"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  DollarSign,
  Clock,
  Ban,
} from "lucide-react";
import { format } from "date-fns";
import { AdDetailDialog } from "./ad-detail.dialogue";
import { ApproveAdDialog } from "./approve-ad-dialogue";
import { RejectAdDialog } from "./reject-ad-dialogue";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface AdsTableProps {
  ads: any[];
  isLoading: boolean;
  onRefresh: () => void;
}

export function AdsTable({ ads, isLoading, onRefresh }: AdsTableProps) {
  const router = useRouter();
  const [selectedAd, setSelectedAd] = useState<any>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isApproveOpen, setIsApproveOpen] = useState(false);
  const [isRejectOpen, setIsRejectOpen] = useState(false);
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;

  const totalPages = Math.ceil(ads.length / itemsPerPage);

  const paginatedAds = ads.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  const handleViewDetails = (ad: any) => {
    setSelectedAd(ad);
    setIsDetailOpen(true);
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

  const getActiveStatusBadge = (isActive: boolean) => {
    return isActive ? (
      <Badge className="flex items-center gap-1">
        <CheckCircle className="h-3 w-3" /> Active
      </Badge>
    ) : (
      <Badge variant="secondary" className="flex items-center gap-1">
        <Clock className="h-3 w-3" /> Inactive
      </Badge>
    );
  };

  return (
    <>
      <div className="rounded-md border overflow-y-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px] hidden sm:table-cell">Product</TableHead>
              <TableHead>Product Name</TableHead>
              <TableHead className="hidden sm:table-cell">Merchant</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="hidden sm:table-cell">Payment</TableHead>
              <TableHead className="hidden sm:table-cell">Active</TableHead>
              <TableHead className="hidden sm:table-cell">Created At</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center">
                  <div className="flex items-center justify-center">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading ads...
                  </div>
                </TableCell>
              </TableRow>
            ) : paginatedAds.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center">
                  No ads found.
                </TableCell>
              </TableRow>
            ) : (
              paginatedAds.map((ad) => (
                <TableRow
                  key={ad._id}
                  onClick={() => handleViewDetails(ad)}
                  className="cursor-pointer hover:bg-muted/50"
                >
                  <TableCell className="hidden sm:table-cell">
                    <div className="w-[50px] h-[50px] relative">
                      <Image
                        src={
                          ad.product.image ||
                          "/placeholder.svg?height=50&width=50"
                        }
                        alt={ad.product.productName}
                        fill
                        className="object-cover rounded-md"
                      />
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">
                    {ad.product.productName}
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">{ad.merchantDetail.merchantName}</TableCell>
                  <TableCell>${ad.adPrice.toFixed(2)}</TableCell>
                  <TableCell>
                    {getApprovalStatusBadge(ad.approvalStatus)}
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    {getPaymentStatusBadge(ad.paymentStatus)}
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">{getActiveStatusBadge(ad.isActive)}</TableCell>
                  <TableCell className="hidden sm:table-cell">
                    {format(new Date(ad.createdAt), "MMM d, yyyy")}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="p-4 border-t">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className={page <= 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNumber = i + 1;
                return (
                  <PaginationItem key={pageNumber} className="hidden sm:inline-block">
                    <PaginationLink
                      onClick={() => setPage(pageNumber)}
                      isActive={page === pageNumber}
                    >
                      {pageNumber}
                    </PaginationLink>
                  </PaginationItem>
                );
              })}
              <PaginationItem className="sm:hidden">
                <span className="px-4 py-2">
                  Page {page} of {totalPages}
                </span>
              </PaginationItem>
              <PaginationItem>
                <PaginationNext
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className={page >= totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}

      {/* Detail Dialog */}
      {selectedAd && (
        <AdDetailDialog
          ad={selectedAd}
          isOpen={isDetailOpen}
          onClose={() => setIsDetailOpen(false)}
          onApprove={() => {
            setIsDetailOpen(false);
            setIsApproveOpen(true);
          }}
          onReject={() => {
            setIsDetailOpen(false);
            setIsRejectOpen(true);
          }}
        />
      )}

      {/* Approve Dialog */}
      {selectedAd && (
        <ApproveAdDialog
          ad={selectedAd}
          isOpen={isApproveOpen}
          onClose={() => setIsApproveOpen(false)}
          onSuccess={() => {
            setIsApproveOpen(false);
            onRefresh();
          }}
        />
      )}

      {/* Reject Dialog */}
      {selectedAd && (
        <RejectAdDialog
          ad={selectedAd}
          isOpen={isRejectOpen}
          onClose={() => setIsRejectOpen(false)}
          onSuccess={() => {
            setIsRejectOpen(false);
            onRefresh();
          }}
        />
      )}
    </>
  );
}