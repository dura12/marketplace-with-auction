import { connectToDB, userInfo } from '@/libs/functions'
import Notification from '@/models/Notification'
import { NextResponse } from 'next/server'

export async function PUT(req) {
    try {
        await connectToDB()
        const user = await userInfo(req)
        
        if (!user) {
            return NextResponse.json(
                { message: 'Unauthorized' },
                { status: 401 }
            )
        }

        await Notification.updateMany(
            {
                userId: user._id,
                read: false
            },
            { $set: { read: true } }
        )

        return NextResponse.json({ message: 'All notifications marked as read' })
    } catch (error) {
        console.error('Error marking all notifications as read:', error)
        return NextResponse.json(
            { message: 'Failed to mark all notifications as read' },
            { status: 500 }
        )
    }
} 