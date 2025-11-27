import User from "@/models/User";
import { connectToDB } from "@/libs/functions";
import argon2 from "argon2";

export async function POST(req) {
  try {
    console.log("=== Incoming POST request ===");

    const { searchParams } = new URL(req.url);
    const action = searchParams.get("action"); // "verify" or "reset"
    console.log("Action received:", action);

    const { email, otp, newPassword } = await req.json();
    console.log("Payload received:", { email, otp, newPassword });

    if (!email || !otp) {
      console.log("Missing email or OTP");
      return new Response(
        JSON.stringify({ message: "Email and OTP are required" }),
        { status: 400 }
      );
    }

    await connectToDB();
    console.log("Connected to database");

    const user = await User.findOne({ email });
    console.log("User found:", user);

    if (!user) {
      console.log("User not found");
      return new Response(JSON.stringify({ message: "User not found" }), {
        status: 404,
      });
    }

    if (!user.otp || !user.otpExpiry) {
      console.log("OTP or expiry not found in user");
      return new Response(
        JSON.stringify({ message: "No OTP found. Request a new one." }),
        { status: 400 }
      );
    }

    if (new Date() > user.otpExpiry) {
      console.log("OTP expired");
      user.otp = null;
      user.otpExpiry = null;
      await user.save();
      return new Response(
        JSON.stringify({ message: "OTP expired. Request a new one." }),
        { status: 400 }
      );
    }

    if (typeof user.otp !== "string" || typeof otp !== "string") {
      console.log("Invalid OTP format");
      return new Response(
        JSON.stringify({ message: "Invalid OTP format" }),
        { status: 400 }
      );
    }

    const isOtpValid = await argon2.verify(user.otp, otp);
    console.log("OTP verification:", { storedOtp: user.otp, providedOtp: otp, isOtpValid });

    if (!isOtpValid) {
      console.log("OTP is not valid");
      return new Response(JSON.stringify({ message: "Invalid OTP" }), {
        status: 400,
      });
    }

    if (action === "verify") {
      console.log("Action is 'verify'");

      if (user.isEmailVerified) {
        console.log("Email already verified");
        return new Response(
          JSON.stringify({ message: "Email already verified" }),
          { status: 400 }
        );
      }

      user.isEmailVerified = true;
      user.otp = null;
      user.otpExpiry = null;
      await user.save();

      console.log("Email verified successfully");
      return new Response(
        JSON.stringify({ message: "Email verified successfully" }),
        { status: 200 }
      );
    } else if (action === "reset") {
      console.log("Action is 'reset'");

      if (!newPassword) {
        console.log("No new password provided");
        return new Response(
          JSON.stringify({ message: "New password is required" }),
          { status: 400 }
        );
      }

      const hashedPassword = await argon2.hash(newPassword);
      user.password = hashedPassword;
      user.otp = null;
      user.otpExpiry = null;
      await user.save();

      console.log("Password reset successfully");
      return new Response(
        JSON.stringify({ message: "Password reset successfully" }),
        { status: 200 }
      );
    } else {
      console.log("Invalid action type");
      return new Response(JSON.stringify({ message: "Invalid action type" }), {
        status: 400,
      });
    }
  } catch (err) {
    console.error("Error processing request:", err.message);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
    });
  }
}
