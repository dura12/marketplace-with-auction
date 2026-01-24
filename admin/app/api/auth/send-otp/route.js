import Admin from "@/models/Admin";
import { generateOtp, sendOtpEmail, storeOtp } from "../../../../utils/sendOtp";
import SuperAdmin from "@/models/SuperAdmin";
import { connectToDB } from "../../../../utils/functions";
import argon2 from 'argon2';

export async function POST(req) {
  try {
    await connectToDB();
    const { email, password } = await req.json();

    // Find user
    let user = await Admin.findOne({ email }) || await SuperAdmin.findOne({ email });
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
    
    try {
      await sendOtpEmail(email, otp);
    } catch (emailError) {
      console.error("Email sending failed:", emailError);
      // In development, continue even if email fails
      if (process.env.NODE_ENV === 'production') {
        return Response.json({ error: 'Failed to send OTP email' }, { status: 500 });
      }
      console.log(`[DEV] OTP for ${email}: ${otp}`);
    }
    
    await storeOtp(email, otp);

    return Response.json({ message: 'OTP sent' });
  } catch (error) {
    console.error("Send OTP error:", error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
