import CredentialsProvider from 'next-auth/providers/credentials';
import argon2 from 'argon2';
import Admin from '@/models/Admin';
import SuperAdmin from '@/models/SuperAdmin';
import { connectToDB } from '@/utils/functions';
import { verifyOtp } from '@/utils/sendOtp';

export const options = {
  providers: [
    CredentialsProvider({
      name: 'Email and Password',
      credentials: {
        email: { label: 'Email:', type: 'email', placeholder: 'your-email@example.com' },
        password: { label: 'Password:', type: 'password', placeholder: 'your-secure-password' },
        otp: { label: 'OTP:', type: 'text', placeholder: '123456' },
      },
      async authorize(credentials) {
        await connectToDB();

        // Find the user in Admin or SuperAdmin collections
        let user = await Admin.findOne({ email: credentials?.email }) || await SuperAdmin.findOne({ email: credentials?.email });
        if (!user) throw new Error('Invalid email or password');

        // Verify the password
        const isPasswordValid = await argon2.verify(user.password, credentials.password);
        if (!isPasswordValid) throw new Error('Invalid email or password');

        // Verify the OTP (skip in development if OTP not provided)
        if (credentials.otp) {
          try {
            await verifyOtp(credentials.email, credentials.otp);
          } catch (error) {
            throw new Error('Invalid OTP');
          }
        } else if (process.env.NODE_ENV === 'production') {
          throw new Error('OTP is required');
        }

        // Return user object for session
        return { id: user._id.toString(), email: user.email, role: user.role || 'admin', name: user.fullname };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.role = user.role;
        token.name = user.name;
      }
      return token;
    },
    async session({ session, token }) {
      if (session?.user) {
        session.user.id = token.id;
        session.user.email = token.email;
        session.user.role = token.role;
        session.user.name = token.name;
      }
      return session;
    },
  },
  pages: {
    signIn: '/signin',
  },
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 1 day
  },
  jwt: {
    maxAge: 24 * 60 * 60, // 1 day
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
};