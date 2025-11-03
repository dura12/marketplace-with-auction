import Announcement from "@/models/Announcement";
import { connectToDB, userInfo, isSuperAdmin } from "@/utils/functions";
import { NextResponse } from "next/server";

export async function GET() {
    await connectToDB();

    const user = await userInfo();
    const announcements = await Announcement.find().sort({ createdAt: -1 });
  
    const result = announcements.map(a => ({
      _id: a._id,
      title: a.title,
      description: a.description,
      link: a.link,
      createdAt: a.createdAt,
      readersCount: a.readBy.length,
      isRead: a.readBy.includes(user._id)
    }));

    return NextResponse.json(result);
  }
  
export async function POST(req) {
  await connectToDB();
  await isSuperAdmin();

  const body = await req.json();
  const { title, description, link } = body;

  const newAnn = await Announcement.create({ title, description, link });
  return NextResponse.json(newAnn, { status: 201 });
}
  
// PUT: mark an announcement as read
export async function PUT(req) {
  await connectToDB();
  
  const body = await req.json();
  const { announcementId } = body;
  const user = await userInfo();

  await Announcement.findByIdAndUpdate(announcementId, {
    $addToSet: { readBy: user._id }
  });

  return NextResponse.json({ success: true });
}

// DELETE: clear all readBy for the user
export async function DELETE() {
  await connectToDB();
  
  const user = await userInfo();
    
  await Announcement.updateMany({}, { $pull: { readBy: user._id } });
  return NextResponse.json({ success: true });
}