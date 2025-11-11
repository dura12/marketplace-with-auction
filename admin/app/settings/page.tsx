"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AboutSettingsPage from "@/components/setting/about/about-settings-page";
import { SettingsPageSkeleton } from "@/components/setting/settings-page-skeleton";
import { Sidebar } from "@/components/sidebar";
import { getUserRole } from "@/utils/adminFunctions";

export default function Page() {
  const router = useRouter();
  const [role, setRole] = useState<"admin" | "superAdmin" | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkRole() {
      const r = await getUserRole();
      if (r !== "superAdmin") {
        router.push("/");
      } else {
        setRole(r);
        setLoading(false);
      }
    }
    checkRole();
  }, [router]);

  if (loading) return null; // Optional: replace with a spinner

  return (
    <Suspense fallback={<SettingsPageSkeleton />}>
      <Sidebar />
      <div className="flex-1 md:ml-[calc(var(--sidebar-width)-40px)] md:-mt-12 -mt-8">
        <AboutSettingsPage />
      </div>
    </Suspense>
  );
}
