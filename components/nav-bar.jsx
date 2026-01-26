"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { NotificationPopover } from "@/components/notification-popover"
import { UserNav } from "@/components/user-nav"
import { ThemeToggle } from "@/components/theme-toggle"
import {
  TrendingUp,
  ChevronDown,
  Home,
  ShoppingCart,
  Gavel,
  Grid3X3,
  Info,
  Mail,
  Package,
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { cn } from "@/libs/utils"
import { useSession } from "next-auth/react"
import { SignInDialog } from "./sign-in-dialogue"
import { SignUpDialog } from "./sign-up-dialogue"
import { useCart } from "@/components/cart-provider"

export function Navbar() {
  const [showSignIn, setShowSignIn] = useState(false)
  const [showSignUp, setShowSignUp] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [categories, setCategories] = useState([])
  const { data: session, status } = useSession()
  const pathname = usePathname()
  const { cart } = useCart()
  const cartItemCount = cart.merchants.reduce((total, merchant) => {
    return total + merchant.products.reduce((sum, product) => sum + product.quantity, 0)
  }, 0)

  // Handle scroll effect for header styling
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  
  const navItems = [
    { name: "Home", href: "/", icon: Home },
    { name: "Product", href: "/products", icon: Package },
    {
      name: "Auctions",
      href: "/auctions",
      icon: Gavel,
      dropdown: true,
      items: [
        { name: "All Auctions", href: "/auctions", icon: Gavel },
        { name: "Ending Soon", href: "/auctions/ending-soon", icon: TrendingUp },
      ],
    },
    { name: "Categories", href: "/categories", icon: Grid3X3 },
    { name: "About", href: "/about", icon: Info },
    { name: "Contact", href: "/contact", icon: Mail },
  ]

  return (
    <>
      <header
        className={cn(
          "fixed top-0 z-50 w-full transition-all duration-300",
          scrolled ? "border-b bg-background/95 backdrop-blur-lg shadow-sm" : "bg-transparent backdrop-blur-sm",
        )}
      >
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center flex-shrink-0">
            {/* <Link href="/" className="flex items-center space-x-2 group"> */}
              <div className="h-9 w-9 rounded-full gradient-bg flex items-center justify-center transition-transform group-hover:scale-110 duration-300">
                <span className="text-white font-bold text-lg">B</span>
              </div>
              <span className="text-xl font-bold bg-clip-text text-primary  lg:block hidden">
                Bahirmart
              </span>
            {/* </Link> */}
          </div>
          <div className="hidden md:flex flex-grow items-center justify-center mx-4">
            <nav className="flex items-center space-x-1 text-sm font-medium">
              {navItems.map((item) =>
                item.dropdown ? (
                  <DropdownMenu key={item.name}>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        className={cn(
                          "px-3 py-2 h-auto flex items-center gap-1 rounded-md transition-colors hover:bg-primary/10 hover:text-primary",
                          pathname.startsWith(item.href) && "text-primary font-semibold",
                          "lg:flex-row lg:space-x-1 md:flex-col md:space-y-1 md:space-x-0 md:text-xs",
                        )}
                      >
                        <item.icon className="h-5 w-5" />
                        <span className="lg:block md:hidden md:group-hover:block">{item.name}</span>
                        <ChevronDown className="h-4 w-4 opacity-70 lg:block md:hidden" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="center" className="w-[220px] p-2">
                      {item.items.map((subItem) => (
                        <DropdownMenuItem key={subItem.name} asChild>
                          <Link 
                            href={subItem.href} 
                            className="flex items-center gap-2 cursor-pointer"
                          >
                            {subItem.icon && <subItem.icon className="h-4 w-4" />}
                            <span>{subItem.name}</span>
                          </Link>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "px-3 py-2 rounded-md transition-colors hover:bg-primary/10 hover:text-primary flex items-center gap-1",
                      pathname === item.href && "text-primary font-semibold",
                      "lg:flex-row lg:space-x-1 md:flex-col md:space-y-1 md:space-x-0 md:text-xs",
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                    <span className="lg:block md:hidden md:group-hover:block">{item.name}</span>
                  </Link>
                ),
              )}
            </nav>
          </div>

          <div className="flex items-center justify-end flex-shrink-0 gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full hover:bg-primary/10 hover:text-primary transition-colors relative"
              asChild
            >
              <Link href="/cart">
                <ShoppingCart className="h-5 w-5" />
                {status === "authenticated" && (
                  <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full h-4 w-4 flex items-center justify-center">
                    {cartItemCount}
                  </span>
                )}
                <span className="sr-only">Cart</span>
              </Link>
            </Button>

            <NotificationPopover />
            <ThemeToggle />

            <div className="flex items-center space-x-2">
              {status === "authenticated" ? (
                <UserNav />
              ) : (
                <>
                  <Button
                    variant="ghost"
                    onClick={() => setShowSignIn(true)}
                    disabled={status === "loading"}
                    className="lg:block"
                  >
                    Log in
                  </Button>
                  <Button onClick={() => setShowSignUp(true)} disabled={status === "loading"}>
                    Sign up
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="fixed bottom-0 left-0 z-50 w-screen h-16 bg-background border-t md:hidden overflow-x-hidden">
        <div className="flex h-full justify-evenly items-center">
          {navItems.slice(0,5).map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "inline-flex flex-col items-center justify-center hover:bg-muted",
                pathname === item.href && "text-primary",
              )}
            >
              <item.icon className="w-6 h-6 mb-1" />
              <span className="text-xs">{item.name}</span>
            </Link>
          ))}
        </div>
      </div>

      <SignInDialog
        open={showSignIn}
        onOpenChange={setShowSignIn}
        onSignUp={() => {
          setShowSignIn(false)
          setShowSignUp(true)
        }}
      />
      <SignUpDialog
        open={showSignUp}
        onOpenChange={setShowSignUp}
        onSignIn={() => {
          setShowSignUp(false)
          setShowSignIn(true)
        }}
      />
    </>
  )
}