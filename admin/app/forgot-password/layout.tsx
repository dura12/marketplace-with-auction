import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Forgote Password - Marketplace Admin",
  description: "Handle password forgote.",
};

export default function OrdersLayout({ children }: { children: ReactNode }) {
  return (
    <section>
      {/* You can wrap with sidebar/header if needed */}
      {children}
    </section>
  );
}
