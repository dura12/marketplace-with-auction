import { NextResponse } from "next/server"
import { connectToDB } from "@/utils/functions"
import Subscription from "@/models/Subscription"

export async function GET() {
  await connectToDB()
  try {
    const subscriptions = await Subscription.find().sort({ subscribedAt: -1 })
    return NextResponse.json({ data: subscriptions }, { status: 200 })
  } catch (err) {
    return NextResponse.json({ error: "Failed to fetch subscribers" }, { status: 500 })
  }
}

export async function POST(req) {
  await connectToDB()
  const { email } = await req.json()

  if (!email || typeof email !== "string") {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 })
  }

  try {
    const exists = await Subscription.findOne({ email })
    if (exists) {
      return NextResponse.json({ message: "Already subscribed" }, { status: 200 })
    }

    const subscription = await Subscription.create({ email })
    return NextResponse.json({ message: "Subscribed successfully", data: subscription }, { status: 201 })
  } catch (err) {
    return NextResponse.json({ error: "Failed to subscribe" }, { status: 500 })
  }
}
