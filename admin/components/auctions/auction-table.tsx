"use client"

import { useState } from "react"
import { CheckCircle, XCircle, Clock, MoreHorizontal, Eye } from "lucide-react"
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
import { AuctionDetailsDialog } from "@/components/auctions/auction-details-dialog"

interface AuctionTableProps {
  auctions: any[]
  isLoading: boolean
  onViewAuction: (auction: any) => void
  onAction: (type: "approve" | "reject", auctionId: string, rejectionReason?: string) => void
}

export function AuctionTable({ auctions, isLoading, onViewAuction, onAction }: AuctionTableProps) {
  const [selectedAuction, setSelectedAuction] = useState<any>(null)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)

  const handleRowClick = (auction: any) => {
    setSelectedAuction(auction)
    setViewDialogOpen(true)
  }

  const handleViewAuction = (auction: any) => {
    setSelectedAuction(auction)
    setViewDialogOpen(true)
    onViewAuction(auction)
  }

  const getStatusDisplay = (status: string) => {
    switch (status) {
      case "requested":
        return (
          <span className="flex items-center text-yellow-500">
            <Clock className="mr-1 h-4 w-4" /> Requested
          </span>
        )
      case "active":
        return (
          <span className="flex items-center text-green-500">
            <CheckCircle className="mr-1 h-4 w-4" /> Active
          </span>
        )
      case "ended":
        return (
          <span className="flex items-center text-blue-500">
            <CheckCircle className="mr-1 h-4 w-4" /> Ended
          </span>
        )
      case "cancelled":
        return (
          <span className="flex items-center text-red-500">
            <XCircle className="mr-1 h-4 w-4" /> Cancelled
          </span>
        )
      case "rejected":
        return (
          <span className="flex items-center text-red-500">
            <XCircle className="mr-1 h-4 w-4" /> Rejected
          </span>
        )
      default:
        return (
          <span className="flex items-center text-gray-500">
            <Clock className="mr-1 h-4 w-4" /> Unknown
          </span>
        )
    }
  }

  return (
    <>
      <div className="overflow-auto rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead className="hidden md:table-cell">Merchant</TableHead>
              <TableHead>Starting Price</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="hidden md:table-cell">Start/End Time</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  Loading auctions...
                </TableCell>
              </TableRow>
            ) : auctions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  No auctions found matching your filters
                </TableCell>
              </TableRow>
            ) : (
              auctions.map((auction) => (
                <TableRow
                  key={auction._id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleRowClick(auction)}
                >
                  <TableCell className="font-medium">
                    {auction.productName || `Product ${auction._id.slice(-4)}`}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {auction.merchantName || `Merchant ${auction._id.slice(-4)}`}
                  </TableCell>
                  <TableCell>${auction.startingPrice.toFixed(2)}</TableCell>
                  <TableCell>{getStatusDisplay(auction.status)}</TableCell>
                  <TableCell className="hidden md:table-cell">
                    {new Date(auction.startTime).toLocaleDateString()} -{" "}
                    {new Date(auction.endTime).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleViewAuction(auction)
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
                            <DialogTitle>Auction Actions</DialogTitle>
                            <DialogDescription>Choose an action for this auction</DialogDescription>
                          </DialogHeader>
                          <div className="grid gap-4 py-4">
                            <Button className="w-full" variant="outline" onClick={() => handleViewAuction(auction)}>
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </Button>

                            {auction.status === "requested" && (
                              <>
                                <Button
                                  className="w-full"
                                  variant="default"
                                  onClick={() => onAction("approve", auction._id)}
                                >
                                  <CheckCircle className="mr-2 h-4 w-4" />
                                  Approve Auction
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

      {selectedAuction && (
        <AuctionDetailsDialog
          auction={selectedAuction}
          open={viewDialogOpen}
          onOpenChange={setViewDialogOpen}
          onAction={onAction}
        />
      )}
    </>
  )
}

