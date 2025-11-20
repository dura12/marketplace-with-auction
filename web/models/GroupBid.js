import mongoose from "mongoose";

const groupSchema = new mongoose.Schema({
    auctionId: { type: mongoose.Schema.Types.ObjectId, required: true },
    teamLeaderEmail: { type: String, required: true }, // User who created the team
    teamMembers: [{
        email: { type: String, required: true },
        status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
    }],
    totalBidAmount: { type: Number, default: 0 }, // Combined bid amount from all team members
    status: { type: String, enum: ['active', 'won', 'lost'] },
});
const GroupBid = mongoose.models.GroupBid || mongoose.model('GroupBid', groupSchema);
export default GroupBid;