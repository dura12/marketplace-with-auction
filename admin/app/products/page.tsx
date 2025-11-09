import type { Metadata } from "next"
import ProductsPageClient from "./page-client"

export const metadata: Metadata = {
  title: "Product Management - Marketplace Admin",
  description: "Manage products in the marketplace",
}

export default function ProductsPage() {
  return <ProductsPageClient />
}

