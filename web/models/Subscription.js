import mongoose from "mongoose";

const SubscriptionSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  subscribedAt: { type: Date, default: Date.now },
});

const Subscription = mongoose.models.Subscription || mongoose.model("Subscription", SubscriptionSchema);

export default Subscription;
