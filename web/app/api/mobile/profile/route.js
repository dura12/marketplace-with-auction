import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { connectToDB } from '@/libs/functions';
import User from '@/models/User';

// Middleware-like utility to get the user from token
const authenticate = async (req) => {
  const authHeader = req.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('Unauthorized');
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET);
    return decoded;
  } catch (err) {
    throw new Error('Invalid token');
  }
};

export async function GET(req) {
  try {
    await connectToDB();
    const userData = await authenticate(req);

    const user = await User.findById(userData.id).lean();
    if (!user) {
      return NextResponse.json({ error: 'User not found or not a customer' }, { status: 404 });
    }

    return NextResponse.json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      image: user.image,
      role: user.role,
      isBanned: user.isBanned,
      isEmailVerified: user.isEmailVerified,
      isDeleted: user.isDeleted,
      phoneNumber: user.phoneNumber || '',
      stateName: user.stateName || '',
      cityName: user.cityName || '',
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 401 });
  }
}

export async function PUT(req) {
  try {
    await connectToDB();
    const userData = await authenticate(req);
    const body = await req.json();

    const { fullName, phoneNumber, stateName, cityName, image } = body;

    const updatedUser = await User.findByIdAndUpdate(
      userData.id,
      {
        fullName,
        phoneNumber,
        stateName,
        cityName,
        image,
      },
      { new: true, runValidators: true }
    ).lean();

    if (!updatedUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      _id: updatedUser._id,
      fullName: updatedUser.fullName,
      email: updatedUser.email,
      role: updatedUser.role,
      image: updatedUser.image,
      isBanned: updatedUser.isBanned,
      isEmailVerified: updatedUser.isEmailVerified,
      isDeleted: updatedUser.isDeleted,
      phoneNumber: updatedUser.phoneNumber || '',
      stateName: updatedUser.stateName || '',
      cityName: updatedUser.cityName || '',
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
