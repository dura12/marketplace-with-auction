import type { Metadata } from "next"
import AdminsPageClient from "./page-client"

export const metadata: Metadata = {
  title: "Admin Management - Marketplace Admin",
  description: "Manage administrators in the marketplace",
}

export default function AdminsPage() {
  return <AdminsPageClient />
}

