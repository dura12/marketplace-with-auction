'use client'

import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  ShoppingBag,
  Tag,
  Gavel,
  Shield,
  Home,
  Package,
  Megaphone,
  Info
} from "lucide-react";

type NavItem = {
  href: string;
  label: string;
  icon: React.ElementType;
};

export function Sidebar() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  
  // Get role from session, normalize superadmin to superAdmin
  const sessionRole = (session?.user as { role?: string })?.role;
  const role = sessionRole === "superadmin" || sessionRole === "superAdmin" ? "superAdmin" : "admin";
  
  if (status === "loading" || status === "unauthenticated") return null;

  const navItems: (NavItem | false)[] = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/users", label: "User", icon: Users },
    role === "superAdmin" && { href: "/admins", label: "Admin", icon: Shield },
    { href: "/auctions", label: "Auction", icon: Gavel },
    { href: "/orders", label: "Order", icon: Package },
    { href: "/products", label: "Product", icon: ShoppingBag },
    { href: "/categories", label: "Category", icon: Tag },
    { href: "/ads", label: "Ads", icon: Megaphone },
    { href: "/about", label: "About Us", icon: Info },
  ];

  const filteredNavItems = navItems.filter(Boolean) as NavItem[];

  return (
    <div className="fixed top-0 left-0 z-30 h-screen w-[var(--sidebar-width)] border-r bg-background mt-16 hidden md:flex flex-col -ml-4">
      <div className="flex flex-col gap-2 p-4 flex-grow">
        <nav className="grid gap-1">
          {filteredNavItems.map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href} passHref>
              <Button
                variant={pathname === href ? "secondary" : "ghost"}
                className="justify-start w-full flex-grow text-left"
              >
                <Icon className="mr-2 h-4 w-4" />
                <span className="whitespace-nowrap">{label}</span>
              </Button>
            </Link>
          ))}
        </nav>

        <div className="mt-auto pt-4 border-t mb-10">
          <Link href="/" passHref>
            <Button variant="ghost" className="justify-start w-full flex-grow text-left">
              <Home className="mr-2 h-4 w-4" />
              <span className="whitespace-nowrap">Back Home</span>
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
