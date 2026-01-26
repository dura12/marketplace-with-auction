"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { FilterBar } from "../filterBar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/libs/utils";
import { Edit, MoreHorizontal, Plus, Trash } from "lucide-react";
import { AddEditProductForm } from "./addEditProductForm";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/components/ui/use-toast";

export default function MerchantProducts() {
  const router = useRouter();
  const { toast } = useToast();
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState("asc");
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [isEditProductOpen, setIsEditProductOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const handleProductClick = (productId) => {
    router.push(`dashboard/products/${productId}`);
  };

  const handleAddProduct = () => {
    setIsAddProductOpen(true);
  };

  const handleEditProduct = (product, e) => {
    e.stopPropagation();
    setSelectedProduct(product);
    setIsEditProductOpen(true);
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  const handleFilterChange = (value) => {
    setFilter(value);
  };

  const filters = [
    { value: "all", label: "All Products" },
    { value: "banned", label: "Banned Products" },
    { value: "out-of-stock", label: "Out of Stock" },
    { value: "available", label: "Available Products" },
  ];

  const sortedProducts = useMemo(() => {
    try {
      const safeProducts = Array.isArray(products) ? products : [];
      if (!sortColumn) return safeProducts;

      return [...safeProducts].sort((a, b) => {
        const valA = sortColumn.includes(".")
          ? sortColumn.split(".").reduce((o, i) => (o && o[i]) ? o[i] : "", a)
          : a[sortColumn] || "";
        const valB = sortColumn.includes(".")
          ? sortColumn.split(".").reduce((o, i) => (o && o[i]) ? o[i] : "", b)
          : b[sortColumn] || "";

        if (typeof valA === "string" && typeof valB === "string") {
          return sortDirection === "asc"
            ? valA.localeCompare(valB)
            : valB.localeCompare(valA);
        }

        return sortDirection === "asc"
          ? valA < valB ? -1 : valA > valB ? 1 : 0
          : valA > valB ? -1 : valA < valB ? 1 : 0;
      });
    } catch (err) {
      console.error("Sorting error:", err);
      return Array.isArray(products) ? products : [];
    }
  }, [products, sortColumn, sortDirection]);

  const filteredProducts = useMemo(() => {
    try {
      if (!Array.isArray(sortedProducts)) return [];

      return sortedProducts.filter((product) => {
        const productName = product?.productName || "";
        const status = product?.isBanned ? "Banned" : product?.quantity > 0 ? "Available" : "Out of Stock";
        const quantity = product?.quantity ?? 0;
        const categoryName = product?.category?.categoryName || "";

        const matchesSearch =
          productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          categoryName.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesFilter =
          filter === "all" ||
          (filter === "banned" && status === "Banned") ||
          (filter === "out-of-stock" && quantity === 0) ||
          (filter === "available" && quantity > 0);

        return matchesSearch && matchesFilter;
      });
    } catch (err) {
      console.error("Filtering error:", err);
      return [];
    }
  }, [sortedProducts, searchQuery, filter]);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/products");
      if (!response.ok) {
        throw new Error(`Failed to fetch products (HTTP ${response.status})`);
      }

      const data = await response.json();
      const productData = data.products || [];
      if (!Array.isArray(productData)) {
        throw new Error("Invalid data format: Expected array of products");
      }

      const validatedProducts = productData.map((item) => ({
        _id: item._id || "",
        productName: item.productName || "Unnamed Product",
        category: item.category || { categoryName: "Uncategorized" },
        isBanned: item.isBanned || false,
        price: Number(item.price) || 0,
        quantity: Number(item.quantity) || 0,
        soldQuantity: Number(item.soldQuantity) || 0,
        images: Array.isArray(item.images) ? item.images : ["/placeholder.svg"],
        deliveryPrice: item.deliveryPrice || 0,
        location: item.location || { coordinates: [0, 0] },
        mass: item.mass, // Include mass
      }));

      setProducts(validatedProducts);
    } catch (err) {
      console.error("Fetch error:", err);
      setError(err.message);
      setProducts([]);

      if (products.length > 0) {
        toast({
          title: "Failed to load products",
          description: err.message,
          variant: "destructive",
          action: (
            <Button variant="ghost" onClick={fetchProducts}>
              Retry
            </Button>
          ),
        });
      }
    } finally {
      setLoading(false);
    }
  }, [toast, products.length]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleDeleteProduct = useCallback(async (product, e) => {
    e?.stopPropagation();
    setSelectedProduct(product);
    setIsDeleteDialogOpen(true);
  }, []);

  const confirmDelete = useCallback(async () => {
    try {
      const response = await fetch(`/api/products?productId=${selectedProduct?._id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete product");
      }

      setProducts((prev) =>
        prev.map((p) =>
          p._id === selectedProduct._id ? { ...p, isDeleted: true } : p
        )
      );

      toast({
        title: "Product moved to trash",
        description: `${selectedProduct?.productName} will be permanently deleted after 30 days.`,
      });
    } catch (err) {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setIsDeleteDialogOpen(false);
    }
  }, [selectedProduct, toast]);

  const handleSort = useCallback((column) => {
    setSortColumn((prev) => {
      if (prev === column) {
        setSortDirection((dir) => (dir === "asc" ? "desc" : "asc"));
        return column;
      }
      setSortDirection("asc");
      return column;
    });
  }, []);

  const getProductStatus = useCallback((product) => {
    if (product.isBanned) return "Banned";
    const quantity = product?.quantity ?? 0;
    if (quantity <= 0) return "Out of Stock";
    if (quantity <= 2) return "Low Stock";
    return "In Stock";
  }, []);

  if (loading && products.length === 0) {
    return (
      <div className="container p-6">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          <span className="ml-4">Loading products...</span>
        </div>
      </div>
    );
  }

  if (error && products.length === 0) {
    return (
      <div className="container p-6">
        <div className="bg-destructive/10 p-4 rounded-lg flex flex-col items-center">
          <p className="text-destructive mb-4">{error}</p>
          <Button onClick={fetchProducts} variant="outline">
            Retry Loading
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container p-6">
      <div className="mb-6">
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight">Products</h2>
        <p className="text-sm sm:text-base text-muted-foreground">Manage your products and inventory</p>
      </div>
      <FilterBar
        placeholder="Search products..."
        filters={filters}
        onSearch={handleSearch}
        onFilterChange={handleFilterChange}
      />
      <div className="rounded-xl border bg-card p-4 md:p-6">
        <div className="flex flex-col sm:flex-row items-center justify-end">
          <Button className="gradient-bg border-0 w-full md:w-auto" onClick={handleAddProduct}>
            <Plus className="mr-2 h-4 w-4" />
            Add Product
          </Button>
        </div>
        <div className="w-full overflow-x-auto">
          <Table className="min-w-[600px] w-full">
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead className="cursor-pointer" onClick={() => handleSort("category.categoryName")}>
                  Category
                </TableHead>
                <TableHead className="cursor-pointer" onClick={() => handleSort("isBanned")}>
                  Status
                </TableHead>
                <TableHead className="cursor-pointer" onClick={() => handleSort("price")}>
                  Price
                </TableHead>
                <TableHead className="cursor-pointer" onClick={() => handleSort("quantity")}>
                  Available
                </TableHead>
                <TableHead className="cursor-pointer" onClick={() => handleSort("soldQuantity")}>
                  Sold
                </TableHead>
                <TableHead className="">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.map((product) => (
                <TableRow
                  key={product._id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleProductClick(product._id)}
                >
                  <TableCell>
                    <div className="flex items-center gap-2 sm:gap-4">
                      <Image
                        src={product.images[0] || "/placeholder.svg"}
                        alt={product.productName}
                        width={40}
                        height={40}
                        className="rounded-lg object-cover"
                      />
                      <span className="text-sm sm:text-base">{product.productName}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right text-sm">{product.category.categoryName}</TableCell>
                  <TableCell>
                    <div
                      className={cn(
                        "inline-flex items-center rounded-full px-2 py-0.5 text-xs text-right sm:text-sm font-medium",
                        getProductStatus(product) === "In Stock" && "bg-success/10 text-success",
                        getProductStatus(product) === "Low Stock" && "bg-warning/10 text-warning",
                        getProductStatus(product) === "Out of Stock" && "bg-destructive/10 text-destructive",
                        getProductStatus(product) === "Banned" && "bg-destructive/10 text-destructive"
                      )}
                    >
                      {getProductStatus(product)}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm sm:text-base">${product.price.toFixed(2)}</TableCell>
                  <TableCell className="text-center text-sm sm:text-base">{product.quantity}</TableCell>
                  <TableCell className="text-center text-sm sm:text-base">{product.soldQuantity}</TableCell>
                  <TableCell className="text-sm sm:text-base">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Actions</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={(e) => handleEditProduct(product , e)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit Product
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={(e) => handleDeleteProduct(product, e)}
                        >
                          <Trash className="mr-2 h-4 w-4" />
                          Delete Product
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <AddEditProductForm open={isAddProductOpen} onOpenChange={setIsAddProductOpen} product={null} mode="add" />
        {selectedProduct && (
          <AddEditProductForm
            open={isEditProductOpen}
            onOpenChange={setIsEditProductOpen}
            product={selectedProduct}
            mode="edit"
          />
        )}

        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure you want to delete this product?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the product "{selectedProduct?.productName}"
                and remove it from our servers.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmDelete}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}