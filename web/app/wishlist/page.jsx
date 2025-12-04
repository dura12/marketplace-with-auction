"use client"

import { useState, useEffect } from "react"
import { Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ProductCard } from "@/components/product-card"

// Demo data
const demoWishlist = Array.from({ length: 12 }, (_, i) => ({
  id: `prod-${i + 1}`,
  name: "Product Name",
  description: "Product description goes here...",
  price: Math.floor(Math.random() * 1000) + 99.99,
  rating: 4.5,
  soldCount: Math.floor(Math.random() * 1000),
  image: "/placeholder.svg",
  category: {
    id: String(Math.floor(i / 3) + 1),
    name: ["Electronics", "Fashion", "Home", "Sports"][Math.floor(i / 3)],
  },
}))

const priceRanges = [
  { label: "All Prices", value: "all" },
  { label: "Under $100", value: "0-100" },
  { label: "$100 - $500", value: "100-500" },
  { label: "$500 - $1000", value: "500-1000" },
  { label: "Over $1000", value: "1000+" },
]

export default function WishlistPage() {
  const [items, setItems] = useState(demoWishlist)
  const [filteredItems, setFilteredItems] = useState(demoWishlist)
  const [searchQuery, setSearchQuery] = useState("")
  const [priceRange, setPriceRange] = useState("all")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [categories, setCategories] = useState([])

  useEffect(() => {
    // Extract unique categories from items
    const uniqueCategories = Array.from(new Set(items.map((item) => JSON.stringify(item.category)))).map((cat) =>
      JSON.parse(cat),
    )

    setCategories(uniqueCategories)
  }, [items])

  useEffect(() => {
    let filtered = [...items]

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (item) =>
          item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.description.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    // Apply price range filter
    if (priceRange !== "all") {
      const [min, max] = priceRange.split("-").map(Number)
      filtered = filtered.filter((item) => {
        if (priceRange === "1000+") {
          return item.price >= 1000
        }
        return item.price >= min && item.price <= max
      })
    }

    // Apply category filter
    if (selectedCategory !== "all") {
      filtered = filtered.filter((item) => item.category.id === selectedCategory)
    }

    setFilteredItems(filtered)
  }, [searchQuery, priceRange, selectedCategory, items])

  const removeFromWishlist = (productId) => {
    setItems((prev) => prev.filter((item) => item.id !== productId))
  }

  return (
    <div className="container py-8">
      <div className="mb-8 space-y-4">
        <h1 className="text-3xl font-bold">My Wishlist</h1>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="relative">
            <Input
              type="search"
              placeholder="Search wishlist..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pr-10"
            />
            <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          </div>

          <Select value={priceRange} onValueChange={setPriceRange}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by price" />
            </SelectTrigger>
            <SelectContent>
              {priceRanges.map(({ label, value }) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {filteredItems.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredItems.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onRemoveFromWishlist={() => removeFromWishlist(product.id)}
              showWishlistButton={false}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <h2 className="text-xl font-medium mb-4">No items found</h2>
          <Button onClick={() => (window.location.href = "/products")}>Browse Products</Button>
        </div>
      )}
    </div>
  )
}