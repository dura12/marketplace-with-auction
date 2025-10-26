import DashboardPage from "./dashboard/page";
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Dashboard - Marketplace Dashboard",
  description: "Dashboard of the marketplace",
}

export default function App() {
  return <DashboardPage />;
}
