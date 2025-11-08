"use client";

import { useState, useEffect } from "react";
import type React from "react";
import { Search, CheckCircle, XCircle, Plus } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sidebar } from "@/components/sidebar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AdminDetailsDialog } from "@/components/admins/admin-details-dialog";
import { CreateAdminDialog } from "@/components/admins/create-admin-dialog";
import { PaginationControls } from "@/components/auctions/pagination-controls";
import { Toaster } from "@/components/toaster";

// Define admin type
interface Admin {
  _id: string;
  fullname: string;
  email: string;
  phone: string;
  isBanned: boolean;
  createdAt: string;
}

// Define component state types
export default function AdminsPageClient() {
  const [selectedTab, setSelectedTab] = useState<"active" | "deleted">(
    "active"
  );
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "banned">(
    "all"
  );
  const [selectedAdmin, setSelectedAdmin] = useState<Admin | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState<boolean>(false);
  const [activeAdmins, setActiveAdmins] = useState<Admin[]>([]);
  const [deletedAdmins, setDeletedAdmins] = useState<Admin[]>([]);

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    try {
      const response = await fetch("/api/manageAdmins");
      const data = await response.json();

      if (!Array.isArray(data)) throw new Error("Invalid data format");

      setActiveAdmins(data.filter((admin) => !admin.isDeleted));
      setDeletedAdmins(data.filter((admin) => admin.isDeleted));
    } catch (error) {
      console.error("Error fetching admins:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load admins. Please try again.",
      });
    }
  };

  const handleCreateAdmin = async (data: any) => {
    try {
      const response = await fetch("/api/manageAdmins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok) {
        toast({
          title: "Success",
          description: `Admin ${data.fullname} created successfully!`,
        });
        setIsCreateDialogOpen(false);
        fetchAdmins(); // Refresh list
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: result.message || "Failed to create admin.",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Something went wrong. Please try again.",
      });
      console.error("Error creating admin:", error);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
  };

  const filteredAdmins = (
    selectedTab === "active" ? activeAdmins : deletedAdmins
  ).filter((admin) => {
    if (
      searchQuery &&
      !admin.fullname.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !admin.email.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }
    if (statusFilter === "banned" && !admin.isBanned) return false;
    if (statusFilter === "active" && admin.isBanned) return false;
    return true;
  });

  return (
    <div className="flex min-h-screen flex-col">
      <Sidebar />
      <div className="flex-1 md:ml-[calc(var(--sidebar-width)-40px)] md:-mt-12 -mt-8">
        <main className="flex-1 space-y-4 p-4 md:p-8 pt-6">
          <div className="flex items-center justify-between">
            <h1 className="text-xl md:text-3xl font-bold tracking-tight">
              Admin Management
            </h1>
            <div className="flex items-center gap-2 -mr-8 lg:mr-0">
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4 " />
                Create Admin
              </Button>
            </div>
          </div>

          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <form
              onSubmit={handleSearch}
              className="flex flex-1 items-center gap-2"
            >
              <div className="relative flex-1 md:max-w-sm">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search admins..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button type="submit" variant="secondary" size="sm">
                Search
              </Button>
            </form>
          </div>

          <Tabs
            value={selectedTab}
            onValueChange={(value) =>
              setSelectedTab(value as "active" | "deleted")
            }
          >
            <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
              <Select
                value={statusFilter}
                onValueChange={(value) =>
                  setStatusFilter(value as "active" | "all" | "banned")
                }
              >
                <SelectTrigger className="w-[120px] lg:w-[160px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    <span className="sm:hidden">All</span>
                    <span className="hidden sm:inline">All Admins</span>
                  </SelectItem>
                  <SelectItem value="active">
                    <span className="sm:hidden">Active</span>
                    <span className="hidden sm:inline">Active Admins</span>
                  </SelectItem>
                  <SelectItem value="banned">
                    <span className="sm:hidden">Banned</span>
                    <span className="hidden sm:inline">Banned Admins</span>
                  </SelectItem>
                </SelectContent>
              </Select>

              <TabsList>
                <TabsTrigger value="active">
                  <span className="sm:hidden">Active</span>
                  <span className="hidden sm:inline">Active Admins</span>
                </TabsTrigger>
                <TabsTrigger value="deleted">
                  <span className="sm:hidden">Deleted</span>
                  <span className="hidden sm:inline">Deleted Admins</span>
                </TabsTrigger>
              </TabsList>
            </div>
            <Card className="mt-4">
              <CardHeader className="p-4">
                <CardTitle>
                  {selectedTab === "active"
                    ? "Active Admins"
                    : "Deleted Admins"}
                </CardTitle>
                <CardDescription>
                  {selectedTab === "active"
                    ? "Manage active administrators in the system"
                    : "View and restore deleted administrators"}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead className="hidden md:table-cell">
                        Email
                      </TableHead>
                      <TableHead className="hidden md:table-cell">
                        Phone
                      </TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAdmins.map((admin) => (
                      <TableRow
                        key={admin._id}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => setSelectedAdmin(admin)}
                      >
                        <TableCell className="font-medium">
                          {admin.fullname}
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {admin.email}
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {admin.phone}
                        </TableCell>
                        <TableCell>
                          {admin.isBanned ? (
                            <Badge
                              variant="destructive"
                              className="flex w-fit items-center gap-1"
                            >
                              <XCircle className="h-3 w-3" />
                              Banned
                            </Badge>
                          ) : (
                            <Badge
                              variant="outline"
                              className="flex w-fit items-center gap-1 bg-green-50 text-green-700 border-green-200"
                            >
                              <CheckCircle className="h-3 w-3" />
                              Active
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {new Date(admin.createdAt).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))}
                    {filteredAdmins.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} className="h-24 text-center">
                          No admins found.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </Tabs>

          {filteredAdmins.length > 0 && (
            <PaginationControls
              totalPages={Math.ceil(filteredAdmins.length / 15)}
              currentPage={1}
            />
          )}
        </main>
      </div>

      {selectedAdmin && (
        <AdminDetailsDialog
          admin={selectedAdmin}
          open={!!selectedAdmin}
          onOpenChange={(open) => {
            if (!open) {
              // Close the dialog and refresh the admin list
              setSelectedAdmin(null);
              fetchAdmins(); // Refresh the list of admins after closing the dialog
            }
          } } onAction={function (type: "ban" | "unban" | "delete" | "restore" | "permanent-delete", adminId: string): void {
            throw new Error("Function not implemented.");
          } }        />
      )}

      <CreateAdminDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSubmit={handleCreateAdmin}
      />
      <Toaster />
    </div>
  );
}
