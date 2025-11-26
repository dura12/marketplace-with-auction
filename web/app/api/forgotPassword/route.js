import User from "@/models/User";
import crypto from "crypto";
import nodemailer from "nodemailer";
import { connectToDB } from "@/libs/functions";  

const RESET_TOKEN_EXPIRY = "1h"; 

export async function POST(req) {
    try {
        const { email } = await req.json();

        // Connect to the database
        await connectToDB();
        // Check if user exists
        const user = await User.findOne({ email });
        if (!user) {
            return new Response(JSON.stringify({ error: "User not found." }), { status: 404 });
        }
        // Generate a short reset token using crypto.randomBytes
        const resetToken = crypto.randomBytes(15).toString('hex'); 

        // Set token and expiry in the user document
        user.otp = resetToken;
        user.otpExpires = Date.now() + 3600000; // 1 hour from now
        await user.save();
        // Send reset token to the user's email
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS, 
            },
        });

        // Create the reset URL
        const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${resetToken}`;

        // Email content
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: "Password Reset Request",
            text: `Forgot your password? Click on the following link to reset your password: ${resetUrl}. The link will expire in 1 hour.`,
        };

        // Send the email
        await transporter.sendMail(mailOptions);
        console.log("Password reset email sent successfully.");

        return new Response(JSON.stringify({ message: "Password reset email sent." }), { status: 200 });
    } catch (err) {
        console.error("Error in forgot password API: ", err.message);
        return new Response(JSON.stringify({ error: "Internal server error." }), { status: 500 });
    }
}