// "use client";

// import { useState, useEffect, useMemo } from "react";
// import debounce from "lodash.debounce";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// import { Card, CardContent } from "@/components/ui/card";
// import { MapPin, Star, DollarSign, Box, Truck, Tag } from "lucide-react";
// import DistancePicker from "@/components/DistancePicker";

// interface ProductFiltersProps {
//   onApplyFilters: (filters: any) => void;
//   productCount: number;
// }

// export function ProductFilters({ onApplyFilters, productCount }: ProductFiltersProps) {
//   // Filter states
//   const [priceRange, setPriceRange] = useState([0, 0]);
//   const [minPrice, setMinPrice] = useState("0");
//   const [maxPrice, setMaxPrice] = useState("0");

//   const [quantityRange, setQuantityRange] = useState([0, 0]);
//   const [minQuantity, setMinQuantity] = useState("0");
//   const [maxQuantity, setMaxQuantity] = useState("0");

//   const [ratingRange, setRatingRange] = useState([0, 5]);
//   const [minRating, setMinRating] = useState("0");
//   const [maxRating, setMaxRating] = useState("5");

//   const [deliveryType, setDeliveryType] = useState("all");

//   const [selectedCategory, setSelectedCategory] = useState("all");

//   const [locationRadius, setLocationRadius] = useState(3000); // Default 50 km
//   const [locationCenter, setLocationCenter] = useState<{ lat: number; lng: number } | null>(null);

//   const categories = [
//     { id: "all", name: "All Categories" },
//     { id: "category_1", name: "Electronics" },
//     { id: "category_2", name: "Clothing" },
//     { id: "category_3", name: "Home & Garden" },
//     { id: "category_4", name: "Beauty" },
//     { id: "category_5", name: "Toys" },
//     { id: "category_6", name: "Sports" },
//   ];

//   const deliveryTypes = [
//     { id: "all", name: "All Types" },
//     { id: "flat", name: "Flat Rate" },
//     { id: "perPiece", name: "Per Piece" },
//     { id: "perKg", name: "Per Kilogram" },
//     { id: "free", name: "Free Shipping" },
//   ];

//   // Debounced filter application
//   const debouncedApplyFilters = useMemo(
//     () =>
//       debounce(() => {
//         const filters = {
//           categoryId: selectedCategory !== "all" ? selectedCategory : undefined,
//           minPrice: priceRange[0] > 0 ? priceRange[0] : undefined,
//           maxPrice: priceRange[1] > 0 ? priceRange[1] : undefined,
//           minQuantity: quantityRange[0] > 0 ? quantityRange[0] : undefined,
//           maxQuantity: quantityRange[1] > 0 ? quantityRange[1] : undefined,
//           minAvgReview: ratingRange[0] > 0 ? ratingRange[0] : undefined,
//           maxAvgReview: ratingRange[1] < 5 ? ratingRange[1] : undefined,
//           delivery: deliveryType !== "all" ? deliveryType : undefined,
//           center: locationCenter ? `${locationCenter.lat}-${locationCenter.lng}` : undefined,
//           radius: locationRadius * 1000, // Always send radius in meters
//         };
//         onApplyFilters(filters);
//       }, 300),
//     [
//       priceRange,
//       quantityRange,
//       ratingRange,
//       deliveryType,
//       selectedCategory,
//       locationRadius,
//       locationCenter,
//       onApplyFilters,
//     ]
//   );

//   useEffect(() => {
//     debouncedApplyFilters();
//     return () => debouncedApplyFilters.cancel();
//   }, [debouncedApplyFilters]);

//   // Reset filters
//   const handleResetFilters = () => {
//     setPriceRange([0, 0]);
//     setMinPrice("0");
//     setMaxPrice("0");
//     setQuantityRange([0, 0]);
//     setMinQuantity("0");
//     setMaxQuantity("0");
//     setRatingRange([0, 5]);
//     setMinRating("0");
//     setMaxRating("5");
//     setDeliveryType("all");
//     setSelectedCategory("all");
//     setLocationRadius(50);
//     setLocationCenter(null);
//   };

//   const handleLocationChange = ({ radius, center }: { radius: number; center: any }) => {
//     setLocationRadius(Math.round(radius / 1000)); // Convert meters to km
//     setLocationCenter(center);
//   };

//   return (
//     <Card className="mb-4">
//       <CardContent className="p-4 md:p-6">
//         <h2 className="text-xl font-semibold mb-4">Filter Products</h2>
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//           {/* Left Side - Filters */}
//           <div className="space-y-4">
//             <div>
//               <Label className="flex items-center">
//                 <DollarSign className="h-4 w-4 mr-1" /> Price Range
//               </Label>
//               <div className="flex gap-2">
//                 <Input
//                   type="number"
//                   value={minPrice}
//                   onChange={(e) => {
//                     const value = Number(e.target.value) || 0;
//                     setMinPrice(e.target.value);
//                     setPriceRange([value, priceRange[1]]);
//                   }}
//                   placeholder="Min"
//                 />
//                 <Input
//                   type="number"
//                   value={maxPrice}
//                   onChange={(e) => {
//                     const value = Number(e.target.value) || 0;
//                     setMaxPrice(e.target.value);
//                     setPriceRange([priceRange[0], value]);
//                   }}
//                   placeholder="Max"
//                 />
//               </div>
//             </div>

//             <div>
//               <Label className="flex items-center">
//                 <Box className="h-4 w-4 mr-1" /> Stock Quantity
//               </Label>
//               <div className="flex gap-2">
//                 <Input
//                   type="number"
//                   value={minQuantity}
//                   onChange={(e) => {
//                     const value = Number(e.target.value) || 0;
//                     setMinQuantity(e.target.value);
//                     setQuantityRange([value, quantityRange[1]]);
//                   }}
//                   placeholder="Min"
//                 />
//                 <Input
//                   type="number"
//                   value={maxQuantity}
//                   onChange={(e) => {
//                     const value = Number(e.target.value) || 0;
//                     setMaxQuantity(e.target.value);
//                     setQuantityRange([quantityRange[0], value]);
//                   }}
//                   placeholder="Max"
//                 />
//               </div>
//             </div>

//             <div>
//               <Label className="flex items-center">
//                 <Star className="h-4 w-4 mr-1" /> Average Rating
//               </Label>
//               <div className="flex gap-2">
//                 <Input
//                   type="number"
//                   value={minRating}
//                   onChange={(e) => {
//                     const value = Math.min(5, Math.max(0, Number(e.target.value) || 0));
//                     setMinRating(e.target.value);
//                     setRatingRange([value, ratingRange[1]]);
//                   }}
//                   placeholder="Min"
//                   min={0}
//                   max={5}
//                 />
//                 <Input
//                   type="number"
//                   value={maxRating}
//                   onChange={(e) => {
//                     const value = Math.min(5, Math.max(0, Number(e.target.value) || 0));
//                     setMaxRating(e.target.value);
//                     setRatingRange([ratingRange[0], value]);
//                   }}
//                   placeholder="Max"
//                   min={0}
//                   max={5}
//                 />
//               </div>
//             </div>

//             <div className="gap-2 flex flex-row">
//               <div className="flex-1">
//                 <Label className="flex items-center">
//                   <Tag className="h-4 w-4 mr-1" /> Category
//                 </Label>
//                 <Select value={selectedCategory} onValueChange={setSelectedCategory}>
//                   <SelectTrigger>
//                     <SelectValue placeholder="Select category" />
//                   </SelectTrigger>
//                   <SelectContent>
//                     {categories.map((category) => (
//                       <SelectItem key={category.id} value={category.id}>
//                         {category.name}
//                       </SelectItem>
//                     ))}
//                   </SelectContent>
//                 </Select>
//               </div>

//               <div className="flex-1">
//                 <Label className="flex items-center">
//                   <Truck className="h-4 w-4 mr-1" /> Delivery Type
//                 </Label>
//                 <Select value={deliveryType} onValueChange={setDeliveryType}>
//                   <SelectTrigger>
//                     <SelectValue placeholder="Select delivery type" />
//                   </SelectTrigger>
//                   <SelectContent>
//                     {deliveryTypes.map((delivery) => (
//                       <SelectItem key={delivery.id} value={delivery.id}>
//                         {delivery.name}
//                       </SelectItem>
//                     ))}
//                   </SelectContent>
//                 </Select>
//               </div>
//             </div>

//             <Button variant="outline" onClick={handleResetFilters}>
//               Reset Filters
//             </Button>
//           </div>

//           {/* Right Side - Map */}
//           <div className="space-y-2">
//             <div className="flex items-center gap-2 justify-between">
//               <Label className="flex items-center">
//                 <MapPin className="h-4 w-4 mr-1 text-red-500" /> Location
//               </Label>
//               <div className="flex items-center gap-2">
//                 <Label className="hidden md:block">Distance (km)</Label>
//                 <div className="flex items-center gap-2">
//                   <Input
//                     type="number"
//                     value={locationRadius}
//                     onChange={(e) => setLocationRadius(Number(e.target.value) || 50)}
//                     min={1}
//                     max={1000}
//                     className="w-24"
//                   />
//                   <span className="text-sm text-muted-foreground">KM</span>
//                 </div>
//               </div>
//             </div>
//             <div className="border rounded-md p-2">
//               <DistancePicker onChange={handleLocationChange} defaultRadius={locationRadius * 1000} />
//             </div>
//           </div>
//         </div>
//       </CardContent>
//     </Card>
//   );
// }