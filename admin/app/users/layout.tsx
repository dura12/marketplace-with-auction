import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "User Management - Marketplace Admin",
  description: "Manage all users in the Marketplace Admin dashboard.",
};

export default function UsersLayout({ children }: { children: ReactNode }) {
  return (
    <section>
      {children}
    </section>
  );
}
