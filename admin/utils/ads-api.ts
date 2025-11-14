// Mock API functions for ads management

// Mock data for demonstration
const mockAds = [
    {
      _id: "ad1",
      product: {
        productId: "prod1",
        productName: "Premium Smartphone",
        image: "/placeholder.svg?height=300&width=300",
        price: 799.99,
      },
      price: 99.99,
      merchantDetail: {
        merchantId: "merch1",
        merchantName: "Tech Galaxy",
        merchantEmail: "contact@techgalaxy.com",
        phoneNumber: 1234567890,
      },
      paymentStatus: "PAID",
      location: {
        type: "Point",
        coordinates: [37.7749, -122.4194],
      },
      approvalStatus: "PENDING",
      rejectionReason: null,
      isActive: false,
      startsAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
      endsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days from now
      createdAt: new Date().toISOString(),
    },
    {
      _id: "ad2",
      product: {
        productId: "prod2",
        productName: "Wireless Headphones",
        image: "/placeholder.svg?height=300&width=300",
        price: 149.99,
      },
      price: 49.99,
      merchantDetail: {
        merchantId: "merch2",
        merchantName: "Audio World",
        merchantEmail: "sales@audioworld.com",
        phoneNumber: 9876543210,
      },
      paymentStatus: "PENDING",
      location: {
        type: "Point",
        coordinates: [40.7128, -74.006],
      },
      approvalStatus: "APPROVED",
      rejectionReason: null,
      isActive: true,
      startsAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
      endsAt: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000).toISOString(), // 12 days from now
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
    },
    {
      _id: "ad3",
      product: {
        productId: "prod3",
        productName: "Smart Watch",
        image: "/placeholder.svg?height=300&width=300",
        price: 299.99,
      },
      price: 79.99,
      merchantDetail: {
        merchantId: "merch1",
        merchantName: "Tech Galaxy",
        merchantEmail: "contact@techgalaxy.com",
        phoneNumber: 1234567890,
      },
      paymentStatus: "FAILED",
      location: {
        type: "Point",
        coordinates: [34.0522, -118.2437],
      },
      approvalStatus: "REJECTED",
      rejectionReason: {
        reason: "Policy violation",
        description: "The ad content violates our marketplace policies regarding pricing claims.",
      },
      isActive: false,
      startsAt: null,
      endsAt: null,
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
    },
    {
      _id: "ad4",
      product: {
        productId: "prod4",
        productName: "Gaming Laptop",
        image: "/placeholder.svg?height=300&width=300",
        price: 1299.99,
      },
      price: 149.99,
      merchantDetail: {
        merchantId: "merch3",
        merchantName: "Gaming Hub",
        merchantEmail: "info@gaminghub.com",
        phoneNumber: 5551234567,
      },
      paymentStatus: "PAID",
      location: {
        type: "Point",
        coordinates: [51.5074, -0.1278],
      },
      approvalStatus: "APPROVED",
      rejectionReason: null,
      isActive: true,
      startsAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days ago
      endsAt: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString(), // 20 days from now
      createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(), // 12 days ago
    },
    {
      _id: "ad5",
      product: {
        productId: "prod5",
        productName: "Fitness Tracker",
        image: "/placeholder.svg?height=300&width=300",
        price: 89.99,
      },
      price: 39.99,
      merchantDetail: {
        merchantId: "merch4",
        merchantName: "Fitness Gear",
        merchantEmail: "support@fitnessgear.com",
        phoneNumber: 3335557777,
      },
      paymentStatus: "PAID",
      location: {
        type: "Point",
        coordinates: [48.8566, 2.3522],
      },
      approvalStatus: "PENDING",
      rejectionReason: null,
      isActive: false,
      startsAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days from now
      endsAt: new Date(Date.now() + 33 * 24 * 60 * 60 * 1000).toISOString(), // 33 days from now
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    },
  ]
  
  // Fetch ads with filtering
  export async function fetchAds(filters: any = {}) {
    console.log("Fetching ads with filters:", filters)
  
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 800))
  
    let filteredAds = [...mockAds]
  
    // Apply filters
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase()
      filteredAds = filteredAds.filter(
        (ad) =>
          ad.product.productName.toLowerCase().includes(searchLower) ||
          ad.merchantDetail.merchantName.toLowerCase().includes(searchLower),
      )
    }
  
    if (filters.approvalStatus) {
      filteredAds = filteredAds.filter((ad) => ad.approvalStatus === filters.approvalStatus)
    }
  
    if (filters.paymentStatus) {
      filteredAds = filteredAds.filter((ad) => ad.paymentStatus === filters.paymentStatus)
    }
  
    if (filters.merchantName) {
      const merchantNameLower = filters.merchantName.toLowerCase()
      filteredAds = filteredAds.filter((ad) => ad.merchantDetail.merchantName.toLowerCase().includes(merchantNameLower))
    }
  
    if (filters.isActive === true || filters.isActive === "true") {
      filteredAds = filteredAds.filter((ad) => ad.isActive === true)
    } else if (filters.isActive === false || filters.isActive === "false") {
      filteredAds = filteredAds.filter((ad) => ad.isActive === false)
    }
  
    // Date range filtering
    if (filters.dateRange?.from) {
      const fromDate = new Date(filters.dateRange.from)
      filteredAds = filteredAds.filter((ad) => new Date(ad.createdAt) >= fromDate)
    }
  
    if (filters.dateRange?.to) {
      const toDate = new Date(filters.dateRange.to)
      toDate.setHours(23, 59, 59, 999) // End of day
      filteredAds = filteredAds.filter((ad) => new Date(ad.createdAt) <= toDate)
    }
  
    return filteredAds
  }
  
  // Approve an ad
  export async function approveAd(adId: string, activate = false) {
    console.log(`Approving ad ${adId} with activate=${activate}`)
  
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1200))
  
    // In a real implementation, this would make an API call to update the ad
    // For demo purposes, we'll just return a success response
    return {
      success: true,
      message: `Ad ${adId} approved successfully${activate ? " and activated" : ""}`,
    }
  }
  
  // Reject an ad
  export async function rejectAd(adId: string, rejectionData: { reason: string; description: string }) {
    console.log(`Rejecting ad ${adId} with reason: ${rejectionData.reason}`)
  
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1200))
  
    // In a real implementation, this would make an API call to update the ad
    // For demo purposes, we'll just return a success response
    return {
      success: true,
      message: `Ad ${adId} rejected successfully`,
    }
  }
  
  // Fetch a single ad by ID
  export async function fetchAdById(adId: string) {
    console.log(`Fetching ad with ID: ${adId}`)
  
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 600))
  
    const ad = mockAds.find((ad) => ad._id === adId)
  
    if (!ad) {
      throw new Error(`Ad with ID ${adId} not found`)
    }
  
    return ad
  }
  