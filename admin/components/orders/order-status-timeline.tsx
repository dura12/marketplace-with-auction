import { CheckCircle2, Clock, Truck } from "lucide-react"

interface OrderStatusTimelineProps {
  status: string
}

export function OrderStatusTimeline({ status }: OrderStatusTimelineProps) {
  const isPending = status === "Pending"
  const isDispatched = status === "Dispatched" || status === "Received"
  const isReceived = status === "Received"

  return (
    <div className="space-y-8 relative before:absolute before:inset-0 before:left-3.5 before:w-0.5 before:bg-muted before:ml-0.5">
      <div className="flex items-start space-x-4">
        <div
          className={`relative flex h-8 w-8 items-center justify-center rounded-full ${isPending ? "bg-yellow-100 text-yellow-900 dark:bg-yellow-900 dark:text-yellow-300" : "bg-green-100 text-green-900 dark:bg-green-900 dark:text-green-300"}`}
        >
          <CheckCircle2 className="h-4 w-4" />
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium leading-none">Order Placed</p>
          <p className="text-sm text-muted-foreground">Order has been placed successfully</p>
        </div>
      </div>
      <div className="flex items-start space-x-4">
        <div
          className={`relative flex h-8 w-8 items-center justify-center rounded-full ${isDispatched ? "bg-green-100 text-green-900 dark:bg-green-900 dark:text-green-300" : "bg-muted text-muted-foreground"}`}
        >
          <Truck className="h-4 w-4" />
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium leading-none">Order Dispatched</p>
          <p className="text-sm text-muted-foreground">Order has been dispatched for delivery</p>
        </div>
      </div>
      <div className="flex items-start space-x-4">
        <div
          className={`relative flex h-8 w-8 items-center justify-center rounded-full ${isReceived ? "bg-green-100 text-green-900 dark:bg-green-900 dark:text-green-300" : "bg-muted text-muted-foreground"}`}
        >
          <Clock className="h-4 w-4" />
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium leading-none">Order Received</p>
          <p className="text-sm text-muted-foreground">Customer has received the order</p>
        </div>
      </div>
    </div>
  )
}
