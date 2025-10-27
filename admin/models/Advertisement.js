import mongoose from "mongoose";

const AdSchema = new mongoose.Schema(
  {
    product: {
      type: Object,
      required: true,
    },
    merchantDetail: {
      type: Object,
      required: true,
    },
    startsAt: {
      type: Date,
      required: true,
    },
    endsAt: {
      type: Date,
      required: true,
    },
    adPrice: {
      type: Number,
      required: true,
    },
    tx_ref: {
      type: String,
      required: true,
      unique: true,
    },
    chapaRef: { type: String },
    approvalStatus: {
      type: String,
      enum: ["PENDING", "APPROVED", "REJECTED"],
      default: "PENDING",
    },
    paymentStatus: {
      type: String,
      enum: ["PENDING", "PAID", "FAILED"],
      default: "PENDING",
    },
    rejectionReason: {
      reason: { type: String },
      description: { type: String },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isHome: {
      type: Boolean,
      default: false,
    },
    adRegion: {
      type: String,
      required: true,
    },
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
      },
    },
  },
  { timestamps: true }
);

// Create 2dsphere index for geospatial queries
AdSchema.index({ location: "2dsphere" });

export default mongoose.models.Advertisement || mongoose.model("Advertisement", AdSchema);