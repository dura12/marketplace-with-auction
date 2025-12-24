"use client"

import { useState, useEffect } from "react"
import { Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Label } from "@/components/ui/label"

// const categories = [
//   { id: "art", name: "Art & Collectibles" },
//   { id: "electronics", name: "Electronics" },
//   { id: "fashion", name: "Fashion" },
//   { id: "home", name: "Home & Garden" },
//   { id: "jewelry", name: "Jewelry & Watches" },
//   { id: "music", name: "Music & Instruments" },
//   { id: "sports", name: "Sports & Outdoors" },
//   { id: "toys", name: "Toys & Hobbies" },
//   { id: "vehicles", name: "Vehicles" },
//   { id: "other", name: "Other" },
// ]

export function CategoryFilter({ onCategoryChange }) {
  const [selectedCategories, setSelectedCategories] = useState([])
  const [isOpen, setIsOpen] = useState(true)
  const [categories, setCategories] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchCategories() {
      try {
        setIsLoading(true)
        const response = await fetch('/api/categories', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        })

        if (!response.ok) {
          throw new Error('Failed to fetch categories')
        }

        const data = await response.json()
        const formattedCategories = data.map((category) => ({
          id: category._id,
          name: category.name,
        }))
        setCategories(formattedCategories)
      } catch (err) {
        setError(err.message)
      } finally {
        setIsLoading(false)
      }
    }

    fetchCategories()
  }, [])

  const toggleCategory = (categoryId) => {
    setSelectedCategories((prev) => {
      const newCategories = prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
      onCategoryChange(newCategories)
      return newCategories
    })
  }

  if (isLoading) {
    return <div>Loading categories...</div>
  }

  if (error) {
    return <div>Error: {error}</div>
  }

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="space-y-2">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-semibold text-primary">Categories</Label>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" size="sm" className="h-7 w-7 p-0 hover:text-primary">
            <span className="sr-only">{isOpen ? "Close" : "Open"}</span>
            <span className={`text-xs ${isOpen ? "rotate-180 transform" : ""}`}>▼</span>
          </Button>
        </CollapsibleTrigger>
      </div>
      <CollapsibleContent className="space-y-2">
        {categories.map((category) => (
          <div key={category.id} className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              className={`h-7 w-7 p-0 border-primary/20 ${
                selectedCategories.includes(category.id) ? "bg-primary text-primary-foreground" : ""
              }`}
              onClick={() => toggleCategory(category.id)}
            >
              {selectedCategories.includes(category.id) && <Check className="h-4 w-4" />}
            </Button>
            <Label
              htmlFor={`category-${category.id}`}
              className="text-sm cursor-pointer hover:text-primary transition-colors"
              onClick={() => toggleCategory(category.id)}
            >
              {category.name}
            </Label>
          </div>
        ))}
      </CollapsibleContent>
    </Collapsible>
  )
}
