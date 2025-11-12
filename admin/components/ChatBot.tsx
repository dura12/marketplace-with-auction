"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { X, Bell, ExternalLink, Loader2, CheckCircle, Send } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { formatDistanceToNow } from "date-fns";
import { useTheme } from "next-themes";

interface Announcement {
  _id: string;
  title: string;
  description: string;
  link?: string;
  createdAt: string;
  isRead: boolean;
}

export default function AnnouncementBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [showIcon, setShowIcon] = useState(true);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    link: "",
  });
  const [formLoading, setFormLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("view");
  const scrollRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const iconRef = useRef<HTMLButtonElement>(null);
  const { toast } = useToast();
  const { theme } = useTheme();

  // Handle outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (
        cardRef.current &&
        !cardRef.current.contains(e.target as Node) &&
        iconRef.current &&
        !iconRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  // Fetch announcements from API
  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/announcement", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch announcements");
      }

      const data: Announcement[] = await response.json();
      setAnnouncements(data);

      // Count unread announcements
      const unread = data.filter((announcement) => !announcement.isRead).length;
      setUnreadCount(unread);
    } catch (error) {
      console.error("Error fetching announcements:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch announcements.",
      });
    } finally {
      setLoading(false);
    }
  };

  // Mark announcement as read
  const markAsRead = async (id: string) => {
    try {
      const response = await fetch("/api/announcement", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ announcementId: id }),
      });

      if (!response.ok) {
        throw new Error("Failed to mark announcement as read");
      }

      // Update local state
      setAnnouncements((prev) =>
        prev.map((announcement) =>
          announcement._id === id ? { ...announcement, isRead: true } : announcement
        )
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Error marking announcement as read:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to mark announcement as read.",
      });
    }
  };

  // Handle form input change
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.description) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Title and description are required.",
      });
      return;
    }

    setFormLoading(true);
    try {
      const response = await fetch("/api/announcement", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Failed to create announcement");
      }

      const newAnn: Announcement = await response.json();
      setAnnouncements((prev) => [newAnn, ...prev]);
      setUnreadCount((prev) => prev + 1);
      setFormData({ title: "", description: "", link: "" });
      setActiveTab("view");

      toast({
        title: "Success",
        description: "Announcement sent successfully!",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to send announcement",
      });
    } finally {
      setFormLoading(false);
    }
  };

  // Clear all readBy for the user
  const clearAllRead = async () => {
    try {
      const response = await fetch("/api/announcement", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to clear read announcements");
      }

      // Update local state
      setAnnouncements((prev) =>
        prev.map((announcement) => ({ ...announcement, isRead: false }))
      );
      setUnreadCount(announcements.length);

      toast({
        title: "Success",
        description: "All announcements marked as unread.",
      });
    } catch (error) {
      console.error("Error clearing read announcements:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to clear read announcements.",
      });
    }
  };

  // Fetch announcements on mount and periodically
  useEffect(() => {
    fetchAnnouncements();
    const interval = setInterval(fetchAnnouncements, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Auto-scroll to latest announcement
  useEffect(() => {
    if (scrollRef.current && isOpen && activeTab === "view") {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [announcements, isOpen, activeTab]);

  const toggleOpen = () => setIsOpen(!isOpen);

  const isDark = theme === "dark";

  return (
    <>
      {/* Notification Icon */}
      <AnimatePresence>
        {showIcon && (
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            transition={{ duration: 0.3 }}
            className="fixed bottom-6 right-6 z-50"
          >
            <Button
              ref={iconRef}
              onClick={toggleOpen}
              size="icon"
              className="rounded-full size-16 gradient-bg shadow-lg transition-all duration-300 relative"
            >
              <Bell className="size-8" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 dark:bg-red-600 text-white rounded-full size-6 flex items-center justify-center text-xs font-bold">
                  {unreadCount}
                </span>
              )}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Announcements Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ duration: 0.3 }}
            className="fixed bottom-24 right-6 z-50 w-full max-w-md"
          >
            <Card ref={cardRef} className="gradient-card shadow-2xl">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-xl font-bold gradient-text">
                  Announcements
                </CardTitle>
                <Button
                  onClick={toggleOpen}
                  size="sm"
                  variant="ghost"
                  className="hover:bg-purple-100 dark:hover:bg-purple-900/30"
                >
                  <X className="size-5" />
                  <span className="sr-only">Close</span>
                </Button>
              </CardHeader>

              <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-2 bg-purple-100/80 dark:bg-purple-900/30">
                    <TabsTrigger
                      value="view"
                      className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900 data-[state=active]:text-purple-700 dark:data-[state=active]:text-purple-400"
                    >
                      View
                    </TabsTrigger>
                    <TabsTrigger
                      value="create"
                      className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900 data-[state=active]:text-purple-700 dark:data-[state=active]:text-purple-400"
                    >
                      Create
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="view">
                    <ScrollArea className="h-[300px] pr-4">
                      {loading && (
                        <div className="w-full h-full flex items-center justify-center">
                          <Loader2 className="animate-spin h-8 w-8 text-purple-600 dark:text-purple-400" />
                        </div>
                      )}

                      {!loading && announcements.length === 0 && (
                        <div className="w-full h-full flex flex-col items-center justify-center text-gray-500 dark:text-gray-400">
                          <Bell className="size-12 mb-2 opacity-50" />
                          <p>No announcements yet</p>
                        </div>
                      )}

                      {!loading &&
                        announcements.map((announcement) => (
                          <div
                            key={announcement._id}
                            className={`mb-4 p-4 rounded-lg border backdrop-blur-sm ${
                              !announcement.isRead
                                ? "bg-purple-50/80 border-purple-300 dark:bg-purple-900/20 dark:border-purple-700"
                                : "bg-white/80 border-purple-100 dark:bg-gray-900/50 dark:border-purple-900"
                            }`}
                          >
                            <div className="flex justify-between items-start mb-2">
                              <h3 className="font-semibold text-purple-700 dark:text-purple-400">
                                {announcement.title}
                              </h3>
                              {!announcement.isRead && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6 -mt-1 -mr-1 hover:bg-purple-100 dark:hover:bg-purple-900/30"
                                  onClick={() => markAsRead(announcement._id)}
                                >
                                  <CheckCircle className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                                  <span className="sr-only">Mark as read</span>
                                </Button>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                              {announcement.description}
                            </p>
                            <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
                              <span>
                                {formatDistanceToNow(new Date(announcement.createdAt), {
                                  addSuffix: true,
                                })}
                              </span>
                              {announcement.link && (
                                <a
                                  href={announcement.link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center text-purple-500 dark:text-purple-400 hover:text-purple-600 dark:hover:text-purple-300 hover:underline"
                                >
                                  View <ExternalLink className="ml-1 h-3 w-3" />
                                </a>
                              )}
                            </div>
                          </div>
                        ))}
                      <div ref={scrollRef}></div>
                    </ScrollArea>
                  </TabsContent>

                  <TabsContent value="create">
                    <form onSubmit={handleSubmit} className="w-full space-y-3">
                      <Input
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        placeholder="Announcement Title *"
                        className="form-input-themed"
                      />
                      <Textarea
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        placeholder="Description *"
                        className="form-input-themed min-h-[100px]"
                      />
                      <Input
                        name="link"
                        value={formData.link}
                        onChange={handleInputChange}
                        placeholder="Link (optional)"
                        className="form-input-themed"
                      />
                      <Button
                        type="submit"
                        disabled={formLoading}
                        className="w-full gradient-bg text-white"
                      >
                        {formLoading ? (
                          <Loader2 className="animate-spin h-5 w-5 mr-2" />
                        ) : (
                          <Send className="h-5 w-5 mr-2" />
                        )}
                        Send Announcement
                      </Button>
                    </form>
                  </TabsContent>
                </Tabs>
              </CardContent>

              {activeTab === "view" && (
                <CardFooter className="flex justify-between">
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {unreadCount} unread announcement{unreadCount !== 1 ? "s" : ""}
                  </span>
                  {unreadCount > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="form-button-themed"
                      onClick={clearAllRead}
                    >
                      Mark all as unread
                    </Button>
                  )}
                </CardFooter>
              )}
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}