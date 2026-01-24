// components/NotificationPopover.jsx
"use client";

import { useEffect, useState, useRef } from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useSession } from "next-auth/react";

type Notification = {
  _id: string;
  title: string;
  description: string;
  createdAt: string;
  isRead: boolean;
  readersCount: number;
  link?: string;
};

export function NotificationPopover() {
  const { status } = useSession();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const socketRef = useRef<ReturnType<typeof import("socket.io-client").io> | null>(null);
  const socketInitialized = useRef(false);

  const fetchNotifications = async () => {
    try {
      const res = await fetch("/api/announcement");
      if (!res.ok) throw new Error("Failed to fetch notifications");
      const data = await res.json();
      setNotifications(data || []);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      setNotifications([]);
    }
  };

  useEffect(() => {
    // Only run when authenticated
    if (status !== "authenticated") return;
    
    // Fetch initial notifications
    fetchNotifications();

    // Initialize Socket.IO client (optional - gracefully handle if unavailable)
    const initSocket = async () => {
      if (socketInitialized.current) return;
      
      try {
        const { io } = await import("socket.io-client");
        const socketUrl = process.env.NEXT_PUBLIC_FRONTEND_URL || "http://localhost:3001";
        
        socketRef.current = io(socketUrl, {
          path: "/api/socket/io",
          transports: ["websocket", "polling"],
          reconnectionAttempts: 3,
          reconnectionDelay: 5000,
          timeout: 10000,
        });

        socketRef.current.on("connect", () => {
          console.log("Connected to Socket.IO server");
        });

        socketRef.current.on("new-announcement", (newNotif: Notification) => {
          setNotifications((prev) => [newNotif, ...prev]);
        });

        socketRef.current.on("connect_error", () => {
          // Silently handle connection errors - socket is optional
          console.log("Socket connection unavailable - notifications will be fetched via polling");
        });

        socketInitialized.current = true;
      } catch (error) {
        // Socket.io is optional, don't crash if unavailable
        console.log("Socket.io not available, using polling for notifications");
      }
    };

    initSocket();

    // Poll for notifications every 30 seconds as fallback
    const pollInterval = setInterval(fetchNotifications, 30000);

    return () => {
      clearInterval(pollInterval);
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        socketInitialized.current = false;
      }
    };
  }, [status]);

  const markAsRead = async (id: string) => {
    try {
      const res = await fetch("/api/announcement", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ announcementId: id }),
      });
      if (res.ok) {
        setNotifications((prev) =>
          prev.map((notif) =>
            notif._id === id ? { ...notif, isRead: true } : notif,
          ),
        );
      }
    } catch (error) {
      console.error("Error marking as read:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const res = await fetch("/api/announcement", {
        method: "DELETE",
      });
      if (res.ok) {
        setNotifications((prev) =>
          prev.map((notif) => ({ ...notif, isRead: true })),
        );
      }
    } catch (error) {
      console.error("Error marking all as read:", error);
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] text-destructive-foreground">
              {unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <div className="flex items-center justify-between border-b pb-2">
          <h4 className="font-medium">Notifications</h4>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-auto p-0 text-xs text-primary"
              onClick={markAllAsRead}
            >
              Mark all as read
            </Button>
          )}
        </div>
        <div className="max-h-80 overflow-y-auto py-2">
          {notifications.length > 0 ? (
            <div className="space-y-2">
              {notifications.map((notification) => (
                <div
                  key={notification._id}
                  className={`cursor-pointer rounded-md p-2 transition-colors ${
                    notification.isRead ? "" : "bg-muted"
                  }`}
                  onClick={() => markAsRead(notification._id)}
                >
                  <div className="flex justify-between">
                    <h5 className="font-medium">{notification.title}</h5>
                    <span className="text-xs text-muted-foreground">
                      {new Date(notification.createdAt).toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {notification.description}
                  </p>
                  {notification.link && (
                    <a
                      href={notification.link}
                      className="text-xs text-primary"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Learn more
                    </a>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="py-6 text-center text-muted-foreground">
              No notifications
            </div>
          )}
        </div>
        <div className="border-t pt-2">
          <Button variant="outline" size="sm" className="w-full" asChild>
            <a href="/notifications">View all notifications</a>
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}