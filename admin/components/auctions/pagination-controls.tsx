"use client"

import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useState } from "react"

interface PaginationControlsProps {
  totalPages: number
  currentPage: number
  onPageChange?: (page: number) => void
}

export function PaginationControls({ totalPages, currentPage = 1, onPageChange }: PaginationControlsProps) {
  const [page, setPage] = useState(currentPage)

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return
    setPage(newPage)
    onPageChange?.(newPage)
  }

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages = []
    const maxPagesToShow = 5

    if (totalPages <= maxPagesToShow) {
      // Show all pages if total is less than max to show
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      // Always show first page
      pages.push(1)

      // Calculate start and end of page range
      let start = Math.max(2, page - 1)
      let end = Math.min(totalPages - 1, page + 1)

      // Adjust if we're at the beginning
      if (page <= 2) {
        end = Math.min(totalPages - 1, maxPagesToShow - 1)
      }

      // Adjust if we're at the end
      if (page >= totalPages - 1) {
        start = Math.max(2, totalPages - maxPagesToShow + 2)
      }

      // Add ellipsis after first page if needed
      if (start > 2) {
        pages.push(-1) // -1 represents ellipsis
      }

      // Add middle pages
      for (let i = start; i <= end; i++) {
        pages.push(i)
      }

      // Add ellipsis before last page if needed
      if (end < totalPages - 1) {
        pages.push(-2) // -2 represents ellipsis
      }

      // Always show last page
      if (totalPages > 1) {
        pages.push(totalPages)
      }
    }

    return pages
  }

  const pageNumbers = getPageNumbers()

  return (
    <div className="flex items-center justify-center space-x-2 py-4">
      <Button variant="outline" size="icon" onClick={() => handlePageChange(page - 1)} disabled={page === 1}>
        <ChevronLeft className="h-4 w-4" />
        <span className="sr-only">Previous page</span>
      </Button>

      {pageNumbers.map((pageNum, i) =>
        pageNum < 0 ? (
          <span key={`ellipsis-${i}`} className="px-2">
            &hellip;
          </span>
        ) : (
          <Button
            key={pageNum}
            variant={pageNum === page ? "default" : "outline"}
            size="icon"
            onClick={() => handlePageChange(pageNum)}
            className="h-8 w-8"
          >
            {pageNum}
          </Button>
        ),
      )}

      <Button variant="outline" size="icon" onClick={() => handlePageChange(page + 1)} disabled={page === totalPages}>
        <ChevronRight className="h-4 w-4" />
        <span className="sr-only">Next page</span>
      </Button>
    </div>
  )
}

