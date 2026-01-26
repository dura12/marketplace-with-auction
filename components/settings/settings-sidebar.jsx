"use client";

import { useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/libs/utils";
import { Bell, CreditCard, Lock, Settings, User } from "lucide-react";

export function SettingsSidebar({ activeTab, setActiveTab }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Sync URL with active tab
  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab && ["profile", "security", "notifications", "merchant", "account"].includes(tab)) {
      setActiveTab(tab);
    }
  }, [searchParams, setActiveTab]);

  // Update URL when tab changes
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    router.push(`${pathname}?tab=${tab}`, { scroll: false });
  };

  const tabs = [
    {
      id: "profile",
      label: "Profile",
      icon: User,
    },
    {
      id: "security",
      label: "Security",
      icon: Lock,
    },
    {
      id: "notifications",
      label: "Notifications",
      icon: Bell,
    },
    {
      id: "merchant",
      label: "Merchant",
      icon: CreditCard,
    },
    {
      id: "account",
      label: "Account",
      icon: Settings,
    },
  ];

  return (
    <Card className="w-full md:w-64 p-4 h-fit sticky top-20">
      <div className="space-y-1">
        {tabs.map((tab) => (
          <Button
            key={tab.id}
            variant="ghost"
            className={cn("w-full justify-start", activeTab === tab.id && "bg-primary/10 text-primary")}
            onClick={() => handleTabChange(tab.id)}
          >
            <tab.icon className="mr-2 h-4 w-4" />
            {tab.label}
          </Button>
        ))}
      </div>
    </Card>
  );
}