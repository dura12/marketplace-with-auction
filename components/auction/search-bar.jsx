"use client"

import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { useState, useEffect } from "react"

export function SearchBar({ onSearch }) {
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    const timer = setTimeout(() => {
      onSearch(searchQuery)
    }, 500) // Debounce search by 500ms

    return () => clearTimeout(timer)
  }, [searchQuery, onSearch])

  return (
    <div className="flex gap-4 max-w-2xl w-full mx-auto">
      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
      <Input
        type="search"
        placeholder="Search auctions..."
        className="pl-8 border-primary/20 focus-visible:ring-primary"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
    </div>
  )
}

