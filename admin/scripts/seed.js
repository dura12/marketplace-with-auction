import mongoose from "mongoose";
import argon2 from "argon2";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Import models
import Admin from "../models/Admin.js";
import SuperAdmin from "../models/SuperAdmin.js";
import Announcement from "../models/Announcement.js";

// ===========================================
// SEED DATA
// ===========================================

// Super Admin
const superAdminData = {
  email: "superadmin@gebeya.com",
  fullname: "Gebeya Super Admin",
  phone: "+251911000001",
  image: "/avatars/super-admin.jpg",
  role: "superAdmin",
};

// Admins
const adminsData = [
  {
    email: "admin@gebeya.com",
    fullname: "Gebeya Admin",
    phone: "+251911000002",
    image: "/avatars/admin1.jpg",
    role: "admin",
    isBanned: false,
    isDeleted: false,
  },
  {
    email: "solomon.admin@gebeya.com",
    fullname: "Solomon Tadesse",
    phone: "+251911000003",
    image: "/avatars/solomon.jpg",
    role: "admin",
    isBanned: false,
    isDeleted: false,
  },
  {
    email: "hana.admin@gebeya.com",
    fullname: "Hana Girma",
    phone: "+251911000004",
    image: "/avatars/hana.jpg",
    role: "admin",
    isBanned: false,
    isDeleted: false,
  },
  {
    email: "mikias.admin@gebeya.com",
    fullname: "Mikias Alemayehu",
    phone: "+251911000005",
    image: "/avatars/mikias.jpg",
    role: "admin",
    isBanned: false,
    isDeleted: false,
  },
];

// Announcements
const announcementsData = [
  {
    title: "Welcome to Gebeya Admin Panel",
    description: "This is your central hub for managing the marketplace. Monitor orders, approve merchants, and manage products all in one place.",
    link: "/dashboard",
  },
  {
    title: "New Merchant Approval System",
    description: "We've updated the merchant approval process. Please review pending applications in the Merchants section.",
    link: "/merchants",
  },
  {
    title: "Auction Feature Guidelines",
    description: "Review our updated guidelines for approving auction listings. Ensure all auctions meet quality standards before approval.",
    link: "/auctions",
  },
  {
    title: "Holiday Schedule - Meskel 2024",
    description: "The support team will have reduced hours during Meskel celebrations. Please plan accordingly.",
    link: null,
  },
  {
    title: "Security Update Required",
    description: "Please ensure your account has two-factor authentication enabled for enhanced security.",
    link: "/settings/security",
  },
];

// ===========================================
// SEEDING FUNCTIONS
// ===========================================

async function clearDatabase() {
  console.log("🗑️  Clearing existing admin data...");
  
  await Promise.all([
    Admin.deleteMany({}),
    SuperAdmin.deleteMany({}),
    Announcement.deleteMany({}),
  ]);
  
  console.log("✅ Admin database cleared");
}

async function seedSuperAdmin() {
  console.log("👑 Seeding super admin...");
  
  const hashedPassword = await argon2.hash("SuperAdmin123!");
  
  const superAdmin = await SuperAdmin.create({
    ...superAdminData,
    password: hashedPassword,
  });
  
  console.log(`✅ Created super admin: ${superAdmin.email}`);
  return superAdmin;
}

async function seedAdmins() {
  console.log("👥 Seeding admins...");
  
  const hashedPassword = await argon2.hash("Admin123!");
  
  const adminsWithPassword = adminsData.map(admin => ({
    ...admin,
    password: hashedPassword,
  }));
  
  const admins = await Admin.insertMany(adminsWithPassword);
  console.log(`✅ Created ${admins.length} admins`);
  return admins;
}

async function seedAnnouncements() {
  console.log("📢 Seeding announcements...");
  
  const announcements = await Announcement.insertMany(announcementsData);
  console.log(`✅ Created ${announcements.length} announcements`);
  return announcements;
}

// ===========================================
// MAIN SEED FUNCTION
// ===========================================

async function seed() {
  try {
    console.log("\n🌱 Starting admin database seeding...\n");
    console.log(`📡 Connecting to: ${process.env.MONGO_URL}\n`);
    
    await mongoose.connect(process.env.MONGO_URL);
    console.log("✅ Connected to MongoDB\n");
    
    // Clear existing data
    await clearDatabase();
    
    // Seed admin data
    const superAdmin = await seedSuperAdmin();
    const admins = await seedAdmins();
    const announcements = await seedAnnouncements();
    
    console.log("\n" + "=".repeat(50));
    console.log("🎉 Admin database seeding completed!");
    console.log("=".repeat(50));
    console.log("\n📊 Summary:");
    console.log(`   • Super Admins: 1`);
    console.log(`   • Admins: ${admins.length}`);
    console.log(`   • Announcements: ${announcements.length}`);
    console.log("\n🔐 Admin Credentials:");
    console.log("   Super Admin: superadmin@gebeya.com / SuperAdmin123!");
    console.log("   Admin: admin@gebeya.com / Admin123!");
    console.log("\n");
    
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    throw error;
  } finally {
    await mongoose.disconnect();
    console.log("📡 Disconnected from MongoDB");
  }
}

// Run seeder
seed();
