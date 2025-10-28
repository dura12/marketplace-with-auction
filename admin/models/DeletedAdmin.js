import mongoose from "mongoose";

const DeletedAdminSchema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  email: String,
  fullname: String,
  phone: String,
  createdBy: mongoose.Schema.Types.ObjectId,
  createdAt: Date,
  deletedAt: { type: Date, default: Date.now },
});

export default mongoose.models.DeletedAdmin || mongoose.model("DeletedAdmin", DeletedAdminSchema);
