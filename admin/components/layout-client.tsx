"use client";

import React, { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useSidebar } from "@/components/sidebar-provider";
import { NavBar } from "@/components/nav-bar";
import { Footer } from "./footer";
import { Toaster } from "@/components/toaster";
import AnnouncementBot from "@/components/ChatBot";
import { useProfile } from "@/components/userProfile";

interface LayoutClientProps {
  children: React.ReactNode;
}

export default function LayoutClient({ children }: LayoutClientProps) {
  const { isOpen } = useSidebar();
  const { data: session, status } = useSession();
  const router = useRouter();
  const { data: user, loading } = useProfile();

  // Redirect to signin if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/signin");
    }
  }, [status, router]);

  // Show loading state while checking authentication
  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render content if not authenticated
  if (status === "unauthenticated") {
    return null;
  }

  const shouldShowBot = user?.role === "superAdmin";

  return (
    <div className="flex min-h-screen flex-col">
      <NavBar />
      <div
        className={`flex min-h-[calc(100vh-4rem)] flex-col transition-all duration-300 ${
          isOpen ? "md:ml-0" : "ml-0"
        }`}
        style={{ marginTop: "4rem" }}
      >
        <main className="flex-1 p-4 md:p-6">{children}</main>
        <Footer />
      </div>
      {!loading && shouldShowBot && <AnnouncementBot />}
      <Toaster />
    </div>
  );
}
