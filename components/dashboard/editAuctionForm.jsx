
"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Calendar, AlertTriangle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/libs/utils";
import { format } from "date-fns";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useToast } from "@/components/ui/use-toast";
import * as z from "zod";

const formSchema = z.object({
  auctionTitle: z.string().min(2, { message: "Title must be at least 2 characters." }),
  description: z.string().min(10, { message: "Description must be at least 10 characters." }),
  category: z.string().min(1, { message: "Please select a category" }),
  condition: z.enum(["new", "used"], { required_error: "Condition is required" }),
  startTime: z.date({ required_error: "Start time is required" }),
  endTime: z.date({ required_error: "End time is required" }),
  startingPrice: z.string().min(1, { message: "Starting price is required." }).transform((val) => parseFloat(val)),
  reservedPrice: z
    .string()
    .optional()
    .transform((val) => (val ? parseFloat(val) : undefined)),
  bidIncrement: z.string().min(1, { message: "Bid increment is required." }).transform((val) => parseFloat(val)),
  totalQuantity: z.string().min(1, { message: "Quantity is required." }).transform((val) => parseInt(val)),
  buyByParts: z.boolean().default(false),
  singleItemPrice: z
    .string()
    .optional()
    .refine((val) => !val || parseFloat(val) > 0, { message: "Single item price must be greater than 0" })
    .transform((val) => (val ? parseFloat(val) : undefined)),
  productId: z.string().optional(),
});

export function EditAuctionForm({ open, onOpenChange, auction, onAuctionUpdated }) {
  const { toast } = useToast();
  const [images, setImages] = useState([]);
  const [hasChanges, setHasChanges] = useState(false);
  const [buyByParts, setBuyByParts] = useState(false);
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      auctionTitle: "",
      description: "",
      category: "",
      condition: "new",
      startTime: new Date(),
      endTime: new Date(),
      startingPrice: "",
      reservedPrice: "",
      bidIncrement: "",
      totalQuantity: "1",
      buyByParts: false,
      singleItemPrice: "",
      productId: "none",
    },
  });

  // Fetch categories and products
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

  // Initialize form with auction data
  useEffect(() => {
    if (auction && open) {
      form.reset({
        auctionTitle: auction.auctionTitle || auction.productName || "",
        description: auction.description || "",
        category: auction.category || "",
        condition: auction.condition || "new",
        startTime: new Date(auction.startTime),
        endTime: new Date(auction.endTime),
        startingPrice: auction.startingPrice?.toString() || "",
        reservedPrice: auction.reservedPrice?.toString() || "",
        bidIncrement: auction.bidIncrement?.toString() || "",
        totalQuantity: auction.totalQuantity?.toString() || "1",
        buyByParts: auction.buyByParts || false,
        singleItemPrice: auction.singleItemPrice?.toString() || "",
        productId: auction.productId ? auction.productId.toString() : "none",
      });
      setImages(auction.itemImg || []);
      setBuyByParts(auction.buyByParts || false);
      setHasChanges(false);
    }
  }, [auction, form, open]);

  // Detect form or image changes
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (!auction) return;

      const originalValues = {
        auctionTitle: auction.auctionTitle || auction.productName || "",
        description: auction.description || "",
        category: auction.category || "",
        condition: auction.condition || "new",
        startTime: new Date(auction.startTime).toISOString(),
        endTime: new Date(auction.endTime).toISOString(),
        startingPrice: auction.startingPrice?.toString() || "",
        reservedPrice: auction.reservedPrice?.toString() || "",
        bidIncrement: auction.bidIncrement?.toString() || "",
        totalQuantity: auction.totalQuantity?.toString() || "1",
        buyByParts: auction.buyByParts || false,
        singleItemPrice: auction.singleItemPrice?.toString() || "",
        productId: auction.productId ? auction.productId.toString() : "none",
      };

      const hasFormChanges = Object.keys(value).some((key) => {
        if (key === "startTime" || key === "endTime") {
          return new Date(value[key]).toISOString() !== originalValues[key];
        }
        return value[key] !== originalValues[key];
      });

      const hasImageChanges =
        images.length !== auction.itemImg?.length ||
        images.some((img, idx) => img !== auction.itemImg?.[idx]);

      setHasChanges(hasFormChanges || hasImageChanges);
    });

    return () => subscription.unsubscribe();
  }, [form.watch, auction, images]);

  async function onSubmit(values) {
    try {
      console.log("auctionId:", auction._id)
      const response = await fetch("/api/auctions", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          auctionId: auction._id,
          ...values,
          itemImg: images,
          productId: values.productId === "none" ? undefined : values.productId,
        }),
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Your auction has been updated and is pending admin approval.",
        });
        onOpenChange(false);
        if (onAuctionUpdated) onAuctionUpdated();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update auction");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to update auction",
        variant: "destructive",
      });
    }
  }

  const handleImageUpload = (e) => {
    const files = e.target.files;
    if (files) {
      const newImages = Array.from(files).map((file) => URL.createObjectURL(file));
      setImages([...images, ...newImages]);
      form.setValue("images", [...(form.getValues("images") || []), ...newImages]);
    }
  };

  const handleRemoveImage = (index) => {
    setImages(images.filter((_, i) => i !== index));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Auction</DialogTitle>
          <DialogDescription>
            Update the details for "{auction?.productName || auction?.auctionTitle}". Your changes will require admin approval.
          </DialogDescription>
        </DialogHeader>

        {auction?.adminApproval === "rejected" && (
          <div className="flex items-start gap-3 p-4 mb-4 rounded-md bg-destructive/10 text-destructive">
            <AlertTriangle className="h-5 w-5 mt-0.5" />
            <div>
              <p className="font-medium">This auction was rejected by an admin</p>
              <p className="text-sm">
                Please review and update the auction details to meet our guidelines, then resubmit for approval.
              </p>
            </div>
          </div>
        )}

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
                name="condition"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Condition</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select condition" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="new">New</SelectItem>
                        <SelectItem value="used">Used</SelectItem>
                      </SelectContent>
                    </Select>
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
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
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
                <FormField
                  control={form.control}
                  name="bidIncrement"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bid Increment ($)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
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
              <FormField
                control={form.control}
                name="buyByParts"
                render={({ field }) => (
                  <FormItem className="flex flex-row gap-2">
                    <FormControl>
                      <input
                        type="checkbox"
                        checked={field.value}
                        onChange={(e) => {
                          field.onChange(e);
                          setBuyByParts(e.target.checked);
                        }}
                        className="form-checkbox text-indigo-600"
                      />
                    </FormControl>
                    <FormLabel>Allow Buy By Parts</FormLabel>
                  </FormItem>
                )}
              />
              {buyByParts && (
                <FormField
                  control={form.control}
                  name="singleItemPrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Single Item Price ($)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              <FormItem>
                <FormLabel>Images</FormLabel>
                <FormControl>
                  <Input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    className="cursor-pointer"
                  />
                </FormControl>
                <FormDescription>Upload one or more images of your item</FormDescription>
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
                <FormMessage />
              </FormItem>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="gradient-bg border-0" disabled={!hasChanges}>
                  Update Auction
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}