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
    variant: [{ type: String }], // Optional list of colors
    size: [{ type: String }], // Optional list of sizes
    brand: { type: String, default: "Hand Made" }, // Optional list of brand
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
    weight: { type: Number, default: 0 },
    KilogramPerPrice: { type: Number, default: null },
    KilometerPerPrice: { type: Number, default: null }, // Price per kilometer for PERKM delivery type
    isBanned: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
    offer: {
      price: { type: Number, default: null },
      offerEndDate: { type: Date, default: null },
    },
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

// Add text index for weighted search on relevant fields
productSchema.index(
  {
    productName: "text",
    description: "text",
    "category.categoryName": "text",
    "merchantDetail.merchantName": "text",
    delivery: "text",
  },
  {
    weights: {
      productName: 10, // Higher weight for productName
      description: 5, // Medium weight for description
      "category.categoryName": 3, // Lower weight for category name
      "merchantDetail.merchantName": 2, // Lower weight for merchant name
      delivery: 1, // Lowest weight for delivery
    },
    name: "productTextIndex", // Optional: name the index for reference
  }
);

const Product =
  mongoose.models.Product || mongoose.model("Product", productSchema);
export default Product;
