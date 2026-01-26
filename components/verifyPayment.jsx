"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useCart } from "@/components/cart-provider"
import { CheckCircle, XCircle, Loader2 } from "lucide-react"

export default function VerifyPayment() {
  const [message, setMessage] = useState("Processing payment...")
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const { clearMerchant } = useCart()

  useEffect(() => {
    const verifyPayment = async () => {
      const search = window.location.search.replace(/amp;/g, "&")
      const urlParams = new URLSearchParams(search)
      const tx_ref = urlParams.get("tx_ref")
      const orderId = urlParams.get("orderId")

      if (!tx_ref || !orderId) {
        setMessage("Invalid transaction reference or order ID")
        setError(true)
        setLoading(false)
        return
      }

      try {
        // First verify with Chapa
        const verifyResponse = await fetch(`/api/verifyPayment?tx_ref=${tx_ref}`)
        const verifyData = await verifyResponse.json()

        if (!verifyResponse.ok) {
          setMessage(verifyData.message || "Payment verification failed")
          setError(true)
          setLoading(false)
          return
        }

        // Then check the order status
        const orderResponse = await fetch(`/api/order/verify?tx_ref=${tx_ref}`)
        const orderData = await orderResponse.json()

        if (orderResponse.ok && orderData.order) {
          setMessage("Payment successful! Your order has been placed.")
          const merchantId = localStorage.getItem(`merchantId_${tx_ref}`)
          if (merchantId) {
            clearMerchant(merchantId)
            localStorage.removeItem(`tx_ref_${merchantId}`)
            localStorage.removeItem(`merchantId_${tx_ref}`)
          }
        } else {
          setMessage(orderData.message || "Order verification failed")
          setError(true)
        }
      } catch (err) {
        console.error("Verification error:", err)
        setMessage("Error verifying payment")
        setError(true)
      } finally {
        setLoading(false)
      }
    }

    verifyPayment()
  }, [clearMerchant])

  return (
    <div className="container py-16">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Order Status</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          {loading ? (
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-muted-foreground">{message}</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center gap-4">
              <XCircle className="h-8 w-8 text-destructive" />
              <p className="text-destructive">{message}</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4">
              <CheckCircle className="h-8 w-8 text-green-500" />
              <p className="text-green-500">{message}</p>
            </div>
          )}
          <Button
            className="mt-4"
            onClick={() => router.push("/products")}
          >
            Continue Shopping
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}