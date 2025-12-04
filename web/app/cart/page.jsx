"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/components/ui/use-toast";
import { useCart } from "@/components/cart-provider";

// Function to get user location
const getUserLocation = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation is not supported by your browser"));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve([position.coords.longitude, position.coords.latitude]);
      },
      (error) => {
        switch (error.code) {
          case error.PERMISSION_DENIED:
            reject(new Error("Location access denied. Please enable location services."));
            break;
          case error.POSITION_UNAVAILABLE:
            reject(new Error("Location information is unavailable."));
            break;
          case error.TIMEOUT:
            reject(new Error("The request to get location timed out."));
            break;
          default:
            reject(new Error("An unknown error occurred while fetching location."));
        }
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  });
};

// Function to calculate distance using Haversine formula
const calculateDistance = (coord1, coord2) => {
  const [lon1, lat1] = coord1;
  const [lon2, lat2] = coord2;
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in km
  return distance;
};

const deg2rad = (deg) => {
  return deg * (Math.PI / 180);
};

// Function to calculate delivery price based on delivery type
const calculateDeliveryPrice = (product, quantity, userCoordinates) => {
  const { delivery, deliveryPrice, kilometerPerPrice, kilogramPerPrice, weight, location } = product;
  let deliveryCost = 0;

  if (delivery === "FREE") {
    deliveryCost = 0;
  } else if (delivery === "FLAT") {
    deliveryCost = deliveryPrice;
  } else if (delivery === "PERPIECE") {
    deliveryCost = deliveryPrice * quantity;
  } else if (delivery === "PERKG") {
    if (!weight) {
      console.warn("Weight is missing for PERKG delivery; assuming 0 cost");
      return 0;
    }
    const weightInKg = weight;
    deliveryCost = deliveryPrice * Math.ceil(weightInKg / (kilogramPerPrice || 1));
  } else if (delivery === "PERKM") {
    if (!userCoordinates || !location?.coordinates) {
      console.warn("Coordinates missing for PERKM delivery; assuming 0 cost");
      return 0;
    }
    const distance = calculateDistance(userCoordinates, location.coordinates);
    deliveryCost = deliveryPrice * Math.ceil(distance / (kilometerPerPrice || 1));
  }

  return deliveryCost;
};

export default function CartPage() {
  const { toast } = useToast();
  const { data: session, status } = useSession();
  const { cart, removeProduct, updateQuantity, clearMerchant, clearCart, isLoading } = useCart();
  const [processingPayment, setProcessingPayment] = useState({});
  const [coordinates, setCoordinates] = useState([0, 0]);
  const [locationLoading, setLocationLoading] = useState(true);

  // Fetch user location on component mount
  useEffect(() => {
    const fetchLocation = async () => {
      try {
        const location = await getUserLocation();
        setCoordinates(location);
      } catch (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
        setCoordinates([0, 0]); // Fallback coordinates
      } finally {
        setLocationLoading(false);
      }
    };
    fetchLocation();
  }, [toast]);

  const calculateMerchantTotal = (merchant) => {
    return merchant.products.reduce((total, product) => {
      const productTotal = product.offer?.price && product.offer?.offerEndDate > new Date()
        ? product.offer.price * product.quantity
        : product.price * product.quantity;
      const deliveryTotal = calculateDeliveryPrice(product, product.quantity, coordinates);
      return total + productTotal + deliveryTotal;
    }, 0);
  };

  const calculateGrandTotal = () => {
    return cart?.merchants?.reduce((total, merchant) => {
      return total + calculateMerchantTotal(merchant);
    }, 0) || 0;
  };

  const handlePayment = async (merchantId, total) => {
    setProcessingPayment((prev) => ({ ...prev, [merchantId]: true }));
    try {
      // Fetch customer details
      const customerResponse = await fetch("/api/user");
      if (!customerResponse.ok) {
        throw new Error("Failed to fetch customer details");
      }
      const customerData = await customerResponse.json();

      // Fetch merchant details
      const merchantResponse = await fetch(`/api/user/${merchantId}`);
      if (!merchantResponse.ok) {
        throw new Error("Failed to fetch merchant details");
      }
      const merchantData = await merchantResponse.json();

      // Map to schema-compliant customerDetail
      const customerDetail = {
        customerId: customerData._id,
        customerName: customerData.fullName || "Unknown Customer",
        phoneNumber: customerData.phoneNumber || "0000000000",
        customerEmail: customerData.email || "unknown@example.com",
        address: {
          state: customerData.stateName || "Default State",
          city: customerData.cityName || "Default City",
        },
      };

      // Map to schema-compliant merchantDetail
      const merchantDetail = {
        merchantId: merchantData._id,
        merchantName: merchantData.fullName || "Unknown Merchant",
        merchantEmail: merchantData.email || "merchant@example.com",
        phoneNumber: merchantData.phoneNumber || "0000000000",
        account_name: merchantData.account_name || "Merchant Account",
        account_number: merchantData.account_number || "1234567890",
        bank_code: merchantData.bank_code || "DEFAULT",
      };

      // Map to schema-compliant products
      const merchant = cart.merchants.find((m) => m.merchantId === merchantId);
      const products = merchant.products.map((p) => ({
        productId: p.id,
        productName: p.name,
        quantity: p.quantity,
        price: p.offer?.price && p.offer?.offerEndDate > new Date() ? p.offer.price : p.price,
        delivery: p.delivery,
        deliveryPrice: calculateDeliveryPrice(p, p.quantity, coordinates),
        categoryName: p.categoryName || "Uncategorized",
        weight: p.weight || 0,
        location: p.location || { type: "Point", coordinates: [0, 0] },
      }));

      // Prepare location
      const location = {
        type: "Point",
        coordinates: coordinates,
      };

      // Call /api/checkout
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: total,
          orderData: {
            customerDetail,
            merchantDetail,
            products,
            totalPrice: total,
            location,
          },
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.checkout_url) {
        throw new Error(data.message || "Failed to initialize payment");
      }

      // Clear the merchant's cart after successful payment initialization
      clearMerchant(merchantId);
      window.location.href = data.checkout_url;
    } catch (error) {
      console.error("Payment error:", error);
      toast({
        title: "Error",
        description: error.message || "There was an error processing your payment.",
        variant: "destructive",
      });
    } finally {
      setProcessingPayment((prev) => ({ ...prev, [merchantId]: false }));
    }
  };

  const handleClearCart = () => {
    clearCart();
    toast({
      title: "Success",
      description: "Cart cleared successfully",
    });
  };

  if (status === "loading" || isLoading || locationLoading) {
    return (
      <div className="container p-6">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="container py-16">
        <div className="flex flex-col items-center justify-center text-center">
          <div className="rounded-full bg-muted p-6 mb-4">
            <ShoppingBag className="h-12 w-12 text-muted-foreground" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Please log in to view your cart</h1>
          <p className="text-muted-foreground mb-6">You need to be logged in to access your shopping cart.</p>
          <Button onClick={() => (window.location.href = "/login")}>Login to your account</Button>
        </div>
      </div>
    );
  }

  if (!cart?.merchants?.length) {
    return (
      <div className="container py-16">
        <div className="flex flex-col items-center justify-center text-center">
          <div className="rounded-full bg-muted p-6 mb-4">
            <ShoppingBag className="h-12 w-12 text-muted-foreground" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Your cart is empty</h1>
          <p className="text-muted-foreground mb-6">Looks like you haven't added anything to your cart yet.</p>
          <Button onClick={() => (window.location.href = "/products")}>Continue Shopping</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Shopping Cart</h1>
        <Button variant="destructive" onClick={handleClearCart} disabled={cart.merchants.length === 0}>
          <Trash2 className="h-4 w-4 mr-2" />
          Clear All Cart
        </Button>
      </div>
      <div className="grid gap-8 lg:grid-cols-12">
        <div className="lg:col-span-8 space-y-6">
          {cart.merchants.map((merchant) => (
            <Card key={merchant.merchantId} className="overflow-hidden">
              <CardHeader className="bg-muted/50">
                <CardTitle className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <ShoppingBag className="h-4 w-4 text-primary" />
                  </div>
                  {merchant.merchantName}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-auto p-6">
                  <div className="space-y-6">
                    {merchant.products.map((product) => (
                      <div key={product.id} className="flex gap-4">
                        <div className="relative aspect-square h-24 w-24 shrink-0 overflow-hidden rounded-lg border">
                          <Image
                            src={product.images?.[0] || "/placeholder-image.jpg"}
                            alt={product.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="flex flex-1 flex-col">
                          <div className="flex-1">
                            <h3 className="font-medium">{product.name}</h3>
                            <p className="text-sm text-muted-foreground mt-1">
                              ETB{(
                                product.offer?.price && product.offer?.offerEndDate > new Date()
                                  ? product.offer.price
                                  : product.price
                              ).toFixed(2)}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Delivery: {product.delivery} ($
                              {calculateDeliveryPrice(product, product.quantity, coordinates).toFixed(2)})
                            </p>
                          </div>
                          <div className="flex items-center justify-between mt-4">
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() =>
                                  updateQuantity(merchant.merchantId, product.id, Math.max(0, product.quantity - 1))
                                }
                              >
                                <Minus className="h-4 w-4" />
                              </Button>
                              <span className="w-12 text-center">{product.quantity}</span>
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() =>
                                  updateQuantity(merchant.merchantId, product.id, product.quantity + 1)
                                }
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => removeProduct(merchant.merchantId, product.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
              <CardFooter className="flex items-center justify-between bg-muted/50 mt-4">
                <div>
                  <p className="text-sm text-muted-foreground">Subtotal</p>
                  <p className="text-lg font-medium">${calculateMerchantTotal(merchant).toFixed(2)}</p>
                </div>
                <Button
                  onClick={() => handlePayment(merchant.merchantId, calculateMerchantTotal(merchant))}
                  disabled={processingPayment[merchant.merchantId] || locationLoading}
                >
                  {processingPayment[merchant.merchantId] ? "Processing..." : "Pay Now"}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
        <div className="lg:col-span-4 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {cart.merchants.map((merchant) => (
                <div key={merchant.merchantId}>
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{merchant.merchantName}</span>
                    <span>${calculateMerchantTotal(merchant).toFixed(2)}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{merchant.products.length} items</p>
                  <Separator className="my-2" />
                </div>
              ))}
              <div className="flex justify-between font-medium text-lg">
                <span>Grand Total</span>
                <span>${calculateGrandTotal().toFixed(2)}</span>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full" onClick={() => (window.location.href = "/products")}>
                Continue Shopping
              </Button>
            </CardFooter>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="rounded-lg border-2 border-dashed p-4 text-center">
                <p className="text-sm text-muted-foreground">
                  Each merchant's products will be processed as a separate order
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}