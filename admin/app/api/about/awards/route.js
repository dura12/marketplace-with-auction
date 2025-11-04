import { Award } from "@/models/About";
import { connectToDB, isSuperAdmin } from "@/utils/functions";

export async function GET() {
    await connectToDB();
    // await isSuperAdmin();

  try {
    const data = await Award.find();
    return new Response(JSON.stringify({ success: true, data }), { status: 200 });
  } catch {
    return new Response(JSON.stringify({ success: false }), { status: 500 });
  }
}

export async function POST(req) {
    await connectToDB();
    await isSuperAdmin();

      try {
    const body = await req.json();
    const data = await Award.create(body);
    return new Response(JSON.stringify({ success: true, data }), { status: 201 });
  } catch {
    return new Response(JSON.stringify({ success: false }), { status: 500 });
  }
}

export async function PUT(req) {
  await connectToDB();
  await isSuperAdmin();

  try {
    const body = await req.json(); // body = array of awards

    // Delete all current awards
    await Award.deleteMany({});

    // Insert new awards
    const data = await Award.insertMany(body);

    return new Response(JSON.stringify({ success: true, data }), {
      status: 200,
    });
  } catch (error) {
    console.error("Error updating awards:", error);
    return new Response(JSON.stringify({ success: false }), { status: 500 });
  }
}

export async function DELETE(req) {
    await connectToDB();
    await isSuperAdmin();
    
    try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    await Award.findByIdAndDelete(id);
    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch {
    return new Response(JSON.stringify({ success: false }), { status: 500 });
  }
}
