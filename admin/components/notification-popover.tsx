// components/NotificationPopover.jsx
"use client";

import { useEffect, useState } from "react";
import io, { Socket } from "socket.io-client";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { DefaultEventsMap } from "@socket.io/component-emitter";

type Notification = {
  _id: string;
  title: string;
  description: string;
  createdAt: string;
  isRead: boolean;
  readersCount: number;
  link?: string;
};

let socket: Socket<DefaultEventsMap, DefaultEventsMap>;

export function NotificationPopover() {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const fetchNotifications = async () => {
    try {
      const res = await fetch("/api/announcement");
      if (!res.ok) throw new Error("Failed to fetch notifications");
      const data = await res.json();
      setNotifications(data || []);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  useEffect(() => {
    // Initialize Socket.IO client
    socket = io(process.env.NEXT_PUBLIC_FRONTEND_URL || "http://localhost:3000", {
      path: "/api/socket/io",
    });

    socket.on("connect", () => {
      console.log("Connected to Socket.IO server");
    });

    socket.on("new-announcement", (newNotif: Notification) => {
      setNotifications((prev) => [newNotif, ...prev]);
    });

    socket.on("connect_error", (error) => {
      console.error("Socket.IO connection error:", error);
    });

    // Fetch initial notifications
    fetchNotifications();

    // Initialize Socket.IO server
    fetch("/api/socket").catch((error) =>
      console.error("Error initializing Socket.IO:", error),
    );

    return () => {
      socket.disconnect();
    };
  }, []);

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