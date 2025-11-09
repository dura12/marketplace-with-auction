"use client";

import { useState, useEffect, SetStateAction } from "react";
import { Search } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CategoryTable } from "@/components/categories/category-table";
import { CreateCategoryDialog } from "@/components/categories/create-category-dialog";
import { CategoryPagination } from "@/components/categories/category-pagination";
import { useToast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/toaster";
import { Sidebar } from "@/components/sidebar";
import { useSession } from "next-auth/react";
import { Category } from "@/utils/typeDefinitions";

export function CategoryPageClient() {
  const { data: session, status } = useSession();
  const [selectedTab, setSelectedTab] = useState("active");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCreator, setSelectedCreator] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([]);
  const [totalCategories, setTotalCategories] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [categoryCreators, setCategoryCreators] = useState([
    { id: "all", name: "All Creators" },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const itemsPerPage = 10;

  useEffect(() => {
    if (status !== "authenticated") return;
    const fetchCategories = async () => {
      setIsLoadingData(true);
      try {
        const response = await fetch("/api/manageCategory");
        if (!response.ok) throw new Error("Failed to fetch categories");
        const data = await response.json();
        setAllCategories(data);
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch categories.",
        });
      } finally {
        setIsLoadingData(false);
      }
    };
    fetchCategories();
  }, [status, toast]);

  useEffect(() => {
    const uniqueCreators = [
      ...new Set(allCategories.map((cat) => cat.createdBy)),
    ];
    setCategoryCreators([
      { id: "all", name: "All Creators" },
      ...uniqueCreators.map((email) => ({ id: email, name: email })),
    ]);

    let filtered = allCategories;
    filtered = filtered.filter(
      (cat) => (cat.isDeleted || false) === (selectedTab === "deleted")
    );

    if (searchQuery) {
      filtered = filtered.filter((cat) => {
        const name = cat.name?.toLowerCase() || "";
        const description = cat.description?.toLowerCase() || "";
        const query = searchQuery.toLowerCase();
        return name.includes(query) || description.includes(query);
      });
    }

    if (selectedCreator !== "all") {
      filtered = filtered.filter((cat) => cat.createdBy === selectedCreator);
    }

    setTotalCategories(filtered.length);
    const newTotalPages = Math.max(
      1,
      Math.ceil(filtered.length / itemsPerPage)
    );
    setTotalPages(newTotalPages);

    if (currentPage > newTotalPages) {
      setCurrentPage(1);
    }

    const startIndex = (currentPage - 1) * itemsPerPage;
    setFilteredCategories(
      filtered.slice(startIndex, startIndex + itemsPerPage)
    );
  }, [allCategories, selectedTab, searchQuery, selectedCreator, currentPage]);

  const handleSearch = () => {
    setCurrentPage(1);
  };

  const handleTabChange = (value: SetStateAction<string>) => {
    setSelectedTab(value);
    setCurrentPage(1);
  };

  const handleCreatorChange = (value: SetStateAction<string>) => {
    setSelectedCreator(value);
    setCurrentPage(1);
  };

  const handleCategoryAction = async (
    type: string,
    categoryId: string,
    data?: any
  ) => {
    setIsLoading(true);
    try {
      let message = "";
      let response;

      switch (type) {
        case "delete":
        case "permanent-delete":
          response = await fetch(`/api/manageCategory`, {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ _id: categoryId }),
          });
          message =
            type === "delete"
              ? "Category moved to trash"
              : "Category deleted successfully";
          break;

        case "restore":
          response = await fetch(`/api/manageCategory`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ _id: categoryId, isDeleted: false }),
          });
          message = "Category restored successfully";
          break;

        case "edit":
          response = await fetch(`/api/manageCategory`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ _id: categoryId, ...data }),
          });
          message = "Category updated successfully";
          break;

        default:
          throw new Error("Unknown action type");
      }

      if (!response.ok) throw new Error(await response.text());

      toast({ title: "Success", description: message });

      const updatedResponse = await fetch("/api/manageCategory");
      if (!updatedResponse.ok) throw new Error("Failed to refetch categories");
      setAllCategories(await updatedResponse.json());
    } catch (error: any) {
      const errorMessage = error.message.includes("{")
        ? JSON.parse(error.message).error
        : error.message;
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to ${type} category: ${
          errorMessage || "An unexpected error occurred"
        }`,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCategoryAdded = async () => {
    try {
      const response = await fetch("/api/manageCategory");
      if (!response.ok) throw new Error("Failed to fetch categories");
      setAllCategories(await response.json());
      toast({
        title: "Success",
        description: "Category created successfully",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to refresh categories.",
      });
    }
  };

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  if (!session) {
    return <div>Please sign in to manage categories.</div>;
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Sidebar />
      <main className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between">
          <h1 className="text-xl md:text-3xl font-bold tracking-tight">
            Category Management
          </h1>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              <span className="hidden md:inline">Total </span>Categories:{" "}
              {totalCategories}
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-1 items-center gap-2">
            <div className="relative flex-1 md:max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search categories..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
            </div>
            <Button variant="outline" size="sm" onClick={handleSearch}>
              Search
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Select value={selectedCreator} onValueChange={handleCreatorChange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Creator" />
              </SelectTrigger>
              <SelectContent>
                {categoryCreators.map((creator) => (
                  <SelectItem key={creator.id} value={creator.id}>
                    <span className="sm:hidden">
                      {creator.name.split(" ")[0]}
                    </span>
                    <span className="hidden sm:inline">{creator.name}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedTab} onValueChange={handleTabChange}>
              <SelectTrigger className="w-[140px] md:w-[180px]">
                <SelectValue placeholder="View" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">
                  <span className="sm:hidden">Active</span>
                  <span className="hidden sm:inline">Active Categories</span>
                </SelectItem>
                <SelectItem value="deleted">
                  <span className="sm:hidden">Deleted</span>
                  <span className="hidden sm:inline">Deleted Categories</span>
                </SelectItem>
              </SelectContent>
            </Select>
            <CreateCategoryDialog
              userSession={session}
              onCategoryAdded={handleCategoryAdded}
            />
          </div>
        </div>

        <Card>
          <CardHeader className="p-2 md:p-4">
            <CardTitle>
              {selectedTab === "active"
                ? "All Categories"
                : "Deleted Categories"}
            </CardTitle>
            <CardDescription className="hidden md:block">
              {selectedTab === "active"
                ? "Manage all categories in the marketplace system"
                : "View and restore deleted categories"}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <CategoryTable
              categories={filteredCategories}
              isLoading={isLoadingData}
              userSession={session}
              onCategoryAction={handleCategoryAction}
              selectedTab={selectedTab}
            />
          </CardContent>
        </Card>

        {totalPages > 1 && (
          <CategoryPagination
            totalPages={totalPages}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
          />
        )}
        <Toaster />
      </main>
    </div>
  );
}
