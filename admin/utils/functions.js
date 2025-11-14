import mongoose from "mongoose";
import nodemailer from "nodemailer";
import Admin from "@/models/Admin";
import SuperAdmin from "@/models/SuperAdmin";
import { getServerSession } from "next-auth";
import { options } from "../app/api/auth/[...nextauth]/options";
import Advertisement from "@/models/Advertisement";

export async function fetchUserData() {
  let data;
  try {
    const response = await fetch("/api/users");
    if (!response.ok) {
      throw new Error(`Server error: ${response.status}`);
    }

    const user = await response.json();

    if (user) {
      data = user;
      return data;
    } else {
      return {};
    }
  } catch (error) {
    console.error("Error fetching user data:", error);
  }
}

let isConnected = false;

export async function connectToDB() {
  if (isConnected) {
    console.log("Using existing database connection");
    return;
  }

  try {
    await mongoose.connect(process.env.MONGO_URL);

    isConnected = true;
    console.log("Database connected successfully");
  } catch (error) {
    console.error("Database connection failed:", error);
    throw new Error("Failed to connect to the database");
  }
}


// Utility function to check if the user has "superAdmin" role
export async function isSuperAdmin() {
  const userRole = await role();
  console.log("User role: ", userRole);
  if (userRole !== "superAdmin") {
    throw new Error(
      "Unauthorized: Only superAdmins can perform this operation"
    );
  }
}

export async function isAdmin() {
  const userRole = await role();
  if (userRole !== "admin") {
    throw new Error("Unauthorized: Only admins can perform this operation");
  }
}

export async function isAdminOrSuperAdmin() {
  const userRole = await role();
  if (userRole !== "admin" && userRole !== "superAdmin") {
    throw new Error(
      "Unauthorized: Only admins or superAdmins can perform this operation"
    );
  }
}

export async function userInfo() {
  const session = await getServerSession(options);
  const userEmail = session?.user?.email;
  if (!userEmail) {
    return false;
  }
  let userInfo = await Admin.findOne({ email: userEmail });
  if (!userInfo) {
    userInfo = await SuperAdmin.findOne({ email: userEmail });
  }
  if (!userInfo) {
    return false;
  }

  return userInfo;
}

export async function checkSession(email) {
  if (!email) {
    return new Response(JSON.stringify({ error: "User email is required." }), {
      status: 400,
    });
  }

  const session = await getServerSession(options);
  if (!session) {
    return new Response(
      JSON.stringify({ error: "Unauthorized. No session found." }),
      { status: 401 }
    );
  }

  const sessionEmail = session?.user?.email;

  if (sessionEmail !== email) {
    return new Response(JSON.stringify({ error: "Unauthorized access." }), {
      status: 403,
    });
  }

  return null;
}

// Create a common email transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * Sends an email notification based on the user type and action.
 * @param {string} to - The recipient's email.
 * @param {string} userType - Either "admin" or "user".
 * @param {string} action - Action type: "created", "deleted", "banned", "restored", "approved".
 * @param {string} [password] - The password (only required for "created" action).
 */
export async function sendNotification(to, userType, action, password = "") {
  const contactEmail = process.env.EMAIL_USER;
  let subject, text;  

  switch (action) {
    case "created":
      subject = `Your ${
        userType === "admin" ? "Admin" : "User"
      } Account Has Been Created`;
      text = `Hello,\n\nYour ${userType} account has been successfully created.\n\nEmail: ${to}\n${
        password
          ? `Password: ${password}\n\nPlease log in and change your password for security reasons.`
          : ""
      }\n\nBest regards,\nSupport Team`;
      break;

    case "deleted":
      subject = `Your ${
        userType === "admin" ? "Admin" : "User"
      } Account Has Been Deleted`;
      text = `Hello,\n\nYour ${userType} account has been deleted. If you believe this was a mistake, please contact our support team via ${contactEmail}.\n\nBest regards,\nSupport Team`;
      break;

    case "banned":
      subject = `Your ${
        userType === "admin" ? "Admin" : "User"
      } Account Has Been Banned`;
      text = `Hello,\n\nYour ${userType} account has been banned by the administrators for an unknown duration.\nIf you have any questions, please contact support at ${contactEmail}.\n\nBest regards,\nSupport Team`;
      break;

    case "restored":
      subject = `Your ${
        userType === "admin" ? "Admin" : "User"
      } Account Has Been Restored`;
      text = `Hello,\n\nYour ${userType} account has been successfully restored by the administrators. You can now log in as usual.\n\nBest regards,\nSupport Team`;
      break;

    case "unbanned":
      subject = `Your ${
        userType === "admin" ? "Admin" : "User"
      } Account Has Been Unbanned`;
      text = `Hello,\n\nYour ${userType} account has been successfully Unbanned by the administrators. You can now log in as usual.\n\nBest regards,\nSupport Team`;
      break;

    case "approved":
      if (userType === "user") {
        subject = "Your Account Has Been Approved!";
        text = `Hello,\n\nYour account has been approved! You can now access all seller features.\n\nBest regards,\nSupport Team`;
      } else {
        throw new Error("Invalid action for admin");
      }
      break;
    case "rejected":
      if (userType === "user") {
        subject = "Your Account Has Been Rejected!";
        text = `Hello,\n\nYour account has been rejected! You can now access all seller features.\n\nBest regards,\nSupport Team`;
      } else {
        throw new Error("Invalid action for admin");
      }
      break;

    default:
      throw new Error("Invalid action type");
  }

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject,
    text,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${to} for ${userType} action: ${action}`);
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error("Failed to send email");
  }
}

const deactivateExpiredAds = async () => {
  try {
    await connectToDB();

    const now = new Date();

    const result = await Advertisement.updateMany(
      {
        isActive: true,
        approvalStatus: "APPROVED",
        endsAt: { $lt: now },
      },
      { $set: { isActive: false } }
    );

    console.log(
      `[EXPIRED ADS CLEANER]: ${result.modifiedCount} ads deactivated.`
    );
    return { success: true, modified: result.modifiedCount };
  } catch (error) {
    console.error("[EXPIRED ADS CLEANER ERROR]:", error.message);
    return { success: false, error: error.message };
  }
};

export default deactivateExpiredAds;

export async function role() {
  await connectToDB();
  const session = await getServerSession(options);
  console.log("session: ", session);

  if (!session?.user?.email) {
    return null;
  }

  const user =
    (await Admin.findOne({ email: session.user.email })) ||
    (await SuperAdmin.findOne({ email: session.user.email }));

  return user?.role || null;
}
