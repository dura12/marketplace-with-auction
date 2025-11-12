"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Bell, CheckCircle, Search, Trash2 } from "lucide-react";

type Announcement = {
  _id: string;
  title: string;
  description: string;
  link?: string;
  createdAt: string;
  readersCount: number;
  isRead: boolean;
};

export function NotificationList() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [filter, setFilter] = useState<"all">("all");
  const [searchQuery, setSearchQuery] = useState("");

  const fetchAnnouncements = async () => {
    const res = await fetch("/api/announcement");
    const data = await res.json();
    console.log("Data: ", data);
    setAnnouncements(data);
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const markAsRead = async (id: string) => {
    await fetch("/api/announcement", {
      method: "PUT",
      body: JSON.stringify({ announcementId: id }),
    });
    fetchAnnouncements();
  };

  const clearRead = async () => {
    await fetch("/api/announcement", {
      method: "DELETE",
    });
    fetchAnnouncements();
  };

  const unreadCount = announcements.filter((a) => !a.isRead).length;

  const filtered = announcements.filter((a) => {
    const matchSearch =
      a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchSearch;
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-2xl font-bold tracking-tight">Announcements</h2>
          {unreadCount > 0 && (
            <span className="rounded-full bg-primary px-2.5 py-0.5 text-xs font-semibold text-primary-foreground">
              {unreadCount} unread
            </span>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              announcements.forEach((a) => {
                if (!a.isRead) markAsRead(a._id);
              });
            }}
            disabled={unreadCount === 0}
            className="flex items-center gap-1"
          >
            <CheckCircle className="h-4 w-4" />
            <span>Mark all as read</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={clearRead}
            className="flex items-center gap-1"
          >
            <Trash2 className="h-4 w-4" />
            <span>Clear read</span>
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search announcements..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <Select value={filter} onValueChange={(value) => setFilter(value as "all")}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Filter" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        {filtered.length > 0 ? (
          filtered.map((a) => (
            <div
              key={a._id}
              className={`border p-4 rounded-lg ${a.isRead ? "bg-muted" : "bg-background"}`}
            >
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">{a.title}</h3>
                {!a.isRead && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => markAsRead(a._id)}
                    className="text-xs"
                  >
                    Mark as read
                  </Button>
                )}
              </div>
              <p className="text-sm text-muted-foreground mt-1">{a.description}</p>
              {a.link && (
                <a
                  href={a.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 text-sm mt-2 inline-block underline"
                >
                  View more
                </a>
              )}
              <div className="text-xs text-muted-foreground mt-2">
                {new Date(a.createdAt).toLocaleString()} • Read by {a.readersCount}
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="rounded-full bg-muted p-3 mb-3">
              <Bell className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium">No announcements</h3>
            <p className="text-sm text-muted-foreground mt-1">
              {announcements.length > 0
                ? "No announcements match your current search."
                : "You're all caught up!"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
