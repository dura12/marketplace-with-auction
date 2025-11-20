import mongoose from 'mongoose'

const notificationSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['bid', 'outbid', 'won', 'ending', 'system'],
        required: true
    },
    read: {
        type: Boolean,
        default: false
    },
    data: {
        auctionId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Auction'
        },
        bidAmount: Number,
        bidderName: String,
        bidderEmail: String
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true })

// Indexes for better query performance
notificationSchema.index({ userId: 1, read: 1 })
notificationSchema.index({ userId: 1, createdAt: -1 })
notificationSchema.index({ 'data.auctionId': 1 })

const Notification = mongoose.models.Notification || mongoose.model('Notification', notificationSchema)
export default Notification 