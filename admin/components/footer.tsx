"use client";

import type React from "react";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowRight,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Github,
  Mail,
  MapPin,
  Phone,
  ChevronUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/toaster";

export function Footer() {
  const pathname = usePathname();
  const currentYear = new Date().getFullYear();
  const [email, setEmail] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);

  const isFullWidthPage =
    pathname === "/contact" ||
    pathname === "/privacy" ||
    pathname === "/terms" ||
    pathname === "/about" ||
    pathname.startsWith("/order/");

  // Determine gradient colors based on the current page
  const getGradientColors = () => {
    if (pathname === "/privacy") {
      return "from-teal-600 to-blue-600";
    } else if (pathname === "/terms") {
      return "from-indigo-600 to-purple-600";
    } else if (pathname === "/contact") {
      return "from-emerald-600 to-cyan-600";
    } else {
      return "from-slate-800 to-slate-900"; // Default
    }
  };

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Starting subscription process for email:", email);

    if (!email) {
      console.log("No email provided");
      toast({
        title: "Subscription failed",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log("Sending subscription request to API");
      const res = await fetch("/api/subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      console.log("API response received:", data);

      if (!res.ok) {
        console.error("Subscription failed with status:", res.status);
        toast({
          title: "Subscription failed",
          description: data.error || "Something went wrong.",
          variant: "destructive",
        });
        return;
      }

      console.log("Subscription successful");
      toast({
        title: data.message || "Thank you for subscribing!",
        description: `You'll receive our newsletter at ${email}`,
      });

      setEmail("");
      console.log("Email input cleared");
    } catch (err) {
      console.error("Error during subscription:", err);
      toast({
        title: "Error",
        description: "Something went wrong while subscribing.",
        variant: "destructive",
      });
    }
  };

  return (
    <footer
      className={`mt-auto border-t ${
        isFullWidthPage
          ? "ml-0"
          : "ml-0 md:ml-[calc(var(--sidebar-width)-20px)]"
      }`}
    >
      <Toaster />
      {/* Top section with gradient background */}
      <div
        className={`bg-gradient-to-r ${getGradientColors()} text-white py-8 sm:py-12`}
      >
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-xl sm:text-2xl font-bold mb-2">
                Stay Connected
              </h3>
              <p className="text-sm sm:text-base opacity-90 mb-4">
                Subscribe to our newsletter for the latest updates, news, and
                special offers.
              </p>
            </div>
            <div>
              <form
                onSubmit={handleSubscribe}
                className="flex flex-col sm:flex-row gap-3"
              >
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/60 focus-visible:ring-white/30"
                  required
                />
                <Button
                  type="submit"
                  variant="secondary"
                  className="whitespace-nowrap group"
                >
                  Subscribe
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Main footer content */}
      <div className="bg-slate-50 dark:bg-slate-900 py-8 sm:py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Company Info */}
            <div>
              <h4 className="font-bold text-lg mb-4">Marketplace Admin</h4>
              <p className="text-muted-foreground text-sm mb-4">
                Empowering businesses with advanced marketplace management
                solutions since 2024.
              </p>
              <div className="flex space-x-3">
                <a
                  href="https://twitter.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Twitter"
                >
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 rounded-full"
                  >
                    <Twitter className="h-4 w-4" />
                  </Button>
                </a>
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook"
                >
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 rounded-full"
                  >
                    <Facebook className="h-4 w-4" />
                  </Button>
                </a>
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                >
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 rounded-full"
                  >
                    <Instagram className="h-4 w-4" />
                  </Button>
                </a>
                <a
                  href="https://linkedin.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="LinkedIn"
                >
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 rounded-full"
                  >
                    <Linkedin className="h-4 w-4" />
                  </Button>
                </a>
                <a
                  href="https://github.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="GitHub"
                >
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 rounded-full"
                  >
                    <Github className="h-4 w-4" />
                  </Button>
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-bold text-lg mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/dashboard"
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Dashboard
                  </Link>
                </li>
                <li>
                  <Link
                    href="/orders"
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Orders
                  </Link>
                </li>
                <li>
                  <Link
                    href="/products"
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Products
                  </Link>
                </li>
                <li>
                  <Link
                    href="/users?role=customer"
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Customers
                  </Link>
                </li>
                <li>
                  <Link
                    href="/users?role=merchant"
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Merchants
                  </Link>
                </li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="font-bold text-lg mb-4">Legal</h4>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/terms"
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link
                    href="/privacy"
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link
                    href="/cookies"
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Cookie Policy
                  </Link>
                </li>
                <li>
                  <Link
                    href="/compliance"
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Compliance
                  </Link>
                </li>
              </ul>
            </div>

            {/* Contact Info */}
            <div>
              <h4 className="font-bold text-lg mb-4">Contact Us</h4>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <MapPin className="h-5 w-5 text-muted-foreground mr-2 mt-0.5" />
                  <span className="text-sm text-muted-foreground">
                    Belay Zeleke, Suite 500
                    <br />
                    Bahir Dar, CA 6000
                  </span>
                </li>
                <li className="flex items-center">
                  <Phone className="h-5 w-5 text-muted-foreground mr-2" />
                  <a
                    href="tel:+15551234567"
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    +251 975 40 9859
                  </a>
                </li>
                <li className="flex items-center">
                  <Mail className="h-5 w-5 text-muted-foreground mr-2" />
                  <a
                    href="mailto:hello@example.com"
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    support@bahirmart.com
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Mobile accordion for smaller screens */}
          <div className="md:hidden mt-8">
            <Button
              variant="ghost"
              className="w-full flex items-center justify-between"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              <span>{isExpanded ? "Show Less" : "Show More"}</span>
              <ChevronUp
                className={`h-4 w-4 transition-transform ${
                  isExpanded ? "" : "rotate-180"
                }`}
              />
            </Button>
          </div>

          <Separator className="my-8" />

          {/* Bottom section */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-sm text-muted-foreground order-2 sm:order-1">
              © {currentYear} Marketplace Admin. All rights reserved.
            </div>

            <div className="flex gap-6 order-1 sm:order-2">
              <Link
                href="/terms"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Terms
              </Link>
              <Link
                href="/privacy"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Privacy
              </Link>
              <Link
                href="/contact"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Contact
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
