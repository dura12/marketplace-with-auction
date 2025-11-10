import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Ads Management - Marketplace Ads",
  description: "Ads Management of the marketplace",
}

export default function AdsLayout({ children }: { children: ReactNode }) {
  return (
    <section>
      {children}
    </section>
  );
}


