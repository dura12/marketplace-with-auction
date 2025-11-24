import { NextResponse } from 'next/server'
// import { getServerSession } from 'next-auth'
// import { authOptions } from '@/lib/auth'
import { connectToDB, userInfo } from '@/libs/functions'
import Order from '@/models/Order'
import mongoose from 'mongoose'

export async function GET(req, { params }) {
  try {
    await connectToDB()
    const session = await userInfo(req)
    
    if (!session) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    const orderId = params.id
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return NextResponse.json({ success: false, message: 'Invalid order ID' }, { status: 400 })
    }

    const order = await Order.findById(orderId)
    if (!order) {
      return NextResponse.json({ success: false, message: 'Order not found' }, { status: 404 })
    }

    // Check if the user has permission to view this order
    const isCustomer = session.role === 'customer'
    const isMerchant = session.role === 'merchant'
    
    if (isCustomer && order.customerDetail.customerId.toString() !== session._id.toString()) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 403 })
    }

    if (isMerchant && order.merchantDetail.merchantId.toString() !== session._id.toString()) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 403 })
    }

    return NextResponse.json({ success: true, order })
  } catch (error) {
    console.error('Error fetching order:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
} 