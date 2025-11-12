import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Privacy Policy - Marketplace Privacy",
  description: "Privacy Policy of the marketplace",
}

export default function PrivacyLayout({ children }: { children: ReactNode }) {
  return (
    <section>
      {/* You can wrap with sidebar/header if needed */}
      {children}
    </section>
  );
}


