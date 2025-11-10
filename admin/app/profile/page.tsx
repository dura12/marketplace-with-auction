"use client";

import { useEffect, useState } from "react";
import { getSession } from "next-auth/react";
import { Edit, Key } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Shield } from "lucide-react";
import { UpdateProfileDialog } from "@/components/profile/update-profile-dialogue";
import { ChangePasswordDialog } from "@/components/profile/change-password-dialogue";
import { ProfileHeader } from "@/components/profile/profile-header";
import { AccountInfoCard } from "@/components/profile/account-info-card";
import { SuperAdminCard } from "@/components/profile/super-admin-card";
import { Sidebar } from "@/components/sidebar";
import { useToast } from "@/components/ui/use-toast";

// Mock admin profiles
const mockProfiles = {
  admin: {
    id: "admin_123",
    email: "admin@example.com",
    fullname: "John Admin",
    phone: "+1 (555) 123-4567",
    role: "admin",
    image: "https://i.pravatar.cc/300?img=68",
    isBanned: false,
    isDeleted: false,
    createdAt: "2023-01-15T09:30:00Z",
    updatedAt: "2023-04-10T14:45:00Z",
  },
  superAdmin: {
    id: "superadmin_456",
    email: "superadmin@example.com",
    fullname: "Sarah Super",
    phone: "+1 (555) 987-6543",
    role: "superAdmin",
    image: "https://i.pravatar.cc/300?img=48",
    createdAt: "2022-06-20T10:00:00Z",
    updatedAt: "2023-03-15T11:20:00Z",
  },
  bannedAdmin: {
    id: "admin_789",
    email: "banned@example.com",
    fullname: "Banned User",
    phone: "+1 (555) 555-5555",
    role: "admin",
    image: "https://i.pravatar.cc/300?img=60",
    isBanned: true,
    isDeleted: false,
    banReason: "Violation of platform policies",
    createdAt: "2023-02-10T08:15:00Z",
    updatedAt: "2023-05-01T16:30:00Z",
  },
  deletedAdmin: {
    id: "admin_101",
    email: "deleted@example.com",
    fullname: "Deleted User",
    phone: "+1 (555) 444-3333",
    role: "admin",
    image: null,
    isBanned: false,
    isDeleted: true,
    trashDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
    createdAt: "2023-03-05T13:45:00Z",
    updatedAt: "2023-05-10T09:20:00Z",
  },
};

export default function AdminProfilePage() {
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);

  const { toast } = useToast();

  // Demo API function to fetch admin profile
  const fetchAdminProfile = async () => {
    try {
      console.log("Fetching admin profile");

      const session = await getSession();
      const email = session?.user?.email;

      if (!email) {
        console.error("No session/email found.");
        return null;
      }

      const res = await fetch(
        `/api/profile?email=${encodeURIComponent(email)}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!res.ok) {
        throw new Error("Failed to fetch admin profile");
      }

      const data = await res.json();
      console.log("Admin profile data:", data);
      return data;
    } catch (error) {
      console.error("Error in fetchAdminProfile:", error);
      return null;
    }
  };

  useEffect(() => {
    const loadProfile = async () => {
      setIsLoading(true);
      try {
        const data = await fetchAdminProfile();
        setProfile(data);
      } catch (err: any) {
        console.error("Failed to fetch profile:", err);
        setError(err.message || "Failed to load profile");
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, []);

  const handleProfileUpdate = async (updatedProfile: any) => {
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedProfile),
      });

      if (!res.ok) {
        const errorData = await res.json();
        toast({
          title: "Update failed",
          description:
            errorData.error || "An error occurred while updating your profile.",
          variant: "destructive",
        });
        return;
      }

      const result = await res.json();
      setProfile({ ...profile, ...result.user });
      setUpdateDialogOpen(false);

      toast({
        title: "Profile updated",
        description: "Your profile was updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Unexpected error",
        description: "Something went wrong. Please try again later.",
        variant: "destructive",
      });
      console.error("Error updating profile:", error);
    }
  };

  // const handlePasswordChange = async (newPassword: string) => {
  //   try {
  //     const res = await fetch('/api/profile', {
  //       method: 'PUT',
  //       headers: {
  //         'Content-Type': 'application/json',
  //       },
  //       body: JSON.stringify({ password: newPassword }),
  //     });

  //     if (!res.ok) {
  //       const errorData = await res.json();
  //       toast({
  //         title: "Password update failed",
  //         description: errorData.error || "An error occurred while changing your password.",
  //         variant: "destructive",
  //       });
  //       return;
  //     }

  //     setPasswordDialogOpen(false);

  //     toast({
  //       title: "Password updated",
  //       description: "Your password has been changed successfully.",
  //     });
  //   } catch (error) {
  //     toast({
  //       title: "Unexpected error",
  //       description: "Something went wrong. Please try again later.",
  //       variant: "destructive",
  //     });
  //     console.error('Error changing password:', error);
  //   }
  // };

  if (isLoading) {
    return (
      <div className="flex min-h-screen w-full flex-col">
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
          <div className="flex items-center">
            <div className="flex-1">
              <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
              <p className="text-muted-foreground">
                View and manage your account
              </p>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div className="md:col-span-2 h-48 bg-muted animate-pulse rounded-md"></div>
            <div className="h-48 bg-muted animate-pulse rounded-md"></div>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen w-full flex-col">
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
          <Alert variant="destructive">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </main>
      </div>
    );
  }

  // Check if admin is banned or deleted
  const isAccountRestricted = profile.isBanned || profile.isDeleted;
  const restrictionReason = profile.isBanned ? "banned" : "deleted";
  const restrictionMessage = profile.isBanned
    ? `Your account has been banned. Reason: ${
        profile.banReason || "No reason provided"
      }`
    : "Your account has been marked for deletion and will be permanently removed in 30 days.";

  return (
    <div className="flex min-h-screen w-full flex-col">
      <Sidebar />
      <div className="flex-1 md:ml-[calc(var(--sidebar-width)-40px)] md:-mt-12 -mt-8">
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8 ">
          {isAccountRestricted && (
            <Alert variant="destructive" className="mb-4">
              <AlertTitle className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Account {restrictionReason}
              </AlertTitle>
              <AlertDescription className="mt-2">
                <p>{restrictionMessage}</p>
                <p className="mt-2">
                  Please contact support at{" "}
                  <a
                    href="mailto:support@example.com"
                    className="font-medium underline"
                  >
                    support@example.com
                  </a>{" "}
                  for assistance.
                </p>
              </AlertDescription>
            </Alert>
          )}

          <div className="flex items-center">
            <div className="flex-1">
              <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
              <p className="text-muted-foreground">
                View and manage your account
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="gap-1"
                onClick={() => setPasswordDialogOpen(true)}
                disabled={isAccountRestricted}
              >
                <Key className="h-4 w-4" />
                Change Password
              </Button>
              <Button
                variant="default"
                size="sm"
                className="gap-1"
                onClick={() => setUpdateDialogOpen(true)}
                disabled={isAccountRestricted}
              >
                <Edit className="h-4 w-4" />
                Edit Profile
              </Button>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <ProfileHeader
              profile={profile}
              isAccountRestricted={isAccountRestricted}
              restrictionReason={restrictionReason}
            />
            <AccountInfoCard profile={profile} />
          </div>

          {/* Additional section for Super Admin */}
          {profile.role === "superAdmin" && <SuperAdminCard />}
        </main>

        {/* Update Profile Dialog */}
        <UpdateProfileDialog
          open={updateDialogOpen}
          onOpenChange={setUpdateDialogOpen}
          profile={profile}
          onUpdate={handleProfileUpdate}
        />

        {/* Change Password Dialog */}
        <ChangePasswordDialog
          open={passwordDialogOpen}
          onOpenChange={setPasswordDialogOpen}
        />
      </div>
    </div>
  );
}
