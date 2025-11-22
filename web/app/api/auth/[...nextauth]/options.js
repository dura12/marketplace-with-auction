import CredentialsProvider from "next-auth/providers/credentials";
import mongoose from "mongoose";
import argon2 from "argon2";
import User from "@/models/User";
import { connectToDB } from "@/libs/functions";

export const options = {
  providers: [
    CredentialsProvider({
      name: "Email and Password",
      credentials: {
        email: {
          label: "Email:",
          type: "email",
          placeholder: "your-email@example.com",
        },
        password: {
          label: "Password:",
          type: "password",
          placeholder: "your-secure-password",
        },
      },
      async authorize(credentials) {

        await connectToDB();

        const user = await User.findOne({ email: credentials?.email })
          .select("-image -tinNumber -nationalId -uniqueTinNumber")
          .lean();
        console.log("User found:", user);

        if (!user) {
          throw new Error("No user found with this email");
        }

        const isPasswordValid = await argon2.verify(
          user.password,
          credentials.password
        );

        if (!isPasswordValid) {
          throw new Error("Invalid email or password");
        }

        if (!user.isEmailVerified) {
          throw new Error("Email not verified");
        }

        return {
          id: user._id,
          email: user.email,
          role: user.role,
          name: user.fullName || null,
        };
      },
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      if (session?.user) {
        session.user.id = token.id;
        session.user.role = token.role;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      console.log("Token in: ", token);3
      return token;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 1 day
  },
  cookies: null,
  useSecureCookies: false,
  // Enable JWT encryption
  jwt: {
    encryption: true,
    secret: process.env.NEXTAUTH_SECRET,
    maxAge: 24 * 60 * 60, // 1 day
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
};
