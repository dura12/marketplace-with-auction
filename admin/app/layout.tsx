"use client";

import type React from "react";
import "./globals.css";
import { SidebarProvider } from "@/components/sidebar-provider";
import LayoutClient from "@/components/layout-client";
import { ThemeProvider } from "@/components/theme-provider";
import ContextProvider from "@/components/context-provider";
import { usePathname } from "next/navigation";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const isAuthPage = pathname === "/signin" || pathname === "/forgot-password";

  return (
    <html lang="en" suppressHydrationWarning>
      <body className="default-font">
        <ContextProvider>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            {isAuthPage ? (
              <>{children}</>
            ) : (
              <SidebarProvider>
                <LayoutClient>{children}</LayoutClient>
              </SidebarProvider>
            )}
          </ThemeProvider>
        </ContextProvider>
      </body>
    </html>
  );
}
