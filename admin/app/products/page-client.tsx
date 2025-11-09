"use client";

import { useState, useEffect, useMemo, SetStateAction } from "react";
import {
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Trash2,
  MapPin,
  DollarSign,
  Box,
  Star,
  Truck,
  Tag,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Sidebar } from "@/components/sidebar";
import { ProductDetailsDialog } from "@/components/products/product-details-dialog";
import { PaginationControls } from "@/components/auctions/pagination-controls";
import { useToast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/toaster";
import DistancePicker from "@/components/location/DistancePicker";
import { fetchProducts } from "@/utils/data-fetching";
import debounce from "lodash.debounce";
import { ProductType, LocationData, LatLng } from "@/utils/typeDefinitions";

export default function ProductsPageClient() {
  const [selectedTab, setSelectedTab] = useState("active");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<ProductType | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState<{
    ban?: boolean;
    unban?: boolean;
    delete?: boolean;
  }>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [products, setProducts] = useState<ProductType[]>([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoadingData, setIsLoadingData] = useState(true);

  // Filter states
  const [priceRange, setPriceRange] = useState([0, 0]);
  const [minPrice, setMinPrice] = useState("0");
  const [maxPrice, setMaxPrice] = useState("0");
  const [quantityRange, setQuantityRange] = useState([0, 0]);
  const [minQuantity, setMinQuantity] = useState("0");
  const [maxQuantity, setMaxQuantity] = useState("0");
  const [ratingRange, setRatingRange] = useState([0, 5]);
  const [minRating, setMinRating] = useState("0");
  const [maxRating, setMaxRating] = useState("5");
  const [deliveryType, setDeliveryType] = useState("all");
  const [deliveryPriceRange, setDeliveryPriceRange] = useState([0, 0]);
  const [minDeliveryPrice, setMinDeliveryPrice] = useState("0");
  const [maxDeliveryPrice, setMaxDeliveryPrice] = useState("0");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [locationRadius, setLocationRadius] = useState(50); // Default 50 km
  const [locationCenter, setLocationCenter] = useState<LatLng | null>(null);
  const [categories, setCategories] = useState<any[]>([]);

  const { toast } = useToast();

  const fetchCategories = async () => {
    const res = await fetch("/api/manageCategory");
    const data = await res.json();

    const formatted = [
      { id: "all", name: "All Categories" },
      ...data.map((cat: { _id: any; name: any }) => ({
        id: cat._id,
        name: cat.name,
      })),
    ];

    return formatted;
  };

  const deliveryTypes = [
    { id: "all", name: "All Types" },
    { id: "flat", name: "Flat Rate" },
    { id: "perPiece", name: "Per Piece" },
    { id: "perKg", name: "Per Kilogram" },
    { id: "free", name: "Free Shipping" },
  ];

  const debouncedFetchProducts = useMemo(
    () =>
      debounce(async () => {
        setIsLoadingData(true);
        try {
          const filters = {
            isBanned:
              selectedTab === "banned"
                ? true
                : selectedTab === "active"
                ? false
                : undefined,
            phrase: searchQuery || undefined,
            categoryId:
              selectedCategory !== "all" ? selectedCategory : undefined,
            minPrice: priceRange[0] > 0 ? priceRange[0] : undefined,
            maxPrice: priceRange[1] > 0 ? priceRange[1] : undefined,
            minQuantity: quantityRange[0] > 0 ? quantityRange[0] : undefined,
            maxQuantity: quantityRange[1] > 0 ? quantityRange[1] : undefined,
            minAvgReview: ratingRange[0] > 0 ? ratingRange[0] : undefined,
            maxAvgReview: ratingRange[1] < 5 ? ratingRange[1] : undefined,
            delivery: deliveryType !== "all" ? deliveryType : undefined,
            minDeliveryPrice:
              deliveryPriceRange[0] > 0 ? deliveryPriceRange[0] : undefined,
            maxDeliveryPrice:
              deliveryPriceRange[1] > 0 ? deliveryPriceRange[1] : undefined,
            center: locationCenter
              ? `${locationCenter.lat}-${locationCenter.lng}`
              : undefined,
            radius: locationRadius * 1000, // Convert km to meters
          };

          const response = await fetchProducts(currentPage, 15, filters);
          setProducts(response.products);
          setTotalProducts(response.total);
          setTotalPages(response.pagination.totalPages);
        } catch (error) {
          console.error("Error fetching products:", error);
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to load products. Please try again.",
          });
        } finally {
          setIsLoadingData(false);
        }
      }, 300),
    [
      currentPage,
      selectedTab,
      searchQuery,
      selectedCategory,
      priceRange,
      quantityRange,
      ratingRange,
      deliveryType,
      deliveryPriceRange,
      locationCenter,
      locationRadius,
      toast,
    ]
  );

  useEffect(() => {
    debouncedFetchProducts();
    return () => debouncedFetchProducts.cancel();
  }, [debouncedFetchProducts]);

  useEffect(() => {
    const loadCategories = async () => {
      const fetched = await fetchCategories();
      setCategories(fetched);
    };
    loadCategories();
  }, []);

  const handleSearchChange = (e: {
    target: { value: SetStateAction<string> };
  }) => {
    setSearchQuery(e.target.value);
  };

  const handleTabChange = (value: SetStateAction<string>) => {
    setSelectedTab(value);
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    setPriceRange([0, 0]);
    setMinPrice("0");
    setMaxPrice("0");
    setQuantityRange([0, 0]);
    setMinQuantity("0");
    setMaxQuantity("0");
    setRatingRange([0, 5]);
    setMinRating("0");
    setMaxRating("5");
    setDeliveryType("all");
    setDeliveryPriceRange([0, 0]);
    setMinDeliveryPrice("0");
    setMaxDeliveryPrice("0");
    setSelectedCategory("all");
    setLocationRadius(50);
    setLocationCenter(null);
  };

  const handleLocationChange = ({ radius, center }: LocationData) => {
    setLocationRadius(Math.round(radius / 1000));
    setLocationCenter(center);
  };

  const handleProductAction = async (
    type: "ban" | "unban" | "delete",
    productId: string,
    additionalData: Record<string, any> = {}
  ) => {
    console.log("Product actions and ID: ", type, productId);
    setIsActionLoading((prev) => ({ ...prev, [type]: true }));
    try {
      let response;

      switch (type) {
        case "ban":
          response = await fetch("/api/products", {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              _id: productId,
              isBanned: true,
              banReason: additionalData.reason,
              banDescription: additionalData.description,
            }),
          }).then((res) => res.json());
          break;

        case "unban":
          response = await fetch("/api/products", {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              _id: productId,
              isBanned: false,
            }),
          }).then((res) => res.json());
          break;

        case "delete":
          response = await fetch("/api/products", {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              _id: productId,
            }),
          }).then((res) => res.json());
          break;

        default:
          throw new Error("Invalid action type");
      }

      console.log("Response: ", response);

      toast({
        title: "Success",
        description: response.message,
      });

      debouncedFetchProducts();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to ${type} product. Please try again.`,
      });
    } finally {
      setIsActionLoading((prev) => ({ ...prev, [type]: false }));
      setSelectedProduct(null);
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Sidebar />
      <div className="flex-1 md:ml-[calc(var(--sidebar-width)-40px)] md:-mt-12 -mt-8">
        <main className="flex-1 space-y-4 p-4 md:p-8 pt-6">
          <div className="flex flex-wrap items-center justify-between gap-4 md:gap-6">
            <h1 className="text-2xl md:text-4xl font-semibold tracking-tight text-gray-900 dark:text-white">
              Product Management
            </h1>
            <div className="flex items-center gap-4">
              <span className="text-sm md:text-base text-muted-foreground">
                <span className="hidden md:inline">Total </span>Products:
                <span className="font-medium text-gray-800 dark:text-gray-200">
                  {" "}
                  {totalProducts}
                </span>
              </span>
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-2 px-3 py-1.5 text-sm md:text-base"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="h-4 w-4 md:h-5 md:w-5" />
                {showFilters ? "Hide Filters" : "Show Filters"}
              </Button>
            </div>
          </div>

          <div className="flex gap-4 flex-row md:items-center md:justify-between">
            <div className="flex flex-1 items-center gap-2">
              <div className="relative flex-1 md:max-w-sm">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search products..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={handleSearchChange}
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Select
                defaultValue="active"
                value={selectedTab}
                onValueChange={handleTabChange}
              >
                <SelectTrigger className="w-[140px] md:w-[180px]">
                  <SelectValue placeholder="View" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Products</SelectItem>
                  <SelectItem value="active">Active Products</SelectItem>
                  <SelectItem value="banned">Banned Products</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {showFilters && (
            <Card className="mb-4">
              <CardContent className="p-4 md:p-6">
                <h2 className="text-xl font-semibold mb-4">Filter Products</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-4">
                    <div>
                      <Label className="flex items-center">
                        <DollarSign className="h-4 w-4 mr-1" /> Price Range
                      </Label>
                      <div className="flex gap-2">
                        <Input
                          type="number"
                          value={minPrice}
                          onChange={(e) => {
                            const value = Number(e.target.value) || 0;
                            setMinPrice(e.target.value);
                            setPriceRange([value, priceRange[1]]);
                          }}
                          placeholder="Min"
                        />
                        <Input
                          type="number"
                          value={maxPrice}
                          onChange={(e) => {
                            const value = Number(e.target.value) || 0;
                            setMaxPrice(e.target.value);
                            setPriceRange([priceRange[0], value]);
                          }}
                          placeholder="Max"
                        />
                      </div>
                    </div>

                    <div>
                      <Label className="flex items-center">
                        <Box className="h-4 w-4 mr-1" /> Stock Quantity
                      </Label>
                      <div className="flex gap-2">
                        <Input
                          type="number"
                          value={minQuantity}
                          onChange={(e) => {
                            const value = Number(e.target.value) || 0;
                            setMinQuantity(e.target.value);
                            setQuantityRange([value, quantityRange[1]]);
                          }}
                          placeholder="Min"
                        />
                        <Input
                          type="number"
                          value={maxQuantity}
                          onChange={(e) => {
                            const value = Number(e.target.value) || 0;
                            setMaxQuantity(e.target.value);
                            setQuantityRange([quantityRange[0], value]);
                          }}
                          placeholder="Max"
                        />
                      </div>
                    </div>

                    <div>
                      <Label className="flex items-center">
                        <Star className="h-4 w-4 mr-1" /> Average Rating
                      </Label>
                      <div className="flex gap-2">
                        <Input
                          type="number"
                          value={minRating}
                          onChange={(e) => {
                            const value = Math.min(
                              5,
                              Math.max(0, Number(e.target.value) || 0)
                            );
                            setMinRating(e.target.value);
                            setRatingRange([value, ratingRange[1]]);
                          }}
                          placeholder="Min"
                          min={0}
                          max={5}
                        />
                        <Input
                          type="number"
                          value={maxRating}
                          onChange={(e) => {
                            const value = Math.min(
                              5,
                              Math.max(0, Number(e.target.value) || 0)
                            );
                            setMaxRating(e.target.value);
                            setRatingRange([ratingRange[0], value]);
                          }}
                          placeholder="Max"
                          min={0}
                          max={5}
                        />
                      </div>
                    </div>

                    <div className="gap-2 flex flex-row">
                      <div className="flex-1">
                        <Label className="flex items-center">
                          <Tag className="h-4 w-4 mr-1" /> Category
                        </Label>
                        <Select
                          value={selectedCategory}
                          onValueChange={setSelectedCategory}
                        >
                          <SelectTrigger>
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

                      <div className="flex-1">
                        <Label className="flex items-center">
                          <Truck className="h-4 w-4 mr-1" /> Delivery Type
                        </Label>
                        <Select
                          value={deliveryType}
                          onValueChange={setDeliveryType}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select delivery type" />
                          </SelectTrigger>
                          <SelectContent>
                            {deliveryTypes.map((delivery) => (
                              <SelectItem key={delivery.id} value={delivery.id}>
                                {delivery.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <Button variant="outline" onClick={handleResetFilters}>
                      Reset Filters
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 justify-between">
                      <Label className="flex items-center">
                        <MapPin className="h-4 w-4 mr-1 text-red-500" />{" "}
                        Location
                      </Label>
                      <div className="flex items-center gap-2">
                        <Label className="hidden md:block">Distance (km)</Label>
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            value={locationRadius}
                            onChange={(e) =>
                              setLocationRadius(Number(e.target.value) || 50)
                            }
                            min={1}
                            max={1000}
                            className="w-24"
                          />
                          <span className="text-sm text-muted-foreground">
                            KM
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="border rounded-md p-2">
                      <DistancePicker
                        onChange={handleLocationChange}
                        defaultRadius={locationRadius * 1000}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <Card className="-ml-5 md:ml-0 -mr-4 md:mr-0 overflow-x-hidden">
            <CardHeader className="p-4 text-sm md:text-base lg:text-lg">
              <CardTitle>
                {selectedTab === "active"
                  ? "Active Products"
                  : selectedTab === "banned"
                  ? "Banned Products"
                  : "All Products"}
              </CardTitle>
              <CardDescription className="hidden md:block">
                {selectedTab === "active"
                  ? "Manage all active products in the marketplace system"
                  : selectedTab === "banned"
                  ? "View and manage banned products"
                  : "View all products in the marketplace system"}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product Name</TableHead>
                      <TableHead className="hidden md:table-cell">
                        Category
                      </TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead className="hidden md:table-cell">
                        Merchant
                      </TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="hidden md:table-cell">
                        Stock
                      </TableHead>
                      <TableHead>Rating</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoadingData ? (
                      <TableRow>
                        <TableCell colSpan={7} className="h-24 text-center">
                          Loading products...
                        </TableCell>
                      </TableRow>
                    ) : products.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="h-24 text-center">
                          No products found.
                        </TableCell>
                      </TableRow>
                    ) : (
                      products.map((product) => (
                        <TableRow
                          key={product._id}
                          className="cursor-pointer hover:bg-muted/50"
                          onClick={() => setSelectedProduct(product)}
                        >
                          <TableCell className="font-medium">
                            {product.productName}
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            {product.category.categoryName}
                          </TableCell>
                          <TableCell>${product.price.toFixed(2)}</TableCell>
                          <TableCell className="hidden md:table-cell">
                            {product.merchantDetail.merchantName}
                          </TableCell>
                          <TableCell>
                            {selectedTab === "deleted" ? (
                              <span className="flex items-center text-gray-500">
                                <Trash2 className="mr-1 h-4 w-4" /> Deleted
                              </span>
                            ) : product.isBanned ? (
                              <span className="flex items-center text-red-500">
                                <XCircle className="mr-1 h-4 w-4" /> Banned
                              </span>
                            ) : (
                              <span className="flex items-center text-green-500">
                                <CheckCircle className="mr-1 h-4 w-4" /> Active
                              </span>
                            )}
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            {product.quantity} ({product.soldQuantity} sold)
                          </TableCell>
                          <TableCell>
                            {product.avgRating > 0 ? (
                              <div className="flex items-center">
                                {product.avgRating}
                                <span className="text-yellow-500 ml-1">★</span>
                                <span className="text-xs text-muted-foreground ml-1">
                                  ({product.review.length})
                                </span>
                              </div>
                            ) : (
                              <span className="text-muted-foreground">
                                No ratings
                              </span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {totalPages > 1 && (
            <PaginationControls
              totalPages={totalPages}
              currentPage={currentPage}
              onPageChange={setCurrentPage}
            />
          )}
        </main>
      </div>

      {selectedProduct && (
        <ProductDetailsDialog
          product={selectedProduct}
          open={!!selectedProduct}
          onOpenChange={() => setSelectedProduct(null)}
          onAction={(action) =>
            handleProductAction(
              action.type as "ban" | "unban" | "delete",
              action.productId,
              {
                reason: action.reason,
                description: action.description,
              }
            )
          }
          isLoading={isActionLoading}
        />
      )}
      <Toaster />
    </div>
  );
}
