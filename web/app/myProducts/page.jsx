"use client"

import { useState, useEffect } from "react"
import { Plus, Search, Edit, Trash2, AlertCircle } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import Image from "next/image"

// Demo data
const demoProducts = Array.from({ length: 12 }, (_, i) => ({
  id: `prod-${i + 1}`,
  name: `Product ${i + 1}`,
  description: "A great product description that highlights all the key features and benefits...",
  price: Math.floor(Math.random() * 1000) + 99,
  category: ["Electronics", "Fashion", "Home", "Sports"][Math.floor(Math.random() * 4)],
  image: "/placeholder.svg",
  stock: Math.floor(Math.random() * 100),
  status: ["active", "draft"][Math.floor(Math.random() * 2)],
  createdAt: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000),
}))

const categories = ["Electronics", "Fashion", "Home", "Sports"]

export default function MyProductsPage() {
  const [products, setProducts] = useState(demoProducts)
  const [filteredProducts, setFilteredProducts] = useState(demoProducts)
  const [searchQuery, setSearchQuery] = useState("")
  const [showAddEditDialog, setShowAddEditDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    stock: "",
    status: "draft",
    image: null,
  })

  useEffect(() => {
    // Replace with actual API call
    // const fetchProducts = async () => {
    //   const response = await fetch('/api/merchant/products')
    //   const data = await response.json()
    //   setProducts(data)
    //   setFilteredProducts(data)
    // }
    // fetchProducts()
  }, [])

  useEffect(() => {
    const filtered = products.filter(
      (product) =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase())
    )
    setFilteredProducts(filtered)
  }, [searchQuery, products])

  const handleAddEdit = async (e) => {
    e.preventDefault()
    
    try {
      if (selectedProduct) {
        // Edit product
        // await fetch(`/api/products/${selectedProduct.id}`, {
        //   method: 'PUT',
        //   body: JSON.stringify(formData)
        // })
        setProducts((prev) =>
          prev.map((p) => (p.id === selectedProduct.id ? { ...p, ...formData } : p))
        )
      } else {
        // Add new product
        // const response = await fetch('/api/products', {
        //   method: 'POST',
        //   body: JSON.stringify(formData)
        // })
        setProducts((prev) => [...prev, { ...formData, id: `prod-${prev.length + 1}` }])
      }
      
      setShowAddEditDialog(false)
      setSelectedProduct(null)
      setFormData({
        name: "",
        description: "",
        price: "",
        category: "",
        stock: "",
        status: "draft",
        image: null,
      })
    } catch (error) {
      console.error("Failed to save product:", error)
    }
  }

  const handleDelete = async () => {
    try {
      // await fetch(`/api/products/${selectedProduct.id}`, {
      //   method: 'DELETE'
      // })
      setProducts((prev) => prev.filter((p) => p.id !== selectedProduct.id))
      setShowDeleteDialog(false)
      setSelectedProduct(null)
    } catch (error) {
      console.error("Failed to delete product:", error)
    }
  }

  const openEditDialog = (product) => {
    setSelectedProduct(product)
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      category: product.category,
      stock: product.stock.toString(),
      status: product.status,
      image: product.image,
    })
    setShowAddEditDialog(true)
  }

  return (
    <div className="container py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">My Products</h1>
        <div className="flex items-center gap-4">
          <div className="relative w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
            />
          </div>
          <Button onClick={() => setShowAddEditDialog(true)}>
            <Plus className="mr-2 h-4 w-4" /> Add Product
          </Button>
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredProducts.map((product) => (
          <Card key={product.id} className="overflow-hidden">
            <div className="relative aspect-square">
              <Image
                src={product.image || "/placeholder.svg"}
                alt={product.name}
                fill
                className="object-cover"
              />
              <div className="absolute right-2 top-2">
                <Badge
                  variant={product.status === "active" ? "success" : "secondary"}
                >
                  {product.status}
                </Badge>
              </div>
            </div>
            <CardContent className="p-4">
              <h3 className="font-semibold truncate">{product.name}</h3>
              <p className="text-sm text-muted-foreground line-clamp-2 h-10">
                {product.description}
              </p>
              <div className="mt-2 flex items-center justify-between">
                <span className="font-bold">${product.price}</span>
                <span className="text-sm text-muted-foreground">
                  Stock: {product.stock}
                </span>
              </div>
            </CardContent>
            <CardFooter className="p-4 pt-0 flex justify-between">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => openEditDialog(product)}
              >
                <Edit className="h-4 w-4" />
                <span className="sr-only">Edit</span>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-destructive"
                onClick={() => {
                  setSelectedProduct(product)
                  setShowDeleteDialog(true)
                }}
              >
                <Trash2 className="h-4 w-4" />
                <span className="sr-only">Delete</span>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <Dialog open={showAddEditDialog} onOpenChange={setShowAddEditDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{selectedProduct ? "Edit Product" : "Add New Product"}</DialogTitle>
            <DialogDescription>
              Fill in the information below to {selectedProduct ? "update your" : "create a new"} product.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddEdit} className="space-y-6">
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Product Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="price">Price</Label>
                  <Input
                    id="price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="stock">Stock</Label>
                  <Input
                    id="stock"
                    type="number"
                    min="0"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData({ ...formData, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="image">Product Image</Label>
                <Input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) {
                      setFormData({ ...formData, image: URL.createObjectURL(file) })
                    }
                  }}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit">{selectedProduct ? "Update" : "Create"} Product</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your product
              and remove it from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
