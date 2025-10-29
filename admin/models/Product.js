import mongoose, { Schema } from "mongoose";

const productSchema = new Schema(
  {
    merchantDetail: {
      merchantId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      merchantName: { type: String, required: true },
      merchantEmail: { type: String, required: true },
    },
    productName: { type: String, required: true },
    category: {
      categoryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
        required: true,
      },
      categoryName: { type: String, required: true },
    },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true },
    soldQuantity: { type: Number, default: 0 },
    description: { type: String, required: true },
    images: [{ type: String }],
    variant: [{ type: String }],
    size: [{ type: String }],
    brand: { type: String, default: "Hand Made" },
    location: {
      type: { type: String, default: "Point" },
      coordinates: { type: [Number], required: true },
    },
    review: [
      {
        customerId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        comment: { type: String, required: true },
        rating: { type: Number, min: 1, max: 5, required: true },
        createdDate: { type: Date, default: Date.now },
      },
    ],
    delivery: {
      type: String,
      enum: ["PERPIECE", "PERKG", "FREE", "PERKM", "FLAT"],
      required: true,
    },
    deliveryPrice: { type: Number, required: true },
    isBanned: { type: Boolean, default: false },
    banReason: {
      reason: { type: String },
      description: { type: String },
    },
    bannedAt: { type: Date },
    isDeleted: { type: Boolean, default: false },
    trashDate: {
      type: Date,
      default: null,
      expires: 30 * 60 * 60 * 60,
    },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Ensure the schema has a 2dsphere index for geospatial queries
productSchema.index({ location: "2dsphere" });

const Product =
  mongoose.models.Product || mongoose.model("Product", productSchema);
export default Product;
