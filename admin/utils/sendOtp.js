import nodemailer from 'nodemailer';
import crypto from 'crypto';
import argon2 from 'argon2';
import Admin from '../models/Admin';
import SuperAdmin from '../models/SuperAdmin';
import mongoose from 'mongoose';

export const generateOtp = () => {
    return crypto.randomInt(100000, 999999).toString();
};

export const sendOtpEmail = async (email, otp) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Your OTP Code',
        text: `Your OTP code is: ${otp}. It will expire in 5 minutes.`,
    };

    await transporter.sendMail(mailOptions);
};

export const storeOtp = async (email, otp) => {
    const hashedOtp = await argon2.hash(otp);
    await mongoose.connect(process.env.MONGO_URL);

    let user = await Admin.findOne({ email }) || await SuperAdmin.findOne({ email });
    if (!user) throw new Error('User not found');
    
    user.otp = hashedOtp;
    user.otpExpiry = new Date(Date.now() + 5 * 60 * 1000);
    await user.save();
};

export const verifyOtp = async (email, otp) => {
    await mongoose.connect(process.env.MONGO_URL);
    let user = await Admin.findOne({ email }) || await SuperAdmin.findOne({ email });
    if (!user) throw new Error('User not found');

    if (!user.otp || !user.otpExpiry || user.otpExpiry < new Date()) {
        throw new Error('OTP expired or not set');
    }

    const isOtpValid = await argon2.verify(user.otp, otp);
    if (!isOtpValid) throw new Error('Invalid OTP');

    user.otp = null;
    user.otpExpiry = null;
    await user.save();
    return true;
};

export const resendOtp = async (email, purpose) => {
    try {
      // Generate a new OTP
      const otp = generateOtp();
  
      // Send OTP via email
      await sendOtpEmail(email, otp);
  
      // Store OTP in the database or cache
      await storeOtp(email, otp);
  
      return { success: true, message: "OTP resent successfully" };
    } catch (error) {
      console.error("Error resending OTP:", error);
      return { success: false, message: "Failed to resend OTP. Please try again." };
    }
  };
  