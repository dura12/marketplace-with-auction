"use client"

import { useState } from "react"
import { formatDistanceToNow } from "date-fns"
import { Bell, CheckCircle, Info, MessageSquare, AlertTriangle, X, MoreHorizontal } from "lucide-react"
import type { Notification } from "@/utils/notification-data"
import { NotificationType } from "@/utils/notification-data"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface NotificationItemProps {
  notification: Notification
  onMarkAsRead: (id: string) => void
  onDismiss: (id: string) => void
}

export function NotificationItem({ notification, onMarkAsRead, onDismiss }: NotificationItemProps) {
  const [isHovered, setIsHovered] = useState(false)

  const getTypeIcon = (type: NotificationType) => {
    switch (type) {
      case "alert":
        return <AlertTriangle className="h-5 w-5 text-destructive" />
      case "update":
        return <Info className="h-5 w-5 text-blue-500" />
      case "message":
        return <MessageSquare className="h-5 w-5 text-green-500" />
      case "system":
        return <Bell className="h-5 w-5 text-amber-500" />
      case "action":
        return <CheckCircle className="h-5 w-5 text-purple-500" />
      default:
        return <Bell className="h-5 w-5" />
    }
  }

  const getTypeBadge = (type: NotificationType) => {
    switch (type) {
      case "alert":
        return <Badge variant="destructive">Alert</Badge>
      case "update":
        return <Badge className="bg-blue-500">Update</Badge>
      case "message":
        return <Badge className="bg-green-500">Message</Badge>
      case "system":
        return <Badge className="bg-amber-500">System</Badge>
      case "action":
        return <Badge className="bg-purple-500">Action</Badge>
      default:
        return <Badge>Notification</Badge>
    }
  }

  return (
    <Card
      className={`mb-3 transition-all ${notification.read ? "bg-background" : "bg-muted/30 border-l-4 border-l-primary"}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className="mt-1">{getTypeIcon(notification.type)}</div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h4 className={`font-medium ${notification.read ? "" : "font-semibold"}`}>{notification.title}</h4>
                {getTypeBadge(notification.type)}
              </div>
              <p className="text-sm text-muted-foreground mb-2">{notification.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  {formatDistanceToNow(notification.timestamp, { addSuffix: true })}
                </span>
                {notification.actionUrl && (
                  <Button variant="link" size="sm" className="h-auto p-0" asChild>
                    <a href={notification.actionUrl}>{notification.actionLabel || "View"}</a>
                  </Button>
                )}
              </div>
            </div>
          </div>

          <div className={`flex items-center gap-1 ${isHovered ? "opacity-100" : "opacity-0"} transition-opacity`}>
            {!notification.read && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => onMarkAsRead(notification.id)}
                title="Mark as read"
              >
                <CheckCircle className="h-4 w-4" />
              </Button>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {notification.read ? (
                  <DropdownMenuItem onClick={() => onMarkAsRead(notification.id)}>Mark as unread</DropdownMenuItem>
                ) : (
                  <DropdownMenuItem onClick={() => onMarkAsRead(notification.id)}>Mark as read</DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={() => onDismiss(notification.id)}>Dismiss</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => onDismiss(notification.id)}
              title="Dismiss"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </Card>
  )
}

