import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Profile Setting - Marketplace Profile",
  description: "Profile Setting of the marketplace",
}

export default function ProfileLayout({ children }: { children: ReactNode }) {
  return (
    <section>
      {/* You can wrap with sidebar/header if needed */}
      {children}
    </section>
  );
}


