import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  customerDetail: {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    customerName: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    customerEmail: { type: String, required: true },
    address: {
      state: { type: String, required: true },
      city: { type: String, required: true },
    },
  },
  merchantDetail: {
    merchantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    merchantName: { type: String, required: true },
    merchantEmail: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    account_name: { type: String, required: true },
    account_number: { type: String, required: true },
    merchantRefernce: { type: String, required: false, default: null },
    bank_code: { type: String, required: true },
  },
  products: [
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
      },
      productName: { type: String, required: true },
      quantity: { type: Number, required: true },
      price: { type: Number, required: true },
      delivery: {
        type: String,
        enum: ["PERPIECE", "PERKG", "FREE", "PERKM", "FLAT"],
        required: true,
      },
      deliveryPrice: { type: Number, required: true },
      categoryName: { type: String },
    },
  ],
  auction: {
    auctionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: function () {
        return !(this.products && this.products.length > 0); // Required if products is empty
      },
    },
    delivery: {
      type: String,
      enum: ["PAID", "FREE"],
      required: function () {
        return this.auction && this.auction.auctionId; // Required if auctionId exists
      },
    },
    deliveryPrice: {
      type: Number,
      required: function () {
        return this.auction && this.auction.auctionId; // Required if auctionId exists
      },
    },
  },
  totalPrice: { type: Number, required: true },
  status: {
    type: String,
    enum: ["Pending", "Dispatched", "Received"],
    default: "Pending",
  },
  paymentStatus: {
    type: String,
    enum: ["Pending", "Paid", "Paid To Merchant", "Pending Refund", "Refunded"],
    default: "Pending",
  },
  location: {
    type: { type: String, default: "Point" },
    coordinates: { type: [Number], required: true },
  },
  transactionRef: { type: String, required: true },
  chapaRef: {
    type: String,
    required: function () {
      return this.paymentStatus === "Paid";
    },
  },
  orderDate: { type: Date, default: Date.now },
  refundReason: { type: String, required: false },
});

// Custom validation to ensure at least one of products or auction exists
orderSchema.pre("validate", function (next) {
  const hasProducts = this.products && this.products.length > 0;
  const hasAuction = this.auction && this.auction.auctionId;

  if (!hasProducts && !hasAuction) {
    return next(new Error("Order must contain either products or an auction."));
  }
  next();
});

// Ensure products array is not required unless auction is absent
orderSchema.path("products").validate(function (value) {
  const hasAuction = this.auction && this.auction.auctionId;
  const hasProducts = value && value.length > 0;

  // If no auction, products must exist
  if (!hasAuction && !hasProducts) {
    return false;
  }
  return true;
}, "Products are required when no auction is present.");

const Order = mongoose.models.Order || mongoose.model("Order", orderSchema);
export default Order;
