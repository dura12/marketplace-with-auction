"use client";

import React, { useState, useEffect, useRef } from "react";
import { ProductCard } from "@/components/product-card";
import { ProductSlider } from "@/components/product-slider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronLeft, ChevronRight, ChevronUp } from "lucide-react";
import { useSession } from "next-auth/react";

export default function Home() {
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const { data: session, status } = useSession();
  const [loggedUser, setLoggedUser] = useState(null);
  const [isLoadingUser, setIsLoadingUser] = useState(false);
  const [userLocation, setUserLocation] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      if (session?.user?.email) {
        setIsLoadingUser(true);
        try {
          const response = await fetch("/api/user");
          if (!response.ok) throw new Error(`Server error: ${response.status}`);
          const user = await response.json();
          setLoggedUser(user);
        } catch (error) {
          console.error("Error fetching user data:", error);
        } finally {
          setIsLoadingUser(false);
        }
      }
    };
    fetchUser();
  }, [session]);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.error("Error getting location:", error.message);
          setUserLocation(null);
        }
      );
    } else {
      console.log("Geolocation not supported");
      setUserLocation(null);
    }
  }, []);

  useEffect(() => {
    const updateItemsPerPage = () => {
      setItemsPerPage(window.innerWidth < 1024 ? 6 : 10);
    };
    updateItemsPerPage();
    window.addEventListener("resize", updateItemsPerPage);
    return () => window.removeEventListener("resize", updateItemsPerPage);
  }, []);

  const [categories, setCategories] = useState([]);
  const [specialProducts, setSpecialProducts] = useState({
    popular: [],
    bestSeller: [],
    topRated: [],
    latest: [],
  });
  const [specialTotals, setSpecialTotals] = useState({
    popular: 0,
    bestSeller: 0,
    topRated: 0,
    latest: 0,
  });
  const [specialPages, setSpecialPages] = useState({
    popular: 1,
    bestSeller: 1,
    topRated: 1,
    latest: 1,
  });
  const [categoryProducts, setCategoryProducts] = useState({});
  const [categoryPages, setCategoryPages] = useState({});
  const [currentPage, setCurrentPage] = useState(1);

  const sectionRefs = useRef({});

  const fetchSpecialProducts = async (type, page = 1, limit, lat, lng) => {
    let url = `/api/homePageFilter?type=${type}&page=${page}&limit=${limit}`;
    if (lat && lng) {
      url += `&center=${lat}-${lng}`;
    }
    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch special products");
    const data = await response.json();
    return { products: data.products, total: data.total };
  };

  const fetchCategoryProducts = async (categoryId, lat, lng) => {
    let url = `/api/fetchProducts?category=${categoryId}`;
    if (lat && lng) {
      url += `&lat=${lat}&lng=${lng}`;
    }
    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch category products");
    const data = await response.json();
    return data.products;
  };

  useEffect(() => {
    const loadInitialData = async () => {
      const categoriesResponse = await fetch("/api/categories");
      if (!categoriesResponse.ok) throw new Error("Failed to fetch categories");
      const fetchedCategories = await categoriesResponse.json();
      setCategories(fetchedCategories);

      const { products: bestSellerProducts, total: bestSellerTotal } =
        await fetchSpecialProducts(
          "bestSellers",
          1,
          itemsPerPage,
          userLocation?.lat,
          userLocation?.lng
        );
      setSpecialProducts({
        popular: bestSellerProducts,
        bestSeller: bestSellerProducts,
        topRated: [],
        latest: [],
      });
      setSpecialTotals({
        popular: bestSellerTotal,
        bestSeller: bestSellerTotal,
        topRated: 0,
        latest: 0,
      });
      setSpecialPages({
        popular: 1,
        bestSeller: 1,
        topRated: 1,
        latest: 1,
      });

      const { products: topRatedProducts, total: topRatedTotal } =
        await fetchSpecialProducts(
          "topRated",
          1,
          itemsPerPage,
          userLocation?.lat,
          userLocation?.lng
        );
      setSpecialProducts((prev) => ({ ...prev, topRated: topRatedProducts }));
      setSpecialTotals((prev) => ({ ...prev, topRated: topRatedTotal }));

      const { products: latestProducts, total: latestTotal } =
        await fetchSpecialProducts(
          "latestProducts",
          1,
          itemsPerPage,
          userLocation?.lat,
          userLocation?.lng
        );
      setSpecialProducts((prev) => ({ ...prev, latest: latestProducts }));
      setSpecialTotals((prev) => ({ ...prev, latest: latestTotal }));

      const productData = {};
      const pages = {};
      for (const category of fetchedCategories) {
        const products = await fetchCategoryProducts(
          category._id,
          userLocation?.lat,
          userLocation?.lng
        );
        productData[category._id] = products;
        pages[category._id] = 1;
      }
      setCategoryProducts(productData);
      setCategoryPages(pages);

      sectionRefs.current = {
        popular: React.createRef(),
        bestSeller: React.createRef(),
        topRated: React.createRef(),
        latest: React.createRef(),
        ...fetchedCategories.reduce((acc, cat) => {
          acc[cat._id] = React.createRef();
          return acc;
        }, {}),
      };
    };

    loadInitialData();
  }, [itemsPerPage, userLocation]);

  const scrollToSection = (sectionId) => {
    sectionRefs.current[sectionId]?.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSpecialPageChange = async (type, page) => {
    const apiType =
      type === "popular" || type === "bestSeller"
        ? "bestSellers"
        : type + "Products";
    const { products, total } = await fetchSpecialProducts(
      apiType,
      page,
      itemsPerPage,
      userLocation?.lat,
      userLocation?.lng
    );
    setSpecialProducts((prev) => ({ ...prev, [type]: products }));
    setSpecialTotals((prev) => ({ ...prev, [type]: total }));
    setSpecialPages((prev) => ({ ...prev, [type]: page }));
  };

  const renderPagination = (current, total, onChange) => (
    <div className="flex justify-center mt-4 gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => onChange(Math.max(1, current - 1))}
        disabled={current === 1}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <span className="flex items-center px-2">
        Page {current} of {total}
      </span>
      <Button
        variant="outline"
        size="sm"
        onClick={() => onChange(Math.min(total, current + 1))}
        disabled={current === total}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );

  const displayedCategories = categories.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const totalCategoriesPages = Math.ceil(categories.length / itemsPerPage);

  return (
    <div className="container mx-auto px-4 py-8 justify-between">
      <div className="grid grid-cols-1 gap-6">
        {isLoadingUser ? (
          <p>Loading user data...</p>
        ) : loggedUser ? (
          <div>
            <h2 className="text-xl font-bold">
              Welcome, {loggedUser.fullName || "User"}!
            </h2>
          </div>
        ) : null}

        <div className="mb-8">
          <form className="flex gap-4 max-w-2xl w-full mx-auto">
            <Input
              type="search"
              placeholder="Search products..."
              className="flex-1"
            />
            <Button type="submit">Search</Button>
          </form>
        </div>

        <ProductSlider isHomePage={true} />

        <nav className="my-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 overflow-x-auto gap-4 mb-4">
            {["Popular", "Best Seller", "Top Rated", "Latest"].map((type) => {
              const sectionKeys = {
                Popular: "popular",
                "Best Seller": "bestSeller",
                "Top Rated": "topRated",
                Latest: "latest",
              };
              return (
                <Button
                  key={type}
                  variant="outline"
                  onClick={() => scrollToSection(sectionKeys[type])}
                >
                  {type}
                </Button>
              );
            })}
          </div>

          <div className="flex overflow-x-auto gap-4 justify-between">
            {displayedCategories.map((category) => (
              <Button
                key={category._id}
                variant="outline"
                onClick={() => scrollToSection(category._id)}
              >
                {category.name}
              </Button>
            ))}
          </div>

          {totalCategoriesPages > 1 &&
            renderPagination(currentPage, totalCategoriesPages, setCurrentPage)}
        </nav>

        <div className="space-y-12">
          {Object.entries(specialProducts).map(([type, products]) => {
            const totalPages = Math.ceil(specialTotals[type] / itemsPerPage);
            return (
              <section
                key={type}
                ref={sectionRefs.current[type]}
                className="scroll-mt-[90px]"
              >
                <h2 className="text-xl md:text-2xl font-bold mb-6 capitalize">
                  {type.replace(/([A-Z])/g, " $1").trim()}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                  {products.map((product) => (
                    <ProductCard key={product._id} product={product} />
                  ))}
                </div>
                {totalPages > 1 &&
                  renderPagination(specialPages[type], totalPages, (page) =>
                    handleSpecialPageChange(type, page)
                  )}
              </section>
            );
          })}

          {categories.map((category) => {
            const allProducts = categoryProducts[category._id] || [];
            const currentCatPage = categoryPages[category._id] || 1;
            const totalCatPages = Math.ceil(allProducts.length / itemsPerPage);
            const startIndex = (currentCatPage - 1) * itemsPerPage;
            const displayedProducts = allProducts.slice(
              startIndex,
              startIndex + itemsPerPage
            );
            return (
              <section
                key={category._id}
                ref={sectionRefs.current[category._id]}
                className="scroll-mt-[90px]"
              >
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                  <h2 className="text-xl md:text-2xl font-bold">
                    {category.name}
                  </h2>
                  <Button
                    variant="outline"
                    className="mt-2 md:mt-0"
                    onClick={() =>
                      (window.location.href = `/products?categoryId=${category._id}`)
                    }
                  >
                    See More
                  </Button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                  {displayedProducts.map((product) => (
                    <ProductCard key={product._id} product={product} />
                  ))}
                </div>
                {totalCatPages > 1 &&
                  renderPagination(currentCatPage, totalCatPages, (page) =>
                    setCategoryPages((prev) => ({
                      ...prev,
                      [category._id]: page,
                    }))
                  )}
              </section>
            );
          })}
        </div>

        <div className="fixed bottom-6 right-4 z-50">
          <Button variant="outline" size="icon" onClick={scrollToTop}>
            <ChevronUp className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}