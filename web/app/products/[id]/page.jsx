
import { notFound } from "next/navigation"
import ProductDetail from "@/components/product-detail"
async function getProduct(id) {
  try {
    // Use absolute URL for fetch
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
    const res = await fetch(`${baseUrl}/api/products/${id}`, {
      cache: 'no-store'
    })
    
    if (!res.ok) return null;
    return await res.json();
  } catch (error) {
    console.error('Failed to fetch product:', error);
    return null;
  }
}

export default async function ProductPage({ params }) {
  const product = await getProduct(params.id);
  
  if (!product) {
    return notFound();
  }

  return (
    <div className="scroll-smooth overflow-x-hidden mt-8">
      <ProductDetail product={product} />
    </div>
  )
}