import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Order Management - Marketplace Admin",
  description: "Manage and track all customer orders in the Marketplace Admin dashboard.",
};

export default function OrdersLayout({ children }: { children: ReactNode }) {
  return (
    <section>
      {/* You can wrap with sidebar/header if needed */}
      {children}
    </section>
  );
}
