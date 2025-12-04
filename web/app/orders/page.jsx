

// "use client"

// import { useState, useEffect } from "react"
// import { useSession } from "next-auth/react"
// import { useRouter } from "next/navigation"
// import { Package, Clock, CheckCircle, XCircle } from "lucide-react"
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
// import { Button } from "@/components/ui/button"
// import { Badge } from "@/components/ui/badge"
// import { format } from "date-fns"

// export default function OrdersPage() {
//   const { data: session, status } = useSession()
//   const router = useRouter()
//   const [orders, setOrders] = useState([])
//   const [loading, setLoading] = useState(true)

//   useEffect(() => {
//     if (status === "unauthenticated") {
//       router.push("/auth/signin")
//     }
//   }, [status, router])

//   useEffect(() => {
//     const fetchOrders = async () => {
//       try {
//         const response = await fetch("/api/orderFiltering?myOrders=true")
//         if (!response.ok) throw new Error("Failed to fetch orders")
//         const data = await response.json()
//         if (data.success) {
//           setOrders(data.orders)
//         }
//       } catch (error) {
//         console.error("Error fetching orders:", error)
//       } finally {
//         setLoading(false)
//       }
//     }

//     if (status === "authenticated") {
//       fetchOrders()
//     }
//   }, [status])

//   const getStatusBadge = (status) => {
//     switch (status) {
//       case "Pending":
//         return <Badge variant="warning" className="flex items-center gap-1"><Clock className="h-3 w-3" /> Pending</Badge>
//       case "Dispatched":
//         return <Badge variant="info" className="flex items-center gap-1"><Package className="h-3 w-3" /> Dispatched</Badge>
//       case "Received":
//         return <Badge variant="success" className="flex items-center gap-1"><CheckCircle className="h-3 w-3" /> Received</Badge>
//       case "Pending Refund":
//         return <Badge variant="destructive" className="flex items-center gap-1"><Clock className="h-3 w-3" /> Pending Refund</Badge>
//       case "Refunded":
//         return <Badge variant="secondary" className="flex items-center gap-1"><XCircle className="h-3 w-3" /> Refunded</Badge>
//       default:
//         return <Badge variant="outline">{status}</Badge>
//     }
//   }

//   if (loading) {
//     return (
//       <div className="container py-8">
//         <div className="flex items-center justify-center h-64">
//           <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
//         </div>
//       </div>
//     )
//   }

//   return (
//     <div className="container py-8">
//       <div className="mb-8">
//         <h1 className="text-3xl font-bold">My Orders</h1>
//         <p className="text-muted-foreground">View and manage your orders</p>
//       </div>

//       {orders.length === 0 ? (
//         <Card>
//           <CardContent className="flex flex-col items-center justify-center py-12">
//             <Package className="h-12 w-12 text-muted-foreground mb-4" />
//             <h3 className="text-lg font-medium">No orders yet</h3>
//             <p className="text-muted-foreground text-center mt-2">
//               You haven't placed any orders yet. Start shopping to see your orders here.
//             </p>
//             <Button className="mt-4" onClick={() => router.push("/products")}>
//               Start Shopping
//             </Button>
//           </CardContent>
//         </Card>
//       ) : (
//         <div className="grid gap-6">
//           {orders.map((order) => (
//             <Card key={order._id} className="hover:shadow-md transition-shadow">
//               <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//                 <CardTitle className="text-lg font-medium">
//                   Order #{order.transactionRef}
//                 </CardTitle>
//                 <div className="flex items-center gap-2">
//                   {getStatusBadge(order.status)}
//                   {getStatusBadge(order.paymentStatus)}
//                 </div>
//               </CardHeader>
//               <CardContent>
//                 <div className="grid gap-4">
//                   <div className="flex items-center justify-between">
//                     <div className="space-y-1">
//                       <p className="text-sm text-muted-foreground">
//                         Placed on {format(new Date(order.orderDate), "MMMM d, yyyy")}
//                       </p>
//                       <p className="text-sm text-muted-foreground">
//                         Merchant: {order.merchantDetail.merchantName}
//                       </p>
//                     </div>
//                     <div className="text-right">
//                       <p className="text-lg font-medium">
//                         ${order.totalPrice.toFixed(2)}
//                       </p>
//                       <p className="text-sm text-muted-foreground">
//                         {order.products.length} items
//                       </p>
//                     </div>
//                   </div>
//                   <div className="flex justify-end">
//                     <Button
//                       variant="outline"
//                       onClick={() => router.push(`/orders/${order._id}`)}
//                     >
//                       View Details
//                     </Button>
//                   </div>
//                 </div>
//               </CardContent>
//             </Card>
//           ))}
//         </div>
//       )}
//     </div>
//   )
// }
// app/orders/page.js
"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Package, Clock, CheckCircle, XCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { useToast } from "@/components/ui/use-toast";

export default function OrdersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, router]);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch("/api/orderFiltering?myOrders=true");
        if (!response.ok) throw new Error("Failed to fetch orders");
        const data = await response.json();
        if (data.success) {
          setOrders(data.orders);
        } else {
          toast({
            title: "Error",
            description: data.message || "Failed to fetch orders",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Error fetching orders:", error);
        toast({
          title: "Error",
          description: error.message || "Failed to fetch orders",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    if (status === "authenticated") {
      fetchOrders();
    }
  }, [status, toast]);

  const getStatusBadge = (status) => {
    switch (status) {
      case "Pending":
        return (
          <Badge variant="warning" className="flex items-center gap-1">
            <Clock className="h-3 w-3" /> Pending
          </Badge>
        );
      case "Dispatched":
        return (
          <Badge variant="info" className="flex items-center gap-1">
            <Package className="h-3 w-3" /> Dispatched
          </Badge>
        );
      case "Received":
        return (
          <Badge variant="success" className="flex items-center gap-1">
            <CheckCircle className="h-3 w-3" /> Received
          </Badge>
        );
      case "Pending Refund":
        return (
          <Badge variant="destructive" className="flex items-center gap-1">
            <Clock className="h-3 w-3" /> Pending Refund
          </Badge>
        );
      case "Refunded":
        return (
          <Badge variant="secondary" className="flex items-center gap-1">
            <XCircle className="h-3 w-3" /> Refunded
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="container py-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">My Orders</h1>
        <p className="text-muted-foreground">
          {session?.user?.role === "merchant"
            ? "View orders you placed as a customer"
            : "View and manage your orders"}
        </p>
      </div>

      {orders.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Package className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">No orders yet</h3>
            <p className="text-muted-foreground text-center mt-2">
              You haven't placed any orders yet. Start shopping to see your orders here.
            </p>
            <Button className="mt-4" onClick={() => router.push("/products")}>
              Start Shopping
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {orders.map((order) => (
            <Card key={order._id} className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-lg font-medium">
                  Order #{order.transactionRef}
                </CardTitle>
                <div className="flex items-center gap-2">
                  {getStatusBadge(order.status)}
                  {getStatusBadge(order.paymentStatus)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">
                        Placed on {format(new Date(order.orderDate), "MMMM d, yyyy")}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Merchant: {order.merchantDetail.merchantName}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-medium">
                        ${order.totalPrice.toFixed(2)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {order.products.length} item{order.products.length !== 1 ? "s" : ""}
                      </p>
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <Button
                      variant="outline"
                      onClick={() => router.push(`/orders/${order._id}`)}
                    >
                      View Details
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}