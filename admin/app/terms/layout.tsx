import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Terms and Services - Marketplace Terms and Services",
  description: "Terms and Services of the marketplace",
}

export default function TermsLayout({ children }: { children: ReactNode }) {
  return (
    <section>
      {/* You can wrap with sidebar/header if needed */}
      {children}
    </section>
  );
}


