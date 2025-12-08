import nodemailer from 'nodemailer';

export async function sendEmail(from, to, subject, text) {
    try {
        console.log("Email User:", process.env.EMAIL_USER);
        console.log("Email Pass Exists:", !!process.env.EMAIL_PASS); 
        const transporter = nodemailer.createTransport({
            service: "Gmail",
            auth: {
                user: process.env.EMAIL_USER, // Your email address
                pass: process.env.EMAIL_PASS, // Your email password or app password
            },
        });

        const mailOptions = {
            from: from, // User's email address
            to: to, // Configured email address
            subject,
            text,
        };

        await transporter.sendMail(mailOptions);
        console.log(`📧 Email sent to ${to}`);
    } catch (error) {
        console.error("❌ Error sending email:", error);
    }
};
