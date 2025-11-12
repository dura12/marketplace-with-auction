"use client"

import type React from "react"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, X, Upload } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface AddProductDialogProps {
  onProductAdded: () => void
}

export function AddProductDialog({ onProductAdded }: AddProductDialogProps) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [productData, setProductData] = useState({
    productName: "",
    description: "",
    price: "",
    quantity: "",
    categoryId: "",
    brand: "",
    delivery: "FLAT",
    deliveryPrice: "",
    variants: [] as string[],
    sizes: [] as string[],
  })
  const [newVariant, setNewVariant] = useState("")
  const [newSize, setNewSize] = useState("")
  const { toast } = useToast()

  // Categories data (mock)
  const categories = [
    { id: "category_1", name: "Electronics" },
    { id: "category_2", name: "Clothing" },
    { id: "category_3", name: "Home & Garden" },
    { id: "category_4", name: "Beauty" },
    { id: "category_5", name: "Toys" },
    { id: "category_6", name: "Sports" },
  ]

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setProductData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setProductData((prev) => ({ ...prev, [name]: value }))
  }

  const addVariant = () => {
    if (newVariant.trim() && !productData.variants.includes(newVariant.trim())) {
      setProductData((prev) => ({
        ...prev,
        variants: [...prev.variants, newVariant.trim()],
      }))
      setNewVariant("")
    }
  }

  const removeVariant = (variant: string) => {
    setProductData((prev) => ({
      ...prev,
      variants: prev.variants.filter((v) => v !== variant),
    }))
  }

  const addSize = () => {
    if (newSize.trim() && !productData.sizes.includes(newSize.trim())) {
      setProductData((prev) => ({
        ...prev,
        sizes: [...prev.sizes, newSize.trim()],
      }))
      setNewSize("")
    }
  }

  const removeSize = (size: string) => {
    setProductData((prev) => ({
      ...prev,
      sizes: prev.sizes.filter((s) => s !== size),
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      toast({
        title: "Success",
        description: "Product added successfully",
      })

      // Reset form and close dialog
      setProductData({
        productName: "",
        description: "",
        price: "",
        quantity: "",
        categoryId: "",
        brand: "",
        delivery: "FLAT",
        deliveryPrice: "",
        variants: [],
        sizes: [],
      })
      setOpen(false)
      onProductAdded()
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add product. Please try again.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Product
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Product</DialogTitle>
          <DialogDescription>Fill in the details to add a new product to the marketplace.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="productName">Product Name *</Label>
              <Input
                id="productName"
                name="productName"
                value={productData.productName}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="categoryId">Category *</Label>
              <Select
                value={productData.categoryId}
                onValueChange={(value) => handleSelectChange("categoryId", value)}
                required
              >
                <SelectTrigger id="categoryId">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">Price ($) *</Label>
              <Input
                id="price"
                name="price"
                type="number"
                min="0.01"
                step="0.01"
                value={productData.price}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity *</Label>
              <Input
                id="quantity"
                name="quantity"
                type="number"
                min="1"
                step="1"
                value={productData.quantity}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="brand">Brand</Label>
              <Input
                id="brand"
                name="brand"
                value={productData.brand}
                onChange={handleInputChange}
                placeholder="Brand name or 'Hand Made'"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="delivery">Delivery Type *</Label>
              <Select
                value={productData.delivery}
                onValueChange={(value) => handleSelectChange("delivery", value)}
                required
              >
                <SelectTrigger id="delivery">
                  <SelectValue placeholder="Select delivery type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="FLAT">Flat Rate</SelectItem>
                  <SelectItem value="PERPIECE">Per Piece</SelectItem>
                  <SelectItem value="PERKG">Per Kilogram</SelectItem>
                  <SelectItem value="FREE">Free Shipping</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="deliveryPrice">Delivery Price ($)</Label>
              <Input
                id="deliveryPrice"
                name="deliveryPrice"
                type="number"
                min="0"
                step="0.01"
                value={productData.deliveryPrice}
                onChange={handleInputChange}
                disabled={productData.delivery === "FREE"}
                required={productData.delivery !== "FREE"}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              name="description"
              value={productData.description}
              onChange={handleInputChange}
              rows={4}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Variants (Colors)</Label>
              <div className="flex gap-2">
                <Input
                  value={newVariant}
                  onChange={(e) => setNewVariant(e.target.value)}
                  placeholder="Add variant (e.g. Red)"
                />
                <Button type="button" onClick={addVariant} size="sm">
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {productData.variants.map((variant) => (
                  <div key={variant} className="flex items-center bg-muted px-2 py-1 rounded-md text-sm">
                    {variant}
                    <button
                      type="button"
                      onClick={() => removeVariant(variant)}
                      className="ml-1 text-muted-foreground hover:text-foreground"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Sizes</Label>
              <div className="flex gap-2">
                <Input
                  value={newSize}
                  onChange={(e) => setNewSize(e.target.value)}
                  placeholder="Add size (e.g. S, M, L)"
                />
                <Button type="button" onClick={addSize} size="sm">
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {productData.sizes.map((size) => (
                  <div key={size} className="flex items-center bg-muted px-2 py-1 rounded-md text-sm">
                    {size}
                    <button
                      type="button"
                      onClick={() => removeSize(size)}
                      className="ml-1 text-muted-foreground hover:text-foreground"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Product Images</Label>
            <div className="border-2 border-dashed rounded-md p-6 text-center">
              <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
              <p className="mt-2 text-sm text-muted-foreground">Drag and drop images here, or click to browse</p>
              <Button type="button" variant="outline" className="mt-4">
                Upload Images
              </Button>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Adding..." : "Add Product"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

