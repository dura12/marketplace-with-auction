import mongoose, { Schema } from "mongoose";

const UserSchema = new Schema(
  {
    fullName: { type: String, required: true },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: { type: String, required: true },
    bio: { type: String },
    role: {
      type: String,
      enum: ["customer", "merchant"],
      default: "customer",
    },
    image: { type: String, default: "/default-avatar.png" },
    isBanned: { type: Boolean, default: false },
    bannedBy: {
      type: String,
      required: function () {
        return this.isBanned === true;
      },
    },
    stateName: { type: String, required: false },
    cityName: { type: String, required: false },
    phoneNumber: { type: String, required: false },
    isDeleted: { type: Boolean, default: false },
    trashDate: {
      type: Date,
      default: null,
      expires: 30 * 24 * 60 * 60, // 30 days in seconds
    },
    approvalStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
      required: function () {
        return this.role === "merchant";
      },
    },
    approvedBy: { type: String },
    tinNumber: {
      type: String,
      required: function () {
        return this.role === "merchant";
      },
    },
    uniqueTinNumber: {
      type: String,
      unique: true,
      sparse: true,
      required: function () {
        return this.approvalStatus === "approved";
      },
    },
    nationalId: {
      type: String,
      required: function () {
        return this.role === "merchant";
      },
    },
    account_name: {
      type: String,
      required: function () {
        return this.role === "merchant";
      },
    },
    account_number: {
      type: String,
      required: function () {
        return this.role === "merchant";
      },
    },
    bank_code: {
      type: String,
      required: function () {
        return this.role === "merchant";
      },
    },
    otp: { type: String, default: null },
    otpExpiry: { type: Date, default: null },
    isEmailVerified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const User = mongoose.models.User || mongoose.model("User", UserSchema);
export default User;
