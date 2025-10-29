const mongoose = require("mongoose")

const SubscriptionSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  subscribedAt: { type: Date, default: Date.now },
})

module.exports = mongoose.models.Subscription || mongoose.model("Subscription", SubscriptionSchema)
