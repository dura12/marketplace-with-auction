import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const origin = request.headers.get('origin');

  // Allow specific origins (replace with your frontend URL or use environment variables)
  const allowedOrigins = [
    process.env.NEXT_PUBLIC_FRONTEND_URL, // e.g., 'https://your-marketplace.com'
    'http://localhost:3001', // For development
  ];

  const response = NextResponse.next();

  if (origin && allowedOrigins.includes(origin)) {
    response.headers.set('Access-Control-Allow-Origin', origin);
  }

  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  response.headers.set('Access-Control-Allow-Credentials', 'true'); // If using cookies/auth

  // Handle preflight requests (OPTIONS)
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, { status: 200 });
  }

  return response;
}

// Apply middleware to all API routes
export const config = {
  matcher: '/api/:path*',
}; 