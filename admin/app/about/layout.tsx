import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "About Us - Marketplace About",
  description: "About section of the marketplace",
}

export default function OrdersLayout({ children }: { children: ReactNode }) {
  return (
    <section
      role="region"
      aria-label="Orders layout"
      className="min-h-screen bg-background"
    >
      {children}
    </section>
  );
}


