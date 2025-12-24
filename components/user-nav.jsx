"use client";

import { useState, useEffect } from "react";
import { signOut } from "next-auth/react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CreditCard, LayoutDashboard, LogOut, User, Package } from "lucide-react";

export function UserNav() {
  // Helper function to generate initials from the user's name
  const getInitials = (name) => {
    if (!name) return "";
    const names = name.split(" ");
    const initials = names.map((n) => n[0]).join("");
    return initials.toUpperCase().slice(0, 2); // e.g., "John Doe" -> "JD"
  };
  const [avatarUrl, setAvatarUrl] = useState('/default-avatar.png');
  const [user, setUser] = useState("");

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch('/api/user');
        const data = await res.json();
        setUser(data);
        if (data.image) setAvatarUrl(data.image);
      } catch (error) {
        console.error('Error fetching avatar:', error);
      }
    };
    
    fetchUser();
  }, []);


  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full ">
          <Avatar className="h-8 w-8 border border-primary/20 rounded-full hover:bg-primary/10 hover:text-primary transition-colors">
            <AvatarImage
              src={avatarUrl}
              alt={user?.fullName || "User"}
              className="object-fit"
            />
            <AvatarFallback className=" text-primary">
              {getInitials(user?.name)}
              {getInitials(user?.fullName)}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">
              {user?.fullName }
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              {user?.email }
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link href="/profile" className="flex items-center gap-2">
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </Link>
          </DropdownMenuItem>
         
          {user?.role == 'merchant' && 
            <DropdownMenuItem asChild>
            <Link href="/dashboard" className="flex items-center gap-2">
              <LayoutDashboard className="mr-2 h-4 w-4" />
              <span>Dashboard</span>
            </Link>
          </DropdownMenuItem>
          }
          <DropdownMenuItem asChild>
            <Link href="/auctions/my_auctions" className="flex items-center gap-2">
              <CreditCard className="mr-2 h-4 w-4" />
              <span>My Auctions</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
              <Link href="/orders" className="flex items-center gap-2">
                <Package className="mr-2 h-4 w-4" />
                <span>My Orders</span>
              </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="cursor-pointer text-destructive hover:text-destructive/90"
          onClick={() => signOut({ callbackUrl: "/" })}
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}