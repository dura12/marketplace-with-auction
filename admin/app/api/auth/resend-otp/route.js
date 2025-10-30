import { NextResponse } from "next/server";
import { sendOtpEmail } from "@/utils/sendOtp";
import { storeOtp } from "@/utils/sendOtp";
import { generateOtp } from "@/utils/sendOtp";

export async function POST(req) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ success: false, message: "Email is required" }, { status: 400 });
    }

    // Generate a new OTP
    const otp = generateOtp();

    // Send OTP via email
    await sendOtpEmail(email, otp);

    // Store OTP in the database or cache
    await storeOtp(email, otp);

    return NextResponse.json({ success: true, message: "OTP resent successfully" });
  } catch (error) {
    console.error("Error resending OTP:", error);
    return NextResponse.json({ success: false, message: "Failed to resend OTP. Please try again." }, { status: 500 });
  }
}
