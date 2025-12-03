

"use client"

import { useState, useEffect, useMemo } from "react"
import { useSearchParams } from "next/navigation"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ProductCard } from "@/components/product-card"
import { ProductSlider } from "@/components/product-slider"

const deliveryTypes = ["FLAT", "PERPIECE", "PERKG", "FREE"]

export default function ProductsPage() {
  const searchParams = useSearchParams()
  const initialCategoryId = searchParams.get("categoryId") || ""

  // State for all fetched products
  const [allProducts, setAllProducts] = useState([])
  // State for loading and error handling
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [showFilters, setShowFilters] = useState(false)
  // State for filters from user input
  const [filters, setFilters] = useState({
    phrase: "",
    categoryId: initialCategoryId,
    minPrice: "",
    maxPrice: "",
    minReview: "",
    maxReview: "",
    deliveryTypes: [],
    minDeliveryPrice: "",
    maxDeliveryPrice: "",
    startDate: "",
    endDate: "",
  })
  // State for client-side pagination
  const [displayPage, setDisplayPage] = useState(1)
  const displayLimit = 12 // Number of products per page

  // Fetch all products once on component mount
  useEffect(() => {
    const loadAllProducts = async () => {
      try {
        setLoading(true)
        // Get user's location
        let userLocation = null
        try {
          const position = await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
              enableHighAccuracy: true,
              timeout: 5000,
              maximumAge: 0
            })
          })
          userLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          }
          console.log("Got user location:", userLocation)
        } catch (error) {
          console.log("Could not get user location:", error)
        }

        // Build the API URL with location if available
        let apiUrl = "/api/fetchProducts?limit=1000"
        if (userLocation) {
          apiUrl += `&lat=${userLocation.lat}&lng=${userLocation.lng}`
        }
        console.log("Fetching from URL:", apiUrl)

        const response = await fetch(apiUrl)
        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Failed to fetch products')
        }
        
        const data = await response.json()
        console.log("API Response:", data)

        if (!data.products || !Array.isArray(data.products)) {
          throw new Error('Invalid products data received')
        }

        // Log the first few products to verify sorting
        console.log("First few products:", data.products.slice(0, 3))
        
        // Set the products, they will already be sorted by distance if location was provided
        setAllProducts(data.products)
      } catch (err) {
        console.error('Error loading products:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    loadAllProducts()
  }, []) // Empty dependency array means it runs once on mount

  // Compute filtered products based on filters
  const filteredProducts = useMemo(() => {
    if (!allProducts || allProducts.length === 0) {
      console.log("No products to filter")
      return []
    }

    // First, create a copy of the products to avoid mutating the original array
    let products = [...allProducts]

    // Apply filters
    const filtered = products.filter((product) => {
      let matches = true
      // Filter by phrase
      if (
        filters.phrase &&
        !product.productName.toLowerCase().includes(filters.phrase.toLowerCase())
      ) {
        matches = false
      }
      // Filter by category
      if (
        filters.categoryId &&
        (!product.category || !product.category.categoryId || product.category.categoryId.toString() !== filters.categoryId)
      ) {
        matches = false
      }
      // Filter by minPrice
      if (filters.minPrice && product.price < parseFloat(filters.minPrice)) {
        matches = false
      }
      // Filter by maxPrice
      if (filters.maxPrice && product.price > parseFloat(filters.maxPrice)) {
        matches = false
      }
      // Filter by minReview
      if (filters.minReview && product.averageRating < parseFloat(filters.minReview)) {
        matches = false
      }
      // Filter by maxReview
      if (filters.maxReview && product.averageRating > parseFloat(filters.maxReview)) {
        matches = false
      }
      // Filter by delivery types
      if (
        filters.deliveryTypes.length > 0 &&
        !filters.deliveryTypes.includes(product.delivery)
      ) {
        matches = false
      }
      // Filter by minDeliveryPrice
      if (
        filters.minDeliveryPrice &&
        product.deliveryPrice < parseFloat(filters.minDeliveryPrice)
      ) {
        matches = false
      }
      // Filter by maxDeliveryPrice
      if (
        filters.maxDeliveryPrice &&
        product.deliveryPrice > parseFloat(filters.maxDeliveryPrice)
      ) {
        matches = false
      }
      // Filter by startDate
      if (filters.startDate && new Date(product.createdAt) < new Date(filters.startDate)) {
        matches = false
      }
      // Filter by endDate
      if (filters.endDate && new Date(product.createdAt) > new Date(filters.endDate)) {
        matches = false
      }
      return matches
    })

    console.log(`Filtered ${products.length} products down to ${filtered.length} products`)
    return filtered
  }, [allProducts, filters])

  // Reset displayPage to 1 when filters change
  useEffect(() => {
    setDisplayPage(1)
  }, [filters])

  // Calculate products to display based on current page
  const startIndex = (displayPage - 1) * displayLimit
  const endIndex = startIndex + displayLimit
  const displayedProducts = filteredProducts.slice(startIndex, endIndex)
  const totalDisplayPages = Math.ceil(filteredProducts.length / displayLimit)

  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  // Handle delivery type checkbox changes
  const handleDeliveryTypeChange = (type, checked) => {
    setFilters((prev) => ({
      ...prev,
      deliveryTypes: checked
        ? [...prev.deliveryTypes, type]
        : prev.deliveryTypes.filter((t) => t !== type),
    }))
  }

  // Handle search input change
  const handleSearchChange = (e) => {
    const value = e.target.value
    setFilters((prev) => ({
      ...prev,
      phrase: value,
    }))
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="grid grid-cols-1 gap-6">
        {/* Search Input */}
        <div className="mb-8">
          <Input
            type="search"
            name="search"
            placeholder="Search products..."
            value={filters.phrase}
            onChange={handleSearchChange}
            className="max-w-2xl w-full mx-auto"
          />
        </div>

        {/* Product Slider */}
        <div className="mb-8">
          <ProductSlider isHomePage={false} />
        </div>
      </div>

      {/* Loading and Error States */}
      {loading && 
        <div className="container p-6">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            <span className="ml-4">Loading products...</span>
          </div>
        </div>
      }
      {error && <div className="text-center text-red-500 py-8">{error}</div>}

      {/* Main Content */}
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Filters Section */}
        <div className="w-full lg:w-64">
          <Button
            className="w-full lg:hidden mb-4"
            onClick={() => setShowFilters(!showFilters)}
          >
            {showFilters ? "Hide Filters" : "Show Filters"}
          </Button>

          <div className={`${showFilters ? "block" : "hidden"} lg:block`}>
            <div className="grid grid-cols-2 lg:grid-cols-1 gap-4">
              {/* Price Range */}
              <div className="space-y-2">
                <h3 className="font-medium">Price Range</h3>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    name="minPrice"
                    placeholder="Min"
                    value={filters.minPrice}
                    onChange={handleFilterChange}
                    className="w-full"
                  />
                  <Input
                    type="number"
                    name="maxPrice"
                    placeholder="Max"
                    value={filters.maxPrice}
                    onChange={handleFilterChange}
                    className="w-full"
                  />
                </div>
              </div>

              {/* Rating Range */}
              <div className="space-y-2">
                <h3 className="font-medium">Rating</h3>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    name="minReview"
                    placeholder="Min"
                    min="0"
                    max="5"
                    value={filters.minReview}
                    onChange={handleFilterChange}
                    className="w-full"
                  />
                  <Input
                    type="number"
                    name="maxReview"
                    placeholder="Max"
                    min="0"
                    max="5"
                    value={filters.maxReview}
                    onChange={handleFilterChange}
                    className="w-full"
                  />
                </div>
              </div>

              {/* Delivery Types */}
              <div className="space-y-2">
                <h3 className="font-medium">Delivery Type</h3>
                <div className="grid grid-cols-2 gap-2">
                  {deliveryTypes.map((type) => (
                    <div key={type} className="flex items-center space-x-2">
                      <Checkbox
                        id={type}
                        checked={filters.deliveryTypes.includes(type)}
                        onCheckedChange={(checked) => handleDeliveryTypeChange(type, checked)}
                      />
                      <label htmlFor={type} className="text-sm">
                        {type}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Delivery Price */}
              <div className="space-y-2">
                <h3 className="font-medium">Delivery Price</h3>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    name="minDeliveryPrice"
                    placeholder="Min"
                    value={filters.minDeliveryPrice}
                    onChange={handleFilterChange}
                    className="w-full"
                  />
                  <Input
                    type="number"
                    name="maxDeliveryPrice"
                    placeholder="Max"
                    value={filters.maxDeliveryPrice}
                    onChange={handleFilterChange}
                    className="w-full"
                  />
                </div>
              </div>

              {/* Date Range */}
              <div className="space-y-2 col-span-2 lg:col-span-1">
                <h3 className="font-medium">Date Range</h3>
                <div className="space-y-2">
                  <Input
                    type="date"
                    name="startDate"
                    value={filters.startDate}
                    onChange={handleFilterChange}
                    className="w-full"
                  />
                  <Input
                    type="date"
                    name="endDate"
                    value={filters.endDate}
                    onChange={handleFilterChange}
                    className="w-full"
                  />
                </div>
              </div>

              {/* Apply Filters Button */}
              <Button
                className="col-span-2 lg:col-span-1"
                onClick={() => setDisplayPage(1)}
              >
                Apply Filters
              </Button>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div className="flex-1">
          {displayedProducts.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {displayedProducts.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>

              {/* Pagination */}
              <div className="mt-8 flex justify-center gap-2">
                {displayPage > 1 && (
                  <Button
                    variant="outline"
                    onClick={() => setDisplayPage(displayPage - 1)}
                  >
                    Previous
                  </Button>
                )}

                {Array.from({ length: totalDisplayPages }, (_, i) => i + 1).map((page) => (
                  <Button
                    key={page}
                    variant={displayPage === page ? "default" : "outline"}
                    onClick={() => setDisplayPage(page)}
                  >
                    {page}
                  </Button>
                ))}

                {displayPage < totalDisplayPages && (
                  <Button
                    variant="outline"
                    onClick={() => setDisplayPage(displayPage + 1)}
                  >
                    Next
                  </Button>
                )}
              </div>
            </>
          ) : (
            !loading && <div className="text-center py-12">No products found</div>
          )}
        </div>
      </div>
    </div>
  )
}