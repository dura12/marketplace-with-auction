// import nodemailer from 'nodemailer';
// import crypto from 'crypto';
// import argon2 from 'argon2';
// import User from '../models/User';
// import mongoose from 'mongoose';

// export const generateOtp = () => {
//     return crypto.randomInt(100000, 999999).toString();
// };

// export const sendOtpEmail = async (email, otp) => {
//     const transporter = nodemailer.createTransport({
//         service: 'gmail',
//         auth: {
//             user: process.env.EMAIL_USER,
//             pass: process.env.EMAIL_PASS,
//         },
//     });

//     const mailOptions = {
//         from: process.env.EMAIL_USER,
//         to: email,
//         subject: 'Your OTP Code',
//         text: `Your OTP code is: ${otp}. It will expire in 5 minutes.`,
//     };

//     await transporter.sendMail(mailOptions);
// };

// export const storeOtp = async (email, otp) => {
//     const hashedOtp = await argon2.hash(otp);
//     await mongoose.connect(process.env.MONGO_URL);

//     let user = await User.findOne({ email });
//     if (!user) throw new Error('User not found');

//     user.otp = hashedOtp;
//     user.otpExpiry = new Date(Date.now() + 5 * 60 * 1000);
//     await user.save();
// };

// export const verifyOtp = async (email, otp) => {
//     await mongoose.connect(process.env.MONGO_URL);
//     let user = await User.findOne({ email });
//     if (!user) throw new Error('User not found');

//     // if (!user.otp || !user.otpExpiry || user.otpExpiry < new Date()) {
//     //     throw new Error('OTP expired or not set');
//     // }
//     // Check if OTP exists and isn't expired
//     if (!user.otp || !user.otpExpiry) {
//         throw new Error('OTP not generated for this user');
//       }

//       const now = new Date();
//       if (user.otpExpiry < now) {
//         throw new Error('OTP has expired');
//       }

//       const isOtpValid = await argon2.verify(user.otp, otp);
//       if (!isOtpValid) {
//         throw new Error('Invalid OTP code');
//       }

//       // Clear OTP after successful verification
//       user.otp = undefined;
//       user.otpExpiry = undefined;
//       await user.save();
//     return true;
// };

// export const resendOtp = async (email, purpose) => {
//     try {
//       // Generate a new OTP
//       const otp = generateOtp();

//       // Send OTP via email
//       await sendOtpEmail(email, otp);

//       // Store OTP in the database or cache
//       await storeOtp(email, otp);

//       return { success: true, message: "OTP resent successfully" };
//     } catch (error) {
//       console.error("Error resending OTP:", error);
//       return { success: false, message: "Failed to resend OTP. Please try again." };
//     }
//   };
import nodemailer from "nodemailer";
import crypto from "crypto";
import argon2 from "argon2";
import User from "../models/User";
import mongoose from "mongoose";

// Database connection manager
const withDB = async () => {
  if (mongoose.connection.readyState !== 1) {
    await mongoose.connect(process.env.MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  }
};

export const generateOtp = () => {
  return crypto.randomInt(100000, 999999).toString();
};

export const sendOtpEmail = async (email, otp) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: `"Your App Name" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Your Verification Code",
      text: `Your OTP code is: ${otp}`,
      html: `
        <div>
          <h2>Your Verification Code</h2>
          <p>Use the following code to verify your account:</p>
          <h3 style="font-size: 24px; letter-spacing: 2px;">${otp}</h3>
          <p>This code will expire in 5 minutes.</p>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`OTP email sent to ${email}`, info.messageId);
    return true;
  } catch (error) {
    console.error("Failed to send OTP email:", error);
    throw new Error("Failed to send verification email");
  }
};

export const storeOtp = async (email, otp) => {
  try {
    await withDB();
    const hashedOtp = await argon2.hash(otp);
    const expiryTime = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes from now

    const result = await User.updateOne(
      { email },
      {
        $set: {
          otp: hashedOtp,
          otpExpiry: expiryTime,
          updatedAt: new Date(),
        },
      }
    );

    if (result.matchedCount === 0) {
      throw new Error("User not found");
    }

    if (result.modifiedCount === 0) {
      console.warn("OTP storage: No changes made to user record");
    }

    console.log(`OTP stored for ${email}, expires at ${expiryTime}`);
    return true;
  } catch (error) {
    console.error("Error storing OTP:", error);
    throw new Error("Failed to store verification code");
  }
};

export const verifyOtp = async (email, otp) => {
  try {
    console.log("Emial and otp :", email, otp);
    await withDB();
    const user = await User.findOne({ email });

    if (!user) {
      throw new Error("User account not found");
    }

    // Debug logging
    console.log("OTP Verification Check:", {
      email,
      hasOtp: !!user.otp,
      expiryTime: user.otpExpiry,
      currentTime: new Date(),
    });

    if (!user.otp || !user.otpExpiry) {
      throw new Error("No verification code found. Please request a new one.");
    }

    if (new Date() > user.otpExpiry) {
      throw new Error(
        "Verification code has expired. Please request a new one."
      );
    }

    const isOtpValid = await argon2.verify(user.otp, otp);
    if (!isOtpValid) {
      throw new Error("Invalid verification code. Please try again.");
    }

    // Clear OTP after successful verification
    await User.updateOne(
      { email },
      {
        $unset: {
          otp: "",
          otpExpiry: "",
        },
        $set: {
          isEmailVerified: true,
          updatedAt: new Date(),
        },
      }
    );

    console.log(`OTP verified successfully for ${email}`);
    return true;
  } catch (error) {
    console.error("OTP Verification Error:", {
      email,
      error: error.message,
      timestamp: new Date(),
    });
    throw error;
  }
};

export const resendOtp = async (email) => {
  try {
    await withDB();

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      throw new Error("User not found");
    }

    // Generate and store new OTP
    const otp = generateOtp();
    await sendOtpEmail(email, otp);
    await storeOtp(email, otp);

    return Response.json({
      success: true,
      message: "Email successfully verified",
      user: {
        _id: updatedUser._id,
        email: updatedUser.email,
        fullName: updatedUser.fullName,
        role: updatedUser.role,
        image: updatedUser.image,
        phoneNumber: updatedUser.phoneNumber,
        isEmailVerified: updatedUser.isEmailVerified,
        approvalStatus: updatedUser.approvalStatus,
        createdAt: updatedUser.createdAt,
        updatedAt: updatedUser.updatedAt,
        // Add more fields as needed by Flutter
      },
    });
  } catch (error) {
    console.error("OTP Resend Error:", {
      email,
      error: error.message,
      timestamp: new Date(),
    });

    return {
      success: false,
      message: error.message || "Failed to send new verification code",
      email,
    };
  }
};
