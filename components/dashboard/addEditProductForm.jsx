"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { X, Plus, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import LocationPicker from "../location-picker";
import { uploadImagesToFirebase } from "@/libs/utils";

// Updated schema to remove latitude and longitude
const formSchema = z.object({
  productName: z.string().min(2, { message: "Product name must be at least 2 characters." }),
  categoryId: z.string().min(1, { message: "Please select a category." }),
  price: z.string().min(1, { message: "Price is required." }),
  quantity: z.string().min(1, { message: "Quantity is required." }),
  description: z.string().min(10, { message: "Description must be at least 10 characters." }),
  brand: z.string().optional(),
  delivery: z.enum(["PERPIECE", "PERKG", "FREE", "FLAT", "PERKM"]),
  deliveryPrice: z.string(),
  KilometerPerPrice: z.string().optional().refine((val) => {
    if (val) return Number(val) > 0;
    return true;
  }, { message: "Kilometers per price must be a positive number." }),
  KilogramPerPrice: z.string().optional().refine((val) => {
    if (val) return Number(val) > 0;
    return true;
  }, { message: "Kilograms per price must be a positive number." }),
});

export function AddEditProductForm({ open, onOpenChange, product, mode }) {
  const { toast } = useToast();
  const [variants, setVariants] = useState([]);
  const [newVariant, setNewVariant] = useState("");
  const [sizes, setSizes] = useState([]);
  const [newSize, setNewSize] = useState("");
  const [images, setImages] = useState([]);
  const [categories, setCategories] = useState([]);
  const [location, setLocation] = useState({ lat: 9.03, lng: 38.74 });
  const [uploadProgress, setUploadProgress] = useState({});
  const [uploadError, setUploadError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      productName: "",
      categoryId: "",
      price: "",
      quantity: "",
      description: "",
      brand: "Hand Made",
      delivery: "FREE",
      deliveryPrice: "0",
      KilometerPerPrice: "",
      KilogramPerPrice: "",
    },
  });

  const { formState } = form;
  const isDirty = formState.isDirty;

  // Initialize form with product data when editing
  useEffect(() => {
    if (mode === "edit" && product) {
      const initialValues = {
        productName: product.productName || "",
        categoryId: product.category?.categoryId || "",
        price: product.price?.toString() || "",
        quantity: product.quantity?.toString() || "",
        description: product.description || "",
        brand: product.brand || "Hand Made",
        delivery: product.delivery || "FREE",
        deliveryPrice: product.delivery === "FREE" ? "0" : product.deliveryPrice?.toString() || "0",
        KilometerPerPrice: product.KilometerPerPrice?.toString() || "",
        KilogramPerPrice: product.KilogramPerPrice?.toString() || "",
      };

      form.reset(initialValues);
      setVariants(product.variant || []);
      setSizes(product.size || []);
      setImages(product.images || []);
      setLocation({
        lat: product.location?.coordinates[1] || 9.03,
        lng: product.location?.coordinates[0] || 38.74
      });
    } else {
      form.reset({
        productName: "",
        categoryId: "",
        price: "",
        quantity: "",
        description: "",
        brand: "Hand Made",
        delivery: "FREE",
        deliveryPrice: "0",
        KilometerPerPrice: "",
        KilogramPerPrice: "",
      });
      setVariants([]);
      setSizes([]);
      setImages([]);
      setLocation({ lat: 9.03, lng: 38.74 });
    }
  }, [form, mode, product]);
  
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch("/api/categories");
        if (!response.ok) throw new Error("Failed to fetch categories");
        const data = await response.json();
        setCategories(data);
      } catch (error) {
        console.error("Error fetching categories:", error.message);
      }
    };
    fetchCategories();
  }, []);

  const handleAddVariant = () => {
    if (newVariant && !variants.includes(newVariant)) {
      setVariants([...variants, newVariant]);
      setNewVariant("");
    }
  };

  const handleRemoveVariant = (variant) => {
    setVariants(variants.filter((v) => v !== variant));
  };

  const handleAddSize = () => {
    if (newSize && !sizes.includes(newSize)) {
      setSizes([...sizes, newSize]);
      setNewSize("");
    }
  };

  const handleRemoveSize = (size) => {
    setSizes(sizes.filter((s) => s !== size));
  };

  const validateImage = (file) => {
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!validTypes.includes(file.type)) {
      throw new Error(`Invalid file type. Only ${validTypes.join(', ')} are allowed.`);
    }

    if (file.size > maxSize) {
      throw new Error('File size must be less than 5MB');
    }

    return true;
  };

  const handleImageUpload = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadError(null);
    const newProgress = {};
    const validFiles = [];

    // Validate all files first
    try {
      Array.from(files).forEach(file => {
        validateImage(file);
        validFiles.push(file);
        newProgress[file.name] = 0;
      });
    } catch (error) {
      setUploadError(error.message);
      return;
    }

    setUploadProgress(newProgress);

    try {
      const uploadedUrls = await uploadImagesToFirebase(validFiles, (progress) => {
        setUploadProgress(prev => ({
          ...prev,
          [progress.fileName]: progress.progress
        }));
      });

      setImages(prev => [...prev, ...uploadedUrls]);
      setUploadProgress({});
    } catch (error) {
      setUploadError('Failed to upload images. Please try again.');
      console.error('Upload failed:', error);
    }
  };

  const handleRemoveImage = (index) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const onSubmit = async (values) => {
    setIsSubmitting(true);
    try {
      const selectedCategory = categories.find((cat) => cat._id === values.categoryId);
      if (!selectedCategory) {
        throw new Error("Selected category not found");
      }

      const productData = {
        productName: values.productName,
        category: {
          categoryId: values.categoryId,
          categoryName: selectedCategory.name,
        },
        price: Number(values.price),
        quantity: Number(values.quantity),
        description: values.description,
        brand: values.brand,
        delivery: values.delivery,
        deliveryPrice: values.delivery === "FREE" ? 0 : Number(values.deliveryPrice),
        KilometerPerPrice: values.delivery === "PERKM" ? Number(values.KilometerPerPrice) : undefined,
        KilogramPerPrice: values.delivery === "PERKG" ? Number(values.KilogramPerPrice) : undefined,
        variant: variants,
        size: sizes,
        images: images,
        location: {
          type: "Point",
          coordinates: [location.lng, location.lat],
        },
      };

      console.log("Product data: ", productData);

      const url = mode === "add" ? "/api/products" : `/api/products?productId=${product._id}`;
      const response = await fetch(url, {
        method: mode === "add" ? "POST" : "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(productData),
      });

      const data = await response.json();
      
      if (!response.ok) {
        if (response.status === 400 && data.error === "Product listing appears to be fraudulent") {
          toast({
            title: "Fraud Detection Alert",
            description: data.details.message,
            variant: "destructive",
          });
          return;
        }
        throw new Error(data.message || "Failed to save product");
      }

      toast({
        title: `Product ${mode === "add" ? "added" : "updated"}`,
        description: `${values.productName} has been ${mode === "add" ? "added" : "updated"} successfully.`,
      });
      onOpenChange(false);
      window.location.reload();

    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false); // Reset loading state
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{mode === "add" ? "Add New Product" : "Edit Product"}</DialogTitle>
          <DialogDescription>
            {mode === "add" ? "Fill in the details to add a new product to your inventory" : "Update your existing product details"}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="productName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Product Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter product name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="categoryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category._id} value={category._id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price ($)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantity</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Describe your product in detail..." className="h-32" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="brand"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Brand</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter brand name (default: Hand Made)" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Variants */}
            <div>
              <FormLabel>Variants (Colors, Materials, etc.)</FormLabel>
              <div className="flex flex-wrap gap-2 mt-2">
                {variants.map((variant, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                    {variant}
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-4 w-4 p-0 hover:bg-transparent"
                      onClick={() => handleRemoveVariant(variant)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2 mt-2">
                <Input
                  placeholder="Add variant"
                  value={newVariant}
                  onChange={(e) => setNewVariant(e.target.value)}
                  className="flex-1"
                />
                <Button type="button" size="sm" onClick={handleAddVariant}>
                  <Plus className="h-4 w-4 mr-1" /> Add
                </Button>
              </div>
            </div>

            {/* Sizes */}
            <div>
              <FormLabel>Sizes</FormLabel>
              <div className="flex flex-wrap gap-2 mt-2">
                {sizes.map((size, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                    {size}
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-4 w-4 p-0 hover:bg-transparent"
                      onClick={() => handleRemoveSize(size)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2 mt-2">
                <Input
                  placeholder="Add size"
                  value={newSize}
                  onChange={(e) => setNewSize(e.target.value)}
                  className="flex-1"
                />
                <Button type="button" size="sm" onClick={handleAddSize}>
                  <Plus className="h-4 w-4 mr-1" /> Add
                </Button>
              </div>
            </div>

            {/* Location */}
            <div className="grid grid-cols-1 gap-4">
              <FormItem>
                <FormLabel>Location</FormLabel>
                <FormControl>
                  <LocationPicker
                    defaultLocation={location}
                    gpsCoords={location}
                    onChange={(newLocation) => setLocation(newLocation)}
                  />
                </FormControl>
                <FormDescription>
                  Click on the map to set the product location
                </FormDescription>
              </FormItem>
            </div>
            <div className="flex items-center text-sm text-muted-foreground">
              <MapPin className="h-4 w-4 mr-1" />
              <span>Location coordinates for your product</span>
            </div>

            {/* Delivery Options */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="delivery"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Delivery Type</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select delivery type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="FREE">Free Delivery</SelectItem>
                        <SelectItem value="PERPIECE">Per Piece</SelectItem>
                        <SelectItem value="PERKG">Per Kilogram</SelectItem>
                        <SelectItem value="PERKM">Per Kilometer</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="deliveryPrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Delivery Price ($)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" {...field} disabled={form.watch("delivery") === "FREE"} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Conditional Price Per Kilogram Input for PERKG */}
            {form.watch("delivery") === "PERKG" && (
              <FormField
                control={form.control}
                name="KilogramPerPrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Enter Kilogram</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" placeholder="Enter kilogram per the delivery price" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Conditional Price Per Kilometer Input for PERKM */}
            {form.watch("delivery") === "PERKM" && (
              <FormField
                control={form.control}
                name="KilometerPerPrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Enter Kilometer</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" placeholder="Enter kilometer per the delivery price" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Images */}
            <div>
              <FormLabel>Product Images</FormLabel>
              <FormDescription>Upload one or more images of your product (max 5MB each, JPEG/PNG/WEBP)</FormDescription>
              <Input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                onChange={handleImageUpload}
                className="cursor-pointer mt-2"
              />
              
              {uploadError && (
                <div className="text-red-500 text-sm mt-2">
                  {uploadError}
                </div>
              )}

              {Object.keys(uploadProgress).length > 0 && (
                <div className="mt-2 space-y-2">
                  {Object.entries(uploadProgress).map(([fileName, progress]) => (
                    <div key={fileName} className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-gray-200 rounded-full">
                        <div 
                          className="h-full bg-blue-500 rounded-full transition-all duration-300"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <span className="text-sm text-gray-500">{progress}%</span>
                    </div>
                  ))}
                </div>
              )}

              {images.length > 0 && (
                <div className="grid grid-cols-3 gap-4 mt-4">
                  {images.map((image, index) => (
                    <div key={index} className="relative aspect-square">
                      <Image
                        src={image || "/placeholder.svg"}
                        alt={`Preview ${index + 1}`}
                        fill
                        className="rounded-lg object-cover"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute right-1 top-1 h-6 w-6"
                        onClick={() => handleRemoveImage(index)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                className="gradient-bg border-0"
                disabled={mode === "edit" && !isDirty || isSubmitting}
              >
                {isSubmitting
                  ? mode === "add"
                    ? "Adding..."
                    : "Editing..."
                  : mode === "add"
                  ? "Add Product"
                  : "Update Product"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}