export async function fetchProducts(page: number, limit: number, filters: {
  isBanned: boolean | undefined; 
  phrase: string | undefined; 
  categoryId: string | undefined; 
  minPrice: number | undefined; 
  maxPrice: number | undefined; 
  minQuantity: number | undefined; 
  maxQuantity: number | undefined; 
  minAvgReview: number | undefined; 
  maxAvgReview: number | undefined; 
  delivery: string | undefined; 
  minDeliveryPrice: number | undefined; 
  maxDeliveryPrice: number | undefined; 
  center: string | undefined; 
  radius: number | undefined;
}) {
  const queryParams = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    ...(filters.isBanned !== undefined && { isBanned: filters.isBanned.toString() }),
    ...(filters.phrase && { phrase: filters.phrase }),
    ...(filters.categoryId && { categoryId: filters.categoryId }),
    ...(filters.minPrice && { minPrice: filters.minPrice.toString() }),
    ...(filters.maxPrice && { maxPrice: filters.maxPrice.toString() }),
    ...(filters.minQuantity && { minQuantity: filters.minQuantity.toString() }),
    ...(filters.maxQuantity && { maxQuantity: filters.maxQuantity.toString() }),
    ...(filters.minAvgReview && { minAvgReview: filters.minAvgReview.toString() }),
    ...(filters.maxAvgReview && { maxAvgReview: filters.maxAvgReview.toString() }),
    ...(filters.delivery && { delivery: filters.delivery }),
    ...(filters.minDeliveryPrice && { minDeliveryPrice: filters.minDeliveryPrice.toString() }),
    ...(filters.maxDeliveryPrice && { maxDeliveryPrice: filters.maxDeliveryPrice.toString() }),
    ...(filters.center && { center: filters.center }),
    ...(filters.radius && { radius: filters.radius.toString() }),
  });

  const response = await fetch(`/api/products?${queryParams.toString()}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  if (!response.ok) throw new Error("Failed to fetch products");
  return response.json();
}

export async function banProduct(productId: string, banReason: object) {
  const response = await fetch(`/api/products`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ _id: productId, isBanned: true, banReason }),
  });

  if (!response.ok) throw new Error("Failed to ban product");
  return response.json();
}

export async function unbanProduct(productId: string) {
  const response = await fetch(`/api/products`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ _id: productId, isBanned: false }),
  });

  if (!response.ok) throw new Error("Failed to unban product");
  return response.json();
}

export async function deleteProduct(productId: string) {
  const response = await fetch(`/api/products?_id=${productId}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
  });

  if (!response.ok) throw new Error("Failed to permanently delete product");
  return response.json();
}

export async function fetchDashboardStats() {
  try {
    const [
      ordersRes,
      usersRes,
      productsRes,
      categoriesRes,
      adminsRes,
      auctionRes,
    ] = await Promise.all([
      fetch("/api/order"),
      fetch("/api/manageUsers"),
      fetch("/api/products"),
      fetch("/api/manageCategory"),
      fetch("/api/manageAdmins"),
      fetch("/api/manageAuctions"),
    ]);

    // ✅ Corrected this check
    if (
      !ordersRes.ok ||
      !usersRes.ok ||
      !productsRes.ok ||
      !categoriesRes.ok ||
      !adminsRes.ok ||
      !auctionRes.ok
    ) {
      throw new Error("One or more API requests failed");
    }

    const ordersData = await ordersRes.json();
    const usersData = await usersRes.json();
    const productsData = await productsRes.json();
    const categoriesData = await categoriesRes.json();
    const adminsData = await adminsRes.json();
    const auctionData = await auctionRes.json();

    const orders = Array.isArray(ordersData.orders) ? ordersData.orders : [];
    const users = Array.isArray(usersData) ? usersData : [];
    const products = Array.isArray(productsData.products) ? productsData.products : [];
    const categories = Array.isArray(categoriesData) ? categoriesData : [];
    const admins = Array.isArray(adminsData) ? adminsData : [];
    const auctions = Array.isArray(auctionData) ? auctionData : [];

    const now = new Date();
    const currentMonth = now.getMonth();
    const previousMonth = (currentMonth - 1 + 12) % 12;
    const currentYear = now.getFullYear();

    const filterByMonth = (items: any[], field: string) => 
      ({ current, previous }: { current: number; previous: number }) => {
    
      const currentMonthItems = items.filter((item) => {
        const date = new Date(item[field]);
        return !isNaN(date.getTime()) &&
          date.getMonth() === current &&
          date.getFullYear() === currentYear;
      });

      const previousMonthItems = items.filter((item) => {
        const date = new Date(item[field]);
        return !isNaN(date.getTime()) &&
          date.getMonth() === previous &&
          date.getFullYear() === currentYear;
      });

      return { currentMonthItems, previousMonthItems };
    };

    const calculateGrowth = (current: number, previous: number) => {
      const diff = current - previous;
      const percent = previous === 0 ? (current > 0 ? 100 : 0) : (diff / previous) * 100;
      return {
        isIncrease: diff >= 0,
        percentChange: Math.abs(+percent.toFixed(2)),
      };
    };

    // 💰 Transactions
    let totalTransactionAmount = 0;

    orders.forEach(({ paymentStatus, totalPrice }: { paymentStatus: string; totalPrice: number | string }) => {
      const price = Number(totalPrice) || 0;
    
      if (paymentStatus === "Paid") {
        totalTransactionAmount += price;
      } else if (paymentStatus === "Refunded") {
        totalTransactionAmount += price * 2;
      } else if (paymentStatus === "Paid To Merchant") {
        totalTransactionAmount += price - price * 0.04;
      }
    });
    

    const totalTransactions = +totalTransactionAmount.toFixed(2);

    const { currentMonthItems: currentTransactions, previousMonthItems: previousTransactions } =
      filterByMonth(orders, "orderDate")({ current: currentMonth, previous: previousMonth });
    const transactionStats = calculateGrowth(currentTransactions.length, previousTransactions.length);

    // 💵 Revenue
    const totalRevenueOrders = orders
      .filter((o: { paymentStatus: string; }) => o.paymentStatus === "Paid To Merchant")
      .reduce((sum: number, o: { totalPrice: any; }) => sum + (Number(o.totalPrice) || 0), 0);

    const revenue = +(totalRevenueOrders * 0.04).toFixed(2);

    const currentRevenue = currentTransactions
      .filter((o) => o.paymentStatus === "Paid To Merchant")
      .reduce((sum, o) => sum + (Number(o.totalPrice) || 0), 0) * 0.04;

    const previousRevenue = previousTransactions
      .filter((o) => o.paymentStatus === "Paid To Merchant")
      .reduce((sum, o) => sum + (Number(o.totalPrice) || 0), 0) * 0.04;

    const revenueStats = calculateGrowth(currentRevenue, previousRevenue);

    // 👥 Users
    const filterByRole = (role: string) => users.filter((u) => u.role === role);

    const merchants = filterByRole("merchant");
    const customers = filterByRole("customer");
    const pendingMerchantApprovals = merchants.filter((m) => m.approvalStatus === "pending").length;

    const { currentMonthItems: currentUsers, previousMonthItems: previousUsers } =
      filterByMonth(users, "createdAt")({ current: currentMonth, previous: previousMonth });
    const { currentMonthItems: currentCustomers, previousMonthItems: previousCustomers } =
      filterByMonth(customers, "createdAt")({ current: currentMonth, previous: previousMonth });
    const { currentMonthItems: currentMerchants, previousMonthItems: previousMerchants } =
      filterByMonth(merchants, "createdAt")({ current: currentMonth, previous: previousMonth });

    // 📦 Products
    const { currentMonthItems: currentProducts, previousMonthItems: previousProducts } =
      filterByMonth(products, "createdAt")({ current: currentMonth, previous: previousMonth });

    // 🏷️ Categories
    const { currentMonthItems: currentCategories, previousMonthItems: previousCategories } =
      filterByMonth(categories, "createdAt")({ current: currentMonth, previous: previousMonth });

    return {
      transactions: {
        total: totalTransactions,
        ...transactionStats,
      },
      revenue: {
        total: +revenue.toFixed(2),
        ...revenueStats,
      },
      merchants: {
        total: merchants.length,
        pendingApproval: pendingMerchantApprovals,
        ...calculateGrowth(currentMerchants.length, previousMerchants.length),
      },
      customers: {
        total: customers.length,
        ...calculateGrowth(currentCustomers.length, previousCustomers.length),
      },
      users: {
        total: users.length,
        ...calculateGrowth(currentUsers.length, previousUsers.length),
      },
      products: {
        total: products.length,
        ...calculateGrowth(currentProducts.length, previousProducts.length),
      },
      orders: {
        total: orders.length,
        pendingRefunds: orders.filter((o: { paymentStatus: string; }) => o.paymentStatus === "Pending Refund").length,
        ...calculateGrowth(currentTransactions.length, previousTransactions.length),
      },
      auctions: {
        total: auctions.length,
        pendingApproval: auctions.filter((a) => a.status === "pending").length,
        isIncrease: false,
        percentChange: -2, // demo data
      },
      categories: {
        total: categories.length,
        ...calculateGrowth(currentCategories.length, previousCategories.length),
      },
      admins: {
        total: admins.length,
        isIncrease: false,
        percentChange: 0,
      },
    };
  } catch (error) {
    const err = error as Error;
    console.error("Error fetching dashboard stats:", {
      message: err.message,
      stack: err.stack,
    });
  }
  

    return {
      transactions: { total: 0, isIncrease: false, percentChange: 0 },
      revenue: { total: 0, isIncrease: false, percentChange: 0 },
      merchants: { total: 0, pendingApproval: 0, isIncrease: false, percentChange: 0 },
      customers: { total: 0, isIncrease: false, percentChange: 0 },
      users: { total: 0, isIncrease: false, percentChange: 0 },
      products: { total: 0, isIncrease: false, percentChange: 0 },
      orders: { total: 0, pendingRefunds: 0, isIncrease: false, percentChange: 0 },
      auctions: { total: 0, pendingApproval: 0, isIncrease: false, percentChange: 0 },
      categories: { total: 0, isIncrease: false, percentChange: 0 },
      admins: { total: 0, isIncrease: false, percentChange: 0 },
    };
  }

// Mock transaction distribution data
export async function fetchTransactionDistributionData() {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500))
  return [
    { label: "Credit Card", value: 15000, color: "rgba(59, 130, 246, 0.7)" },
    { label: "Debit Card", value: 10000, color: "rgba(16, 185, 129, 0.7)" },
    { label: "PayPal", value: 5000, color: "rgba(249, 115, 22, 0.7)" },
  ]
}

// Mock revenue distribution data
export async function fetchRevenueDistributionData() {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500))
  return [
    { label: "Sales", value: 20000, color: "rgba(59, 130, 246, 0.7)" },
    { label: "Auctions", value: 5000, color: "rgba(16, 185, 129, 0.7)" },
  ]
}

// Mock category revenue data
function generateColor(index: number) {
  const hue = (index * 47) % 360; // Spread hues evenly
  const color = `hsl(${hue}, 70%, 60%)`;
  console.log(`Generated color for index ${index}: ${color}`);
  return color;
}

export async function fetchCategoryRevenueData() {
  try {
    const res = await fetch('/api/order');
    const data = await res.json();

    if (!data.success) {
      console.error("Order fetch unsuccessful.");
      throw new Error('Failed to fetch orders');
    }

    const categoryMap = new Map();

    data.orders.forEach((order: { products: any[] }, orderIndex: number) => {
      order.products.forEach((product, productIndex) => {
        const category = product.categoryName || 'Unknown';
        const total = product.price * product.quantity;

        if (categoryMap.has(category)) {
          const current = categoryMap.get(category);
          categoryMap.set(category, current + total);
        } else {
          categoryMap.set(category, total);
        }
      });
    });

    let index = 0;
    const categoryRevenueData = Array.from(categoryMap.entries()).map(([label, value]) => {
      const color = generateColor(index);
      return {
        label,
        value,
        color,
      };
      index++;
    });

    return categoryRevenueData;
  } catch (error) {
    console.error('Error fetching category revenue:', error);
    return [];
  }
}


// Mock report generation
export async function generateReport(period: string, format: string) {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1000))

  // Mock download URL - replace with actual URL in a real app
  const downloadUrl = `/reports/${period}-${format}.${format}`

  return {
    success: true,
    downloadUrl,
  }
}