"use client"

import { useState } from "react"
import { Plus } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Session } from "next-auth"
import { toast } from "../ui/use-toast"

interface CreateCategoryDialogProps {
  userSession: Session;
  onCategoryAdded: (category: any) => void
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function CreateCategoryDialog({ onCategoryAdded, open, onOpenChange }: CreateCategoryDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Use the controlled state if provided, otherwise use internal state
  const dialogOpen = open !== undefined ? open : isOpen
  const setDialogOpen = onOpenChange || setIsOpen

  const validateForm = () => {
    const newErrors: { name?: string; description?: string } = {}

    if (!name.trim()) {
      newErrors.name = "Category name is required"
    }

    if (!description.trim()) {
      newErrors.description = "Description is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validateForm()) return;
  
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/manageCategory", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, description }),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create category");
      }
  
      const newCategory = await response.json();
  
      onCategoryAdded(newCategory);
      setDialogOpen(false);
      resetForm();
  
      // Show success toast
      toast({
        title: "Success",
        description: "Category successfully created!",
      });
  
    } catch (error: unknown) {
      let errorMessage = "An unexpected error occurred";
      
      // Handle the unknown error type
      if (error instanceof Error) {
        errorMessage = error.message;
      }
  
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to create category: ${errorMessage}`,
      });
  
      console.error("Error creating category:", errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  
  const resetForm = () => {
    setName("")
    setDescription("")
    setErrors({})
  }

  const [errors, setErrors] = useState<{ name?: string; description?: string }>({})

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button className="">
          <Plus className="mr-2 h-4 w-4" />
          Create Category
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Category</DialogTitle>
          <DialogDescription>Add a new category to the marketplace</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name" className={errors.name ? "text-destructive" : ""}>
              Name
            </Label>
            <Input
              id="name"
              placeholder="Electronics"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={errors.name ? "border-destructive" : ""}
            />
            {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="description" className={errors.description ? "text-destructive" : ""}>
              Description
            </Label>
            <Textarea
              id="description"
              placeholder="Electronic devices and gadgets"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={errors.description ? "border-destructive" : ""}
              rows={3}
            />
            {errors.description && <p className="text-xs text-destructive">{errors.description}</p>}
          </div>
        </div>
        <DialogFooter className="flex flex-row justify-between items-center">
          <Button variant="outline" onClick={() => setDialogOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Creating..." : "Create Category"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

