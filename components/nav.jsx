"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { Menu, ShoppingCart, Package, Heart, LayoutDashboard, Users, Settings, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useCart } from "./cart-provider"
import { SignInDialog } from "./sign-in-dialogue"
import { SignUpDialog } from "./sign-up-dialogue"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { NotificationPopover } from "./notification-popover"
import { ThemeToggle } from "./theme-toogle"

export function NavBar() {
  const [showSignIn, setShowSignIn] = useState(false)
  const [showSignUp, setShowSignUp] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState(null)
  const [isScrolled, setIsScrolled] = useState(false)
  const router = useRouter()
  const { cartCount } = useCart()
  const pathname = usePathname()

  useEffect(() => {
    // Simulate authentication (replace with real auth logic)
    const checkAuth = async () => {
      setIsAuthenticated(true)
      setUser({
        name: "John Doe",
        email: "john@example.com",
        image: "/placeholder.svg",
        role: "merchant",
      })
    }
    checkAuth()
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <header
      className={`fixed top-0 z-50 w-full border-b bg-background/95 backdrop-blur ${
        isScrolled ? "shadow-md" : ""
      } transition-all`}
    >
      <div className="py-4 px-[20px ]">
        <div className="flex items-center justify-between">
          {/* Left Section: Mobile Menu and Logo */}
          <div className="flex items-center gap-4">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[300px]">
                <nav className="flex flex-col gap-4">
                  <Link href="/" className="text-lg font-bold">
                    QuickCart
                  </Link>
                  <Link
                    href="/products"
                    className={`text-sm transition-colors px-3 py-2 rounded-lg ${
                      pathname === "/products"
                        ? "bg-[#A1887F] text-primary-foreground"
                        : "hover:bg-[#A1887F]/10 hover:text-primary"
                    }`}
                  >
                    Products
                  </Link>
                  <Link
                    href="/auctions"
                    className={`text-sm transition-colors px-3 py-2 rounded-lg ${
                      pathname === "/auctions"
                        ? "bg-[#A1887F] text-primary-foreground"
                        : "hover:bg-[#A1887F]/10 hover:text-primary"
                    }`}
                  >
                    Auctions
                  </Link>
                  <Link
                    href="/categories"
                    className={`text-sm transition-colors px-3 py-2 rounded-lg ${
                      pathname === "/categories"
                        ? "bg-[#A1887F] text-primary-foreground"
                        : "hover:bg-[#A1887F]/10 hover:text-primary"
                    }`}
                  >
                    Categories
                  </Link>
                  <Link
                    href="/about"
                    className={`text-sm transition-colors px-3 py-2 rounded-lg ${
                      pathname === "/about"
                        ? "bg-[#A1887F] text-primary-foreground"
                        : "hover:bg-[#A1887F]/10 hover:text-primary"
                    }`}
                  >
                    About
                  </Link>
                  <Link
                    href="/contact"
                    className={`text-sm transition-colors px-3 py-2 rounded-lg ${
                      pathname === "/contact"
                        ? "bg-[#A1887F] text-primary-foreground"
                        : "hover:bg-[#A1887F]/10 hover:text-primary"
                    }`}
                  >
                    Contact
                  </Link>
                </nav>
              </SheetContent>
            </Sheet>
            <Link href="/" className="text-xl font-bold">
              QuickCart
            </Link>
          </div>

          {/* Center Section: Navigation Links */}
          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="/products"
              className={`text-sm font-medium transition-colors px-3 py-2 rounded-lg ${
                pathname === "/products"
                  ? "bg-[#A1887F] text-primary-foreground"
                  : "hover:bg-[#A1887F]/10 hover:text-primary"
              }`}
            >
              Products
            </Link>
            <Link
              href="/auctions"
              className={`text-sm font-medium transition-colors px-3 py-2 rounded-lg ${
                pathname === "/auctions"
                  ? "bg-[#A1887F] text-primary-foreground"
                  : "hover:bg-[#A1887F]/10 hover:text-primary"
              }`}
            >
              Auctions
            </Link>
            <Link
              href="/categories"
              className={`text-sm font-medium transition-colors px-3 py-2 rounded-lg ${
                pathname === "/categories"
                  ? "bg-[#A1887F] text-primary-foreground"
                  : "hover:bg-[#A1887F]/10 hover:text-primary"
              }`}
            >
              Categories
            </Link>
            <Link
              href="/about"
              className={`text-sm font-medium transition-colors px-3 py-2 rounded-lg ${
                pathname === "/about"
                  ? "bg-[#A1887F] text-primary-foreground"
                  : "hover:bg-[#A1887F]/10 hover:text-primary"
              }`}
            >
              About
            </Link>
            <Link
              href="/contact"
              className={`text-sm font-medium transition-colors px-3 py-2 rounded-lg ${
                pathname === "/contact"
                  ? "bg-[#A1887F] text-primary-foreground"
                  : "hover:bg-[#A1887F]/10 hover:text-primary"
              }`}
            >
              Contact
            </Link>
          </nav>

          {/* Right Section: Cart & Authentication */}
          <div className="flex items-center gap-2">
            {/* Cart Button */}
            <Link href="/cart">
              <Button variant="ghost" size="icon" className="relative">
                <ShoppingCart className="h-5 w-5" />
                {cartCount > 0 && (
                  <span className="absolute -right-1 -top-1 h-4 w-4 rounded-full bg-primary text-xs text-primary-foreground flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Button>
            </Link>
            <NotificationPopover />
            <ThemeToggle />

            {/* Authentication Section */}
            <div className="flex items-center space-x-4 relative">
              {isAuthenticated && user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.image} alt={user.name} />
                        <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    className="w-56"
                    align="end"
                    forceMount
                    style={{ top: isScrolled ? "50px" : "auto" }}
                  >
                    <div className="flex items-center justify-start gap-2 p-2">
                      <div className="flex flex-col space-y-1 leading-none">
                        <p className="font-medium">{user.name}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <Package className="mr-2 h-4 w-4" />
                      <span>Orders</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Heart className="mr-2 h-4 w-4" />
                      <span>Wishlist</span>
                    </DropdownMenuItem>
                    {user.role === "merchant" && (
                      <>
                        <DropdownMenuItem>
                          <LayoutDashboard className="mr-2 h-4 w-4" />
                          <span>Dashboard</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Package className="mr-2 h-4 w-4" />
                          <span>My Products</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Users className="mr-2 h-4 w-4" />
                          <span>My Customers</span>
                        </DropdownMenuItem>
                      </>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <>
                  <Button variant="ghost" onClick={() => setShowSignIn(true)}>
                    Log in
                  </Button>
                  <Button onClick={() => setShowSignUp(true)}>Sign up</Button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Authentication Dialogs */}
      <SignInDialog open={showSignIn} onOpenChange={setShowSignIn} />
      <SignUpDialog open={showSignUp} onOpenChange={setShowSignUp} />
    </header>
  )
}

