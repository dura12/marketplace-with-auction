"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Plus, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn, uploadImagesToFirebase } from "@/libs/utils";
import { format } from "date-fns";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useToast } from "@/components/ui/use-toast";
import { useSession } from "next-auth/react";
import * as z from "zod";

const formSchema = z.object({
  auctionTitle: z.string().min(2, "Title must be at least 2 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  category: z.string().min(1, "Please select a category"),
  totalQuantity: z.string().min(1, "Quantity is required").transform((val) => parseInt(val)),
  startingPrice: z.string().min(1, "Starting price is required").transform((val) => parseFloat(val)),
  reservedPrice: z.string().optional().transform((val) => (val ? parseFloat(val) : undefined)),
  condition: z.enum(["new", "used"], { required_error: "Condition is required" }),
  bidIncrement: z.string().min(1, "Minimum bid increment is required").transform((val) => parseFloat(val)),
  startTime: z.date({ required_error: "Start date is required" }),
  endTime: z.date({ required_error: "End date is required" }),
  images: z.array(z.string()).min(1, "At least one image is required"),
  productId: z.string().optional(),
});

export function CreateAuctionDialog({ onAuctionCreated }) {
  const { toast } = useToast();
  const { data: session, status } = useSession();
  const [open, setOpen] = useState(false);
  const [images, setImages] = useState([]);
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const [uploadError, setUploadError] = useState(null);

  useEffect(() => {
    const fetchCategoriesAndProducts = async () => {
      try {
        setLoading(true);

        // Fetch categories
        const categoryResponse = await fetch("/api/categories", {
          credentials: "include",
        });
        if (!categoryResponse.ok) {
          throw new Error("Failed to fetch categories");
        }
        const categoryData = await categoryResponse.json();
        setCategories(
          Array.isArray(categoryData)
            ? categoryData.map((cat) => ({ id: cat._id, name: cat.name }))
            : []
        );

        // Fetch products
        const productResponse = await fetch("/api/products", {
          credentials: "include",
        });
        if (!productResponse.ok) {
          throw new Error("Failed to fetch products");
        }
        const productData = await productResponse.json();
        console.log("Product API response:", productData);
        setProducts(Array.isArray(productData) ? productData : []);
      } catch (err) {
        toast({
          title: "Error",
          description: err.message || "Failed to load categories or products",
          variant: "destructive",
        });
        setProducts([]);
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCategoriesAndProducts();
  }, [toast]);

  const form = useForm({es: {
      auctionTitle: "",
      description: "",
      condition: "",
      category: "",
      totalQuantity: "1",
      startingPrice: "",
      reservedPrice: "",
      bidIncrement: "",
      images: [],
      productId: "none",
    },
  });

  const onSubmit = async (values) => {
    console.log("onSubmit called with values:", values); // Debug log
    if (status !== "authenticated" || !session?.user?.id) {
      toast({
        title: "Error",
        description: "You must be logged in to create an auction",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch("/api/auctions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          ...values,
          images,
          merchantId: session.user.id,
          productId: values.productId === "none" ? undefined : values.productId,
        }),
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Auction created successfully",
        });
        setOpen(false);
        form.reset();
        setImages([]);
        if (onAuctionCreated) onAuctionCreated();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create auction");
      }
    } catch (error) {
      console.error("Submission error:", error); // Debug log
      toast({
        title: "Error",
        description: error.message || "Failed to create auction",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };
    // resolver: zodResolver(formSchema),
    // defaultValue

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

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gradient-bg border-0 w-full md:w-auto">
          <Plus className="mr-2 h-4 w-4" />
          Create Auction
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Auction</DialogTitle>
          <DialogDescription>Fill in the details for your new auction listing.</DialogDescription>
        </DialogHeader>
        {loading ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            <span className="ml-2">Loading...</span>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="auctionTitle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter auction title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Describe your item in detail..." className="h-32" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="condition"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Condition</FormLabel>
                    <FormControl>
                      <div className="flex items-center space-x-6">
                        <label className="flex items-center space-x-2">
                          <input
                            type="radio"
                            value="new"
                            checked={field.value === "new"}
                            onChange={field.onChange}
                            className="form-radio text-indigo-600"
                          />
                          <span className="text-gray-700">New</span>
                        </label>
                        <label className="flex items-center space-x-2">
                          <input
                            type="radio"
                            value="used"
                            checked={field.value === "used"}
                            onChange={field.onChange}
                            className="form-radio text-indigo-600"
                          />
                          <span className="text-gray-700">Used</span>
                        </label>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="productId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Product (Optional)</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a product (if from marketplace)" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">None (non-marketplace auction)</SelectItem>
                        {Array.isArray(products) &&
                          products.length > 0 &&
                          products.map((product) => (
                            <SelectItem key={product._id} value={product._id}>
                              {product.name}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>Select a product if this auction is for an existing marketplace item.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="totalQuantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantity</FormLabel>
                    <FormControl>
                      <Input type="number" step="1" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="startingPrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Starting Price ($)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="reservedPrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Reserve Price ($)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" {...field} />
                      </FormControl>
                      <FormDescription>Optional minimum price for sale</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="bidIncrement"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Minimum Bid Increment ($)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="startTime"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Start Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                            >
                              {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                              <Calendar className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <CalendarComponent
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) => date < new Date() || date < new Date("1900-01-01")}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="endTime"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>End Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                            >
                              {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                              <Calendar className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <CalendarComponent
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) => date < new Date() || date < new Date("1900-01-01")}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormItem>
                <FormLabel>Images</FormLabel>
                <FormDescription>Upload one or more images of your item (max 5MB each, JPEG/PNG/WEBP)</FormDescription>
                <FormControl>
                  <Input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    multiple
                    onChange={handleImageUpload}
                    className="cursor-pointer mt-2"
                  />
                </FormControl>
                
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
                          onClick={() => setImages(images.filter((_, i) => i !== index))}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
                <FormMessage />
              </FormItem>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="gradient-bg border-0"
                  disabled={submitting || loading || !form.formState.isValid}
                >
                  {submitting ? "Creating..." : "Create Auction"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}