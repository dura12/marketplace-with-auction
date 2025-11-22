import User from "@/models/User";
import { generateOtp, sendOtpEmail, storeOtp } from "../../../../libs/sendOtp";
import { connectToDB } from "@/libs/functions";
import argon2 from 'argon2';

export async function POST(req) {
  await connectToDB();
  const { email, password } = await req.json();

  // Find user
  let user = await User.findOne({ email });
  if (!user) {
    return Response.json({ error: 'Invalid email' }, { status: 400 });
  }

  // If no password is provided, it means it's for reset, so we skip password verification
  if (password) {
    // Verify password (only needed for "verify" flow)
    const isPasswordValid = await argon2.verify(user.password, password);
    if (!isPasswordValid) {
      return Response.json({ error: 'Invalid password' }, { status: 400 });
    }
  }

  // Generate and send OTP
  const otp = generateOtp();
  await sendOtpEmail(email, otp);
  await storeOtp(email, otp);

  return Response.json({ message: 'OTP sent' });
}