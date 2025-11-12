"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Trash2, RotateCcw, Pencil } from "lucide-react"
import { EditCategoryDialog } from "@/components/categories/edit-category-dialog"

interface CategoryDetailsDialogProps {
  category: any
  open: boolean
  onOpenChange: (open: boolean) => void
  onAction: (type: string, categoryId: string, data?: any) => void
  userSession: any
}

export function CategoryDetailsDialog({
  category,
  open,
  onOpenChange,
  onAction,
  userSession,
}: CategoryDetailsDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A"
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const canPerformAction = () => {
    if (userSession.user.role === "superAdmin") return true

    return category.createdBy === userSession.user.email
  }

  const handleAction = async (type: string) => {
    setIsLoading(true)
    try {
      console.log("Category actions: ", type, category._id);
      onAction(type, category._id)
    } finally {
      setIsLoading(false)
      onOpenChange(false)
    }
  }

  const handleEdit = () => {
    setShowEditDialog(true)
  }

  const handleEditComplete = (updatedData: any) => {
    setShowEditDialog(false)
    onAction("edit", category._id, updatedData)
    onOpenChange(false)
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Category Details</span>
              {category.isDeleted ? (
                <Badge variant="destructive">Deleted</Badge>
              ) : (
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  Active
                </Badge>
              )}
            </DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <span className="text-sm font-medium">Name:</span>
              <span className="col-span-3">{category.name}</span>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <span className="text-sm font-medium">Description:</span>
              <span className="col-span-3">{category.description}</span>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <span className="text-sm font-medium">Created By:</span>
              <span className="col-span-3">{category.createdBy}</span>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <span className="text-sm font-medium">Created At:</span>
              <span className="col-span-3">{formatDate(category.createdAt)}</span>
            </div>
            {category.isDeleted && (
              <div className="grid grid-cols-4 items-center gap-4">
                <span className="text-sm font-medium">Deleted At:</span>
                <span className="col-span-3">{formatDate(category.trashDate)}</span>
              </div>
            )}
          </div>

          <DialogFooter className="flex flex-row justify-between gap-2">
            {!category.isDeleted && canPerformAction() && (
              <>
                <Button variant="outline" onClick={handleEdit} disabled={isLoading}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit
                </Button>
                <Button variant="destructive" onClick={() => handleAction("delete")} disabled={isLoading}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </Button>
              </>
            )}
            {category.isDeleted && canPerformAction() && (
              <>
                <Button variant="outline" onClick={() => handleAction("restore")} disabled={isLoading}>
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Restore
                </Button>
                <Button variant="destructive" onClick={() => handleAction("permanent-delete")} disabled={isLoading}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Permanently Delete
                </Button>
              </>
            )}
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {showEditDialog && (
        <EditCategoryDialog
          category={category}
          open={showEditDialog}
          onOpenChange={setShowEditDialog}
          onSave={handleEditComplete}
        />
      )}
    </>
  )
}

