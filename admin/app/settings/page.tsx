"use client";

import { Suspense, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import AboutSettingsPage from "@/components/setting/about/about-settings-page";
import { SettingsPageSkeleton } from "@/components/setting/settings-page-skeleton";
import { Sidebar } from "@/components/sidebar";

export default function Page() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  // Get role from session, normalize superadmin to superAdmin
  const sessionRole = (session?.user as { role?: string })?.role;
  const role = sessionRole === "superadmin" || sessionRole === "superAdmin" ? "superAdmin" : "admin";

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/signin");
    } else if (status === "authenticated" && role !== "superAdmin") {
      router.push("/");
    }
  }, [status, role, router]);

  if (status === "loading") {
    return <SettingsPageSkeleton />;
  }
  
  if (status === "unauthenticated" || role !== "superAdmin") {
    return null;
  }

  return (
    <Suspense fallback={<SettingsPageSkeleton />}>
      <Sidebar />
      <div className="flex-1 md:ml-[calc(var(--sidebar-width)-40px)] md:-mt-12 -mt-8">
        <AboutSettingsPage />
      </div>
    </Suspense>
  );
}
