import type { Metadata } from "next";
import { Sidebar } from "@/components/sidebar";
import { CategoryPageClient } from "./page-client";

export const metadata: Metadata = {
  title: "Category Management - Marketplace Admin",
  description: "Manage categories in the marketplace",
};

export default function CategoriesPage() {
  return (
    <div className="flex-1 md:ml-[calc(var(--sidebar-width)-40px)] md:-mt-12 -mt-8">
      <CategoryPageClient />
    </div>
  );
}
