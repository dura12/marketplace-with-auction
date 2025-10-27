import mongoose from "mongoose";

const adminSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  fullname: { type: String, required: true },
  password: { type: String, required: true },
  phone: { type: String, default: null },
  role: { type: String, default: 'admin' },
  image: { type: String, required: false },
  isBanned: { type: Boolean, default: false },
  isDeleted: { type: Boolean, default: false },
  trashDate: { type: Date, default: null, expires: 30 * 24 * 60 * 60 },
  otp: { type: String, default: null },
  otpExpiry: { type: Date, default: null },
  banReason: { type: String},
}, { timestamps: true });

const Admin = mongoose.models.Admin || mongoose.model('Admin', adminSchema);
export default Admin;