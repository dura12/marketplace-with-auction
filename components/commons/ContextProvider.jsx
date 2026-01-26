
"use client";

import { SessionProvider, useSession } from "next-auth/react";
import { CartProvider } from "@/components/cart-provider";
import { Toaster } from "@/components/ui/toaster";

function InnerProviders({ children }) {
  const { data: session } = useSession();

  return (
    <CartProvider userEmail={session?.user?.email}>
      <Toaster />
      {children}
    </CartProvider>
  );
}

export default function ContextProvider({ children }) {
  return (
    <SessionProvider>
      <InnerProviders>{children}</InnerProviders>
    </SessionProvider>
  );
}
