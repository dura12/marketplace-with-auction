import { sendEmail } from '../../../libs/sendEmail';
import { NextResponse } from 'next/server';

export async function POST(request) {
  const { name, email, subject, message } = await request.json();
  const text = `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`;
  try {
    await sendEmail(email, process.env.EMAIL_USER, subject, text);
    return NextResponse.json({ message: 'Email sent successfully' }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Failed to send email' }, { status: 500 });
  }
}
