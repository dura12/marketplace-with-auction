import { TeamMember } from "@/models/About";
import { connectToDB, isSuperAdmin } from "@/utils/functions";

export async function GET() {
  await connectToDB();
  // await isSuperAdmin();

  try {
    const data = await TeamMember.find();
    return new Response(JSON.stringify({ success: true, data }), {
      status: 200,
    });
  } catch {
    return new Response(JSON.stringify({ success: false }), { status: 500 });
  }
}

export async function POST(req) {
  await connectToDB();
  await isSuperAdmin();

  try {
    const body = await req.json();
    const data = await TeamMember.create(body);
    return new Response(JSON.stringify({ success: true, data }), {
      status: 201,
    });
  } catch {
    return new Response(JSON.stringify({ success: false }), { status: 500 });
  }
}

export async function PUT(req) {
  await connectToDB();
  await isSuperAdmin();

  try {
    const members = await req.json();

    await TeamMember.deleteMany({});

    const inserted = await TeamMember.insertMany(members);

    return new Response(JSON.stringify({ success: true, data: inserted }), {
      status: 200,
    });
  } catch (err) {
    console.error("Error updating team members:", err);
    return new Response(JSON.stringify({ success: false }), { status: 500 });
  }
}

export async function DELETE(req) {
  await connectToDB();
  await isSuperAdmin();

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return new Response(JSON.stringify({ success: false, message: "Missing ID" }), { status: 400 });
    }

    await TeamMember.findByIdAndDelete(id);

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (err) {
    console.error("Error deleting team member:", err);
    return new Response(JSON.stringify({ success: false }), { status: 500 });
  }
}
