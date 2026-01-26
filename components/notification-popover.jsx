"use client";

import { useState, useEffect } from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import Link from "next/link";
import { socket } from "@/libs/socketClient";
import { useSession } from "next-auth/react";

export function NotificationPopover() {
  const { data: session } = useSession();
  const [notifications, setNotifications] = useState([]); // Always start as an array
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true); // Add loading state

  useEffect(() => {
    // Fetch initial notifications
    const fetchNotifications = async () => {
      setLoading(true); // Start loading
      try {
        const response = await fetch("/api/notifications");
        if (!response.ok) throw new Error("Failed to fetch notifications");
        const data = await response.json();
        console.log("hm:", data);
        // Ensure notifications is always an array, even if undefined
        const fetchedNotifications = Array.isArray(data.notifications) ? data.notifications : [];
        setNotifications(fetchedNotifications);
        setUnreadCount(data.unreadCount || 0);
      } catch (error) {
        console.error("Error fetching notifications:", error);
        setNotifications([]); // Fallback to empty array on error
      } finally {
        setLoading(false); // Stop loading
      }
    };

    if (session?.user?.id) {
      fetchNotifications();
    }

    // Socket event listeners
    socket.on("newBid", (data) => {
      const newNotification = {
        id: Date.now().toString(), // Temporary unique ID
        title: "New Bid Placed",
        description: `${data.bidderName} placed a bid of $${data.bidAmount}`,
        time: "Just now",
        read: false,
        type: "bid",
      };
      setNotifications((prev) => [newNotification, ...prev]);
      setUnreadCount((prev) => prev + 1);
    });

    socket.on("outbid", (data) => {
      const newNotification = {
        id: Date.now().toString(), // Temporary unique ID
        title: "You've been outbid",
        description: `${data.bidderName} outbid you with $${data.bidAmount}`,
        time: "Just now",
        read: false,
        type: "outbid",
      };
      setNotifications((prev) => [newNotification, ...prev]);
      setUnreadCount((prev) => prev + 1);
    });

    return () => {
      socket.off("newBid");
      socket.off("outbid");
    };
  }, [session]);

  const markAllAsRead = async () => {
    try {
      await fetch("/api/notifications/mark-all-read", {
        method: "PUT",
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error("Error marking notifications as read:", error);
    }
  };
  const markAsRead = async (id) => {
    try {
      await fetch("/api/notifications/mark-read", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
      setUnreadCount((prev) => Math.max(prev - 1, 0)); // Prevent negative count
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case "bid":
        return "bg-primary/10 text-primary";
      case "outbid":
        return "bg-destructive/10 text-destructive";
      case "won":
        return "bg-success/10 text-success";
      case "ending":
        return "bg-highlight/10 text-highlight-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative rounded-full hover:bg-primary/10 hover:text-primary transition-colors"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-medium text-destructive-foreground">
              {unreadCount}
            </span>
          )}
          <span className="sr-only">Notifications</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[380px] p-0" align="end">
        <div className="flex items-center justify-between border-b p-4">
          <h4 className="font-semibold">Notifications</h4>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={markAllAsRead}
              className="text-primary "
            >
              Mark all as read
            </Button>
          )}
        </div>
        <Tabs defaultValue="all">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="unread">Unread</TabsTrigger>
            <TabsTrigger value="bids">Bids</TabsTrigger>
          </TabsList>
          <TabsContent value="all" className="p-0">
            <ScrollArea className="h-[300px]">
              {loading ? (
                <div className="p-8 text-center text-muted-foreground">Loading...</div>
              ) : notifications.length > 0 ? (
                <div className="divide-y">
                  {notifications.map((notification) => (
                    <div
                      key={notification._id}
                      className={`flex gap-4 p-4 ${
                        !notification.read ? "bg-primary/5" : ""
                      }`}
                    >
                      <div
                        className={`mt-1 h-2 w-2 rounded-full ${
                          !notification.read ? "bg-primary" : "bg-transparent"
                        }`}
                      />
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium">{notification.title}</p>
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full ${getTypeColor(
                              notification.type
                            )}`}
                          >
                            {notification.type}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {notification.description}
                        </p>
                        <p className="text-xs text-muted-foreground">{notification.time}</p>
                        {!notification.read && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => markAsRead([notification.id])}
                            className=" text-primary "
                          >
                            Mark as read
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-muted-foreground">
                  No notifications
                </div>
              )}
            </ScrollArea>
          </TabsContent>
          {/* Add similar TabsContent for "unread" and "bids" if needed */}
          <TabsContent value="unread" className="p-0">
            <ScrollArea className="h-[300px]">
              {loading ? (
                <div className="p-8 text-center text-muted-foreground">Loading...</div>
              ) : notifications.filter((n) => !n.read).length > 0 ? (
                <div className="divide-y">
                  {notifications
                    .filter((n) => !n.read)
                    .map((notification) => (
                      <div
                        key={notification._id}
                        className={`flex gap-4 p-4 ${!notification.read ? "bg-primary/5" : ""}`}
                      >
                        <div
                          className={`mt-1 h-2 w-2 rounded-full ${
                            !notification.read ? "bg-primary" : "bg-transparent"
                          }`}
                        />
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium">{notification.title}</p>
                            <span
                              className={`text-xs px-2 py-0.5 rounded-full ${getTypeColor(
                                notification.type
                              )}`}
                            >
                              {notification.type}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {notification.description}
                          </p>
                          <p className="text-xs text-muted-foreground">{notification.time}</p>
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="p-8 text-center text-muted-foreground">
                  No unread notifications
                </div>
              )}
            </ScrollArea>
          </TabsContent>
          <TabsContent value="bids" className="p-0">
            <ScrollArea className="h-[300px]">
              {loading ? (
                <div className="p-8 text-center text-muted-foreground">Loading...</div>
              ) : notifications.filter((n) => ["bid", "outbid", "won"].includes(n.type))
                  .length > 0 ? (
                <div className="divide-y">
                  {notifications
                    .filter((n) => ["bid", "outbid", "won"].includes(n.type))
                    .map((notification) => (
                      <div
                        key={notification._id}
                        className={`flex gap-4 p-4 ${
                          !notification.read ? "bg-primary/5" : ""
                        }`}
                      >
                        <div
                          className={`mt-1 h-2 w-2 rounded-full ${
                            !notification.read ? "bg-primary" : "bg-transparent"
                          }`}
                        />
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium">{notification.title}</p>
                            <span
                              className={`text-xs px-2 py-0.5 rounded-full ${getTypeColor(
                                notification.type
                              )}`}
                            >
                              {notification.type}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {notification.description}
                          </p>
                          <p className="text-xs text-muted-foreground">{notification.time}</p>
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="p-8 text-center text-muted-foreground">
                  No bid notifications
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>
        <div className="border-t p-2">
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-center text-primary hover:text-primary/80 hover:bg-primary/5"
            asChild
          >
            <Link href="/notifications">View all notifications</Link>
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}