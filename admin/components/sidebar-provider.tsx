"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { isBrowser } from "@/utils/environment"

type SidebarContextType = {
  isOpen: boolean
  toggleSidebar: () => void
  userRole: "admin" | "superAdmin"
  setUserRole: (role: "admin" | "superAdmin") => void
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined)

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(true)
  const [userRole, setUserRole] = useState<"admin" | "superAdmin">("superAdmin")

  useEffect(() => {
    const handleResize = () => {
      if (isBrowser && window.innerWidth < 768) {
        setIsOpen(false)
      } else if (isBrowser) {
        setIsOpen(true)
      }
    }

    // Set initial state based on window size
    if (isBrowser) {
      handleResize()
      window.addEventListener("resize", handleResize)
    }

    return () => {
      if (isBrowser) {
        window.removeEventListener("resize", handleResize)
      }
    }
  }, [])

  const toggleSidebar = () => {
    setIsOpen(!isOpen)
  }

  return (
    <SidebarContext.Provider value={{ isOpen, toggleSidebar, userRole, setUserRole }}>
      {children}
    </SidebarContext.Provider>
  )
}

export function useSidebar() {
  const context = useContext(SidebarContext)
  if (context === undefined) {
    throw new Error("useSidebar must be used within a SidebarProvider")
  }
  return context
}
