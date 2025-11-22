// app/api/auth/token/route.js
import { getToken } from 'next-auth/jwt';
import { NextResponse } from 'next/server';

const secret = process.env.NEXTAUTH_SECRET;

export async function GET(req) {
  const token = await getToken({ req, secret, raw: true });
  
  if (!token) {
    return NextResponse.json(
      { error: 'Not authenticated' },
      { status: 401 }
    );
  }

  return NextResponse.json({ token });
}