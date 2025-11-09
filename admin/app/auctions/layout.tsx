import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Auction Management - Marketplace Admin",
  description: "Manage auctions in the marketplace",
}

export default function AuctionsLayout({ children }: { children: ReactNode }) {
  return (
    <section>
      {children}
    </section>
  );
}
