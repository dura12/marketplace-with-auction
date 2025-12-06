"use client";

import { useSearchParams } from "next/navigation";

export default function ProductsPage() {
  const searchParams = useSearchParams();
  const status = searchParams.get("status");

  return (
    <div className="min-h-screen p-6 flex items-center ">
      <div className="max-w-md w-full">
        <div className="bg-white shadow-lg rounded-lg p-6 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Advertisement Payment</h1>
          {status && <p className="text-lg text-gray-600">Payment Status: {status}</p>}
        </div>
      </div>
    </div>
  );
}