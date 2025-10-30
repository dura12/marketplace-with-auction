import { NextResponse } from "next/server";
import { connectToDB } from "@/utils/functions";
import Admin from "@/models/Admin";
import SuperAdmin from "@/models/SuperAdmin";
import argon2 from "argon2";

export async function POST(req) {
  try {
    await connectToDB();
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ success: false, message: "Email and password are required" }, { status: 400 });
    }

    // Find user in Admin or SuperAdmin collection
    let user = await Admin.findOne({ email }) || await SuperAdmin.findOne({ email });
    if (!user) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
    }

    // Hash the new password
    const hashedPassword = await argon2.hash(password);

    // Update the password in the database
    user.password = hashedPassword;
    await user.save();

    return NextResponse.json({ success: true, message: "Password has been reset successfully" });
  } catch (error) {
    console.error("Error resetting password:", error);
    return NextResponse.json({ success: false, message: "Failed to reset password. Please try again." }, { status: 500 });
  }
}
