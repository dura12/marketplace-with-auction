import { NextResponse } from 'next/server';
import { connectToDB } from '@/libs/functions';
import User from '@/models/User';
import argon2 from 'argon2';
import jwt from 'jsonwebtoken';

export async function POST(req) {
  try {
    const { email, password } = await req.json();
    await connectToDB();

    const user = await User.findOne({ email }).lean();
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 401 });
    }

    const isValid = await argon2.verify(user.password, password);
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
    }

    if (!user.isEmailVerified) {
      return NextResponse.json({ error: 'Email not verified' }, { status: 403 });
    }

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.NEXTAUTH_SECRET,
      { expiresIn: '1d' }
    );

    if (token) {
        console.log("Token created successfully: ", token);
    }

    return NextResponse.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        name: user.fullName || null,
      },
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
