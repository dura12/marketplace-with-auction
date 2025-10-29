import mongoose from "mongoose";

const superAdminSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  fullname: { type: String, required: true },
  password: { type: String, required: true },
  phone: { type: String, default: null },
  image: { type: String, required: false },
  role: { type: String, default: 'superAdmin' },
  otp: { type: String, default: null },
  otpExpiry: { type: Date, default: null },
}, { timestamps: true });

const SuperAdmin = mongoose.models.SuperAdmin || mongoose.model('SuperAdmin', superAdminSchema);
export default SuperAdmin;

