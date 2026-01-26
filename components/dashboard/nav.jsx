// "use client"

// import Link from "next/link"
// import { usePathname } from "next/navigation"
// import { cn } from "@/libs/utils"
// import { BarChart3, Box, Clock, Gavel, Home, Package, Users, Menu } from "lucide-react"
// import { Button } from "@/components/ui/button"
// import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
// import { useState } from "react"

// const navigation = [
//   { name: "Overview", icon: BarChart3 },
//   { name: "Products", icon: Package },
//   { name: "Auctions", icon: Gavel },
//   { name: "Orders", icon: Box },
//   { name: "Customers", icon: Users },
// ];

// export function DashboardNav({ currentView, setCurrentView }) {
//   const pathname = usePathname()
//   const [open, setOpen] = useState(false)

//   const NavItems = () => (
//     <div className="w-64 h-auto fixed left-0 top-20 shadow-lg z-10">
//       <div className="flex h-14 items-center px-4 border-b">
      
//       </div>
//       <div className="flex-1 space-y-1 p-2">
//       {navigation.map((item) => {
//           const viewName = item.name.toLowerCase();
//           return (
//             <button
//               key={item.name}
//               onClick={() => setCurrentView(viewName)}
//               className={cn(
//                 "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors w-full text-left",
//                 currentView === viewName
//                   ? "bg-primary text-primary-foreground"
//                   : "hover:bg-primary/10 hover:text-primary"
//               )}
//             >
//               <item.icon className="h-4 w-4" />
//               {item.name}
//             </button>
//           );
//         })}
//         <Link
//           href="/"
//           className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-primary/10 hover:text-primary"
//         >
//           <Home className="h-4 w-4" />
//           Back to Store
//         </Link>
//       </div>
//     </div>
//   )

//   return (
//     <>
//       {/* Mobile Navigation */}
//       <Sheet open={open} onOpenChange={setOpen}>
//         <SheetTrigger asChild className="lg:hidden absolute left-4 top-24 z-50">
//           <Button variant="ghost" size="icon">
//             <Menu className="h-5 w-5" />
//             <span className="sr-only">Toggle navigation menu</span>
//           </Button>
//         </SheetTrigger>
//         <SheetContent side="left" className="w-[320px] p-0 mt-4 bg-white/90 backdrop-blur-lg h-full">
//           <NavItems />
//         </SheetContent>
//       </Sheet>

//       {/* Desktop Navigation */}
//       <div className="hidden lg:flex h-screen w-64 flex-col border-r bg-muted/30">
//         <NavItems />
//       </div>
//     </>
//   )
// }

"use client";

import Link from "next/link";
import { cn } from "@/libs/utils";
import { BarChart3, Box, Gavel, Home, Package, Users, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const navigation = [
  { name: "Overview", icon: BarChart3 },
  { name: "Products", icon: Package },
  { name: "Auctions", icon: Gavel },
  { name: "Orders", icon: Box },
  { name: "Customers", icon: Users },
];

export function DashboardNav({ currentView, setCurrentView }) {
  const NavItems = () => (
    <div className="flex h-full flex-col">
      
      <div className="flex-1 space-y-1 p-2">
        {navigation.map((item) => {
          const viewName = item.name.toLowerCase();
          return (
            <button
              key={item.name}
              onClick={() => setCurrentView(viewName)}
              className={cn(
                "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors w-full text-left",
                currentView === viewName
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-primary/10 hover:text-primary"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.name}
            </button>
          );
        })}
        <Link
          href="/"
          className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-primary/10 hover:text-primary"
        >
          <Home className="h-4 w-4" />
          Back to Store
        </Link>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Navigation - Hamburger Icon on Small Screens */}
      <Sheet>
        <SheetTrigger asChild className="lg:hidden fixed left-4 top-16 z-50 bg-background">
          <Button variant="ghost" size="icon">
            <Menu className="h-6 w-6 text-foreground" />
            <span className="sr-only">Toggle navigation menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[280px] p-0 bg-white/90 backdrop-blur-lg h-full z-50">
          <NavItems />
        </SheetContent>
      </Sheet>

      {/* Desktop Navigation - Visible on Large Screens */}
      <div className="hidden lg:block h-full">
        <NavItems />
      </div>
    </>
  );
}