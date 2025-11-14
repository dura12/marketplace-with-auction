const generateId = () => Math.random().toString(36).substring(2, 11)

// Generate mock notifications
export const getMockNotifications = (): Notification[] => {
  const now = new Date()

  return [
    {
      id: generateId(),
      title: "System maintenance scheduled",
      description: "The system will be down for maintenance on Sunday, March 20th from 2:00 AM to 4:00 AM UTC.",
      type: "system",
      timestamp: new Date(now.getTime() - 1000 * 60 * 30), // 30 minutes ago
      read: false,
    },
    {
      id: generateId(),
      title: "New user registration spike",
      description: "There has been a 25% increase in new user registrations in the last 24 hours.",
      type: "alert",
      timestamp: new Date(now.getTime() - 1000 * 60 * 60 * 2), // 2 hours ago
      read: false,
      actionUrl: "/users",
      actionLabel: "View users",
    },
    {
      id: generateId(),
      title: "Payment processing issue resolved",
      description: "The payment processing issue affecting some transactions has been resolved.",
      type: "update",
      timestamp: new Date(now.getTime() - 1000 * 60 * 60 * 5), // 5 hours ago
      read: true,
    },
    {
      id: generateId(),
      title: "New message from Jane Smith",
      description: "I have a question about my recent order #12345. Can you please check the status?",
      type: "message",
      timestamp: new Date(now.getTime() - 1000 * 60 * 60 * 8), // 8 hours ago
      read: false,
      sender: {
        name: "Jane Smith",
        avatar: "/placeholder.svg?height=40&width=40",
      },
      actionUrl: "/messages/jane-smith",
      actionLabel: "Reply",
    },
    {
      id: generateId(),
      title: "New auction needs approval",
      description: "A new auction for 'Vintage Camera Collection' has been submitted and requires your approval.",
      type: "action",
      timestamp: new Date(now.getTime() - 1000 * 60 * 60 * 12), // 12 hours ago
      read: false,
      actionUrl: "/auctions",
      actionLabel: "Review",
    },
    {
      id: generateId(),
      title: "Weekly report available",
      description: "The weekly sales and performance report is now available for review.",
      type: "update",
      timestamp: new Date(now.getTime() - 1000 * 60 * 60 * 24), // 1 day ago
      read: true,
      actionUrl: "/reports",
      actionLabel: "View report",
    },
    {
      id: generateId(),
      title: "Security alert: Multiple failed login attempts",
      description: "There have been multiple failed login attempts for admin account 'admin@example.com'.",
      type: "alert",
      timestamp: new Date(now.getTime() - 1000 * 60 * 60 * 36), // 1.5 days ago
      read: true,
      actionUrl: "/security-logs",
      actionLabel: "View logs",
    },
    {
      id: generateId(),
      title: "New feature: Advanced analytics",
      description: "Advanced analytics features have been added to the dashboard. Check them out!",
      type: "system",
      timestamp: new Date(now.getTime() - 1000 * 60 * 60 * 48), // 2 days ago
      read: true,
      actionUrl: "/analytics",
      actionLabel: "Explore",
    },
    {
      id: generateId(),
      title: "Refund request pending",
      description: "A refund request for order #54321 is pending your approval.",
      type: "action",
      timestamp: new Date(now.getTime() - 1000 * 60 * 60 * 72), // 3 days ago
      read: true,
      actionUrl: "/refunds",
      actionLabel: "Process",
    },
    {
      id: generateId(),
      title: "Message from support team",
      description: "The support team has assigned you a new ticket #T-12345 regarding payment issues.",
      type: "message",
      timestamp: new Date(now.getTime() - 1000 * 60 * 60 * 96), // 4 days ago
      read: true,
      sender: {
        name: "Support Team",
        avatar: "/placeholder.svg?height=40&width=40",
      },
      actionUrl: "/support/tickets/T-12345",
      actionLabel: "View ticket",
    },
  ]
}

export type NotificationType = "alert" | "update" | "message" | "system" | "action"

export interface Notification {
  id: string
  title: string
  description: string
  type: NotificationType
  timestamp: Date
  read: boolean
  actionUrl?: string
  actionLabel?: string
  sender?: {
    name: string
    avatar?: string
  }
}

