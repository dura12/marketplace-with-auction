"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/libs/utils";

/**
 * ImageWithFallback - A reusable image component with placeholder fallback
 * 
 * @param {string} src - Image source URL
 * @param {string} alt - Alt text (also used as placeholder text)
 * @param {string} fallbackText - Custom text for placeholder (defaults to alt)
 * @param {number} width - Image width
 * @param {number} height - Image height
 * @param {string} className - Additional CSS classes
 * @param {boolean} priority - Next.js Image priority prop
 * @param {string} placeholderClassName - Custom classes for placeholder
 * @param {object} ...props - Additional props passed to Image component
 */
export function ImageWithFallback({
  src,
  alt,
  fallbackText,
  width = 300,
  height = 300,
  className = "",
  priority = false,
  placeholderClassName = "",
  fill = false,
  ...props
}) {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check if src is valid
  const isValidSrc = src && src !== "" && src !== "/placeholder.svg" && src !== "undefined";

  // Generate initials from alt text for the placeholder
  const getInitials = (text) => {
    if (!text) return "IMG";
    const words = text.split(" ").filter(Boolean);
    if (words.length === 1) {
      return words[0].substring(0, 3).toUpperCase();
    }
    return words
      .slice(0, 2)
      .map((word) => word[0])
      .join("")
      .toUpperCase();
  };

  // Generate a consistent color based on the text
  const getColorFromText = (text) => {
    if (!text) return { bg: "bg-slate-200", text: "text-slate-600" };
    
    const colors = [
      { bg: "bg-amber-100", text: "text-amber-700" },
      { bg: "bg-emerald-100", text: "text-emerald-700" },
      { bg: "bg-sky-100", text: "text-sky-700" },
      { bg: "bg-violet-100", text: "text-violet-700" },
      { bg: "bg-rose-100", text: "text-rose-700" },
      { bg: "bg-orange-100", text: "text-orange-700" },
      { bg: "bg-teal-100", text: "text-teal-700" },
      { bg: "bg-indigo-100", text: "text-indigo-700" },
      { bg: "bg-pink-100", text: "text-pink-700" },
      { bg: "bg-cyan-100", text: "text-cyan-700" },
    ];

    // Simple hash function
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      hash = text.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    return colors[Math.abs(hash) % colors.length];
  };

  const displayText = fallbackText || alt || "Image";
  const initials = getInitials(displayText);
  const colorScheme = getColorFromText(displayText);

  // Show placeholder if no valid src or if image failed to load
  if (!isValidSrc || hasError) {
    return (
      <div
        className={cn(
          "flex flex-col items-center justify-center h-full w-full",
          colorScheme.bg,
          fill ? "absolute inset-0" : "",
          placeholderClassName || className
        )}
        role="img"
        aria-label={alt}
      >
        <span className={cn("text-3xl sm:text-4xl font-bold", colorScheme.text)}>
          {initials}
        </span>
        <span
          className={cn(
            "text-[10px] sm:text-xs mt-1 px-2 text-center line-clamp-2 font-medium max-w-[90%]",
            colorScheme.text
          )}
        >
          {displayText.length > 25 ? displayText.substring(0, 25) + "..." : displayText}
        </span>
      </div>
    );
  }

  return (
    <div className={cn("relative h-full w-full", fill ? "" : "")}>
      {/* Loading skeleton */}
      {isLoading && (
        <div
          className={cn(
            "absolute inset-0 animate-pulse",
            colorScheme.bg,
            "flex items-center justify-center"
          )}
        >
          <span className={cn("text-2xl font-bold opacity-50", colorScheme.text)}>
            {initials}
          </span>
        </div>
      )}
      
      <Image
        src={src}
        alt={alt}
        width={fill ? undefined : width}
        height={fill ? undefined : height}
        fill={fill}
        priority={priority}
        className={cn(
          "object-cover",
          className,
          isLoading ? "opacity-0" : "opacity-100",
          "transition-opacity duration-300"
        )}
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setHasError(true);
          setIsLoading(false);
        }}
        {...props}
      />
    </div>
  );
}

/**
 * ProductImage - Specialized image component for products
 */
export function ProductImage({ product, className, priority = false, ...props }) {
  const src = product?.images?.[0] || product?.image || "";
  const alt = product?.productName || product?.name || "Product";
  
  return (
    <ImageWithFallback
      src={src}
      alt={alt}
      className={className}
      priority={priority}
      {...props}
    />
  );
}

/**
 * AuctionImage - Specialized image component for auctions
 */
export function AuctionImage({ auction, className, priority = false, ...props }) {
  const src = auction?.itemImg || auction?.image || "";
  const alt = auction?.auctionTitle || auction?.title || "Auction Item";
  
  return (
    <ImageWithFallback
      src={src}
      alt={alt}
      className={className}
      priority={priority}
      {...props}
    />
  );
}

/**
 * UserAvatar - Specialized image component for user avatars
 */
export function UserAvatar({ user, size = 40, className, ...props }) {
  const src = user?.avatar || user?.image || user?.profileImage || "";
  const alt = user?.fullName || user?.name || "User";
  
  return (
    <ImageWithFallback
      src={src}
      alt={alt}
      width={size}
      height={size}
      className={cn("rounded-full object-cover", className)}
      {...props}
    />
  );
}

export default ImageWithFallback;

