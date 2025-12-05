"use client"

   import { useState, useEffect } from "react"
   import { Bell, Check, Filter, Search, Trash2 } from "lucide-react"
   import { Button } from "@/components/ui/button"
   import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
   import { Input } from "@/components/ui/input"
   import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
   import { Badge } from "@/components/ui/badge"
   import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
   import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
   import { useToast } from "@/components/ui/use-toast"
   import { Checkbox } from "@/components/ui/checkbox"
   import { useSocket } from "@/libs/useSocket"
   import { useSession } from "next-auth/react"

   export default function NotificationsPage() {
       const { toast } = useToast()
       const { data: session } = useSession()
       const { onNewBid, onOutbid } = useSocket()
       const [searchQuery, setSearchQuery] = useState("")
       const [selectedNotifications, setSelectedNotifications] = useState([])
       const [notifications, setNotifications] = useState([])
       const [unreadCount, setUnreadCount] = useState(0)

       const fetchNotifications = async () => {
        try {
            const response = await fetch('/api/notifications');
            if (!response.ok) {
                console.error("API Error:", response.status, response.statusText);
                return;
            }
            const data = await response.json();
            console.log("API Response:", data);
            setNotifications(data.notifications.map(n => ({
                id: n._id,
                title: n.title,
                description: n.description,
                time: new Date(n.createdAt).toLocaleString(),
                read: n.read,
                type: n.type,
                data: n.data
            })));
            setUnreadCount(data.unreadCount);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        }
    };
       useEffect(() => {
           if (session?.user?.id) {
               fetchNotifications();
               onNewBid(() => fetchNotifications());
               onOutbid(() => fetchNotifications());
           }
       }, [session, onNewBid, onOutbid]);

       // In NotificationPopover component
        const markAsRead = async (ids) => {
            try {
            await fetch('/api/notifications', {
                method: 'PUT',
                headers: {
                'Content-Type': 'application/json',
                },
                body: JSON.stringify({ ids }),
            });
            // Calculate how many of the selected notifications were unread
            const unreadMarked = ids.filter(id => !notifications.find(n => n.id === id)?.read).length;
            setNotifications(prev => prev.map(n => ids.includes(n.id) ? { ...n, read: true } : n));
            setUnreadCount(prev => prev - unreadMarked);
            toast({
                title: "Notifications marked as read",
                description: `${ids.length} notification${ids.length > 1 ? "s" : ""} marked as read`,
            });
            } catch (error) {
            console.error('Error marking notifications as read:', error);
            }
        };

       const markAllAsRead = async () => {
           try {
               await fetch('/api/notifications/mark-all-read', {
                   method: 'PUT'
               })
               setNotifications(prev => prev.map(n => ({ ...n, read: true })))
               setSelectedNotifications([])
               setUnreadCount(0)
               toast({
                   title: "All notifications marked as read",
                   description: "All notifications have been marked as read",
               })
           } catch (error) {
               console.error('Error marking all notifications as read:', error)
           }
       }

       const deleteNotifications = async (ids) => {
           try {
               await fetch('/api/notifications', {
                   method: 'DELETE',
                   headers: {
                       'Content-Type': 'application/json',
                   },
                   body: JSON.stringify({ ids }),
               })
               setNotifications(prev => prev.filter(n => !ids.includes(n.id)))
               setSelectedNotifications([])
               setUnreadCount(prev => prev - ids.filter(id => !notifications.find(n => n.id === id)?.read).length)
               toast({
                   title: "Notifications deleted",
                   description: `${ids.length} notification${ids.length > 1 ? "s" : ""} deleted`,
               })
           } catch (error) {
               console.error('Error deleting notifications:', error)
           }
       }

       const toggleSelectNotification = (id) => {
           setSelectedNotifications((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]))
       }

       const toggleSelectAll = (notifs) => {
           if (selectedNotifications.length === notifs.length) {
               setSelectedNotifications([])
           } else {
               setSelectedNotifications(notifs.map((n) => n.id))
           }
       }

       const getTypeColor = (type) => {
           switch (type) {
               case "bid":
                   return "bg-primary/10 text-primary"
               case "outbid":
                   return "bg-destructive/10 text-destructive"
               case "won":
                   return "bg-success/10 text-success"
               case "ending":
                   return "bg-highlight/10 text-highlight-foreground"
               default:
                   return "bg-muted text-muted-foreground"
           }
       }

       const filterNotifications = (tab, notifs) => {
           let filtered = notifs
           if (searchQuery) {
               filtered = filtered.filter(
                   (n) =>
                       n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                       n.description.toLowerCase().includes(searchQuery.toLowerCase())
               )
           }
           if (tab === "unread") {
               filtered = filtered.filter((n) => !n.read)
           } else if (tab === "bids") {
               filtered = filtered.filter((n) => ["bid", "outbid", "won"].includes(n.type))
           }
           return filtered
       }

       const renderNotificationList = (notifs) => {
           if (notifs.length === 0) {
               return (
                   <div className="flex flex-col items-center justify-center py-12 text-center">
                       <Bell className="h-12 w-12 text-muted-foreground mb-4" />
                       <h3 className="text-lg font-medium">No notifications</h3>
                       <p className="text-muted-foreground mt-1">You don't have any notifications at the moment</p>
                   </div>
               )
           }

           return (
               <div className="divide-y">
                   {notifs.map((notification) => (
                       <div
                           key={notification.id}
                           className={`flex gap-4 p-4 transition-colors ${
                               !notification.read ? "bg-primary/5" : ""
                           } ${selectedNotifications.includes(notification.id) ? "bg-muted" : ""}`}
                       >
                           <div className="flex items-center">
                               <Checkbox
                                   checked={selectedNotifications.includes(notification.id)}
                                   onCheckedChange={() => toggleSelectNotification(notification.id)}
                                   aria-label={`Select notification ${notification.title}`}
                               />
                           </div>
                           <div className={`mt-1 h-2 w-2 rounded-full ${!notification.read ? "bg-primary" : "bg-transparent"}`} />
                           <div className="space-y-1 flex-1">
                               <div className="flex items-center gap-2">
                                   <p className="text-sm font-medium">{notification.title}</p>
                                   <span className={`text-xs px-2 py-0.5 rounded-full ${getTypeColor(notification.type)}`}>
                                       {notification.type}
                                   </span>
                               </div>
                               <p className="text-sm text-muted-foreground">{notification.description}</p>
                               <p className="text-xs text-muted-foreground">{notification.time}</p>
                           </div>
                           <div className="flex items-start space-x-2">
                               {!notification.read && (
                                   <Button variant="ghost" size="icon" onClick={() => markAsRead([notification.id])} className="h-8 w-8">
                                       <Check className="h-4 w-4" />
                                       <span className="sr-only">Mark as read</span>
                                   </Button>
                               )}
                               <Button
                                   variant="ghost"
                                   size="icon"
                                   onClick={() => deleteNotifications([notification.id])}
                                   className="h-8 w-8 text-destructive hover:text-destructive"
                               >
                                   <Trash2 className="h-4 w-4" />
                                   <span className="sr-only">Delete</span>
                               </Button>
                           </div>
                       </div>
                   ))}
               </div>
           )
       }

       return (
           <div className="container mx-auto px-4 py-8">
               <div className="mb-8">
                   <h1 className="text-3xl font-bold">Notifications</h1>
                   <p className="text-muted-foreground mt-1">
                       Stay updated with your auction activity and important announcements
                   </p>
               </div>

               <Card>
                   <CardHeader className="flex flex-col sm:flex-row justify-between space-y-2 sm:space-y-0">
                       <div className="flex items-center">
                           <CardTitle>Your Notifications</CardTitle>
                           {unreadCount > 0 && (
                               <Badge variant="default" className="ml-2">
                                   {unreadCount} unread
                               </Badge>
                           )}
                       </div>
                       <div className="flex flex-col sm:flex-row gap-2">
                           <div className="relative">
                               <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                               <Input
                                   type="search"
                                   placeholder="Search notifications..."
                                   className="pl-8 w-full sm:w-[200px] lg:w-[300px]"
                                   value={searchQuery}
                                   onChange={(e) => setSearchQuery(e.target.value)}
                               />
                           </div>
                           <DropdownMenu>
                               <DropdownMenuTrigger asChild>
                                   <Button variant="outline" size="icon" className="h-9 w-9">
                                       <Filter className="h-4 w-4" />
                                       <span className="sr-only">Filter</span>
                                   </Button>
                               </DropdownMenuTrigger>
                               <DropdownMenuContent align="end">
                                   <DropdownMenuItem>
                                       <Select defaultValue="newest">
                                           <SelectTrigger className="w-[180px] border-0 p-0 h-auto">
                                               <SelectValue placeholder="Sort by" />
                                           </SelectTrigger>
                                           <SelectContent>
                                               <SelectItem value="newest">Newest first</SelectItem>
                                               <SelectItem value="oldest">Oldest first</SelectItem>
                                               <SelectItem value="unread">Unread first</SelectItem>
                                           </SelectContent>
                                       </Select>
                                   </DropdownMenuItem>
                               </DropdownMenuContent>
                           </DropdownMenu>
                       </div>
                   </CardHeader>

                   <CardContent className="p-0">
                       <Tabs defaultValue="all">
                           <div className="border-b px-4">
                               <TabsList className="w-full justify-start h-12 bg-transparent p-0 mb-[-1px]">
                                   <TabsTrigger
                                       value="all"
                                       className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-12 px-4"
                                   >
                                       All
                                   </TabsTrigger>
                                   <TabsTrigger
                                       value="unread"
                                       className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-12 px-4"
                                   >
                                       Unread
                                   </TabsTrigger>
                                   <TabsTrigger
                                       value="bids"
                                       className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-12 px-4"
                                   >
                                       Bids
                                   </TabsTrigger>
                               </TabsList>
                           </div>

                           {selectedNotifications.length > 0 && (
                               <div className="flex items-center justify-between border-b p-4 bg-muted/30">
                                   <div className="flex items-center">
                                       <Checkbox
                                           checked={selectedNotifications.length === notifications.length}
                                           onCheckedChange={() => toggleSelectAll(notifications)}
                                           aria-label="Select all notifications"
                                           className="mr-2"
                                       />
                                       <span className="text-sm font-medium">{selectedNotifications.length} selected</span>
                                   </div>
                                   <div className="flex gap-2">
                                       <Button variant="outline" size="sm" onClick={() => markAsRead(selectedNotifications)}>
                                           <Check className="mr-2 h-4 w-4" />
                                           Mark as read
                                       </Button>
                                       <Button
                                           variant="outline"
                                           size="sm"
                                           className="text-destructive hover:text-destructive"
                                           onClick={() => deleteNotifications(selectedNotifications)}
                                       >
                                           <Trash2 className="mr-2 h-4 w-4" />
                                           Delete
                                       </Button>
                                   </div>
                               </div>
                           )}

                           <TabsContent value="all" className="p-0 m-0">
                               {renderNotificationList(filterNotifications("all", notifications))}
                           </TabsContent>

                           <TabsContent value="unread" className="p-0 m-0">
                               {renderNotificationList(filterNotifications("unread", notifications))}
                           </TabsContent>

                           <TabsContent value="bids" className="p-0 m-0">
                               {renderNotificationList(filterNotifications("bids", notifications))}
                           </TabsContent>
                       </Tabs>

                       {unreadCount > 0 && (
                           <div className="flex justify-center border-t p-4">
                               <Button variant="outline" onClick={markAllAsRead}>
                                   Mark all as read
                               </Button>
                           </div>
                       )}
                   </CardContent>
               </Card>
           </div>
       )
   }