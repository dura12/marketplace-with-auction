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

        // Verify the OTP
        if (!credentials.otp) throw new Error('OTP is required');
        try {
          await verifyOtp(credentials.email, credentials.otp);
        } catch (error) {
          throw new Error('Invalid OTP');
        }

        // Return user object for session
        return { id: user._id, email: user.email, role: user.role || null };
      },
    }),
  ],
};