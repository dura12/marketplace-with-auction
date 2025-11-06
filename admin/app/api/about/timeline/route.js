import { TimelineEvent } from "@/models/About";
import { updateTimelineEvents } from "@/utils/about";
import { connectToDB, isSuperAdmin } from "@/utils/functions";

export async function GET() {
  await connectToDB();
  // await isSuperAdmin();

  try {
    const data = await TimelineEvent.find();
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
    const data = await TimelineEvent.create(body);
    return new Response(JSON.stringify({ success: true, data }), { status: 201 });
  } catch {
    return new Response(JSON.stringify({ success: false }), { status: 500 });
  }
}

export async function PUT(req) {
  await connectToDB();
  await isSuperAdmin();

  try {
    const body = await req.json();
    console.log("Body: ", body);

    await TimelineEvent.deleteMany({});

    const updatedTimelineEvents = await TimelineEvent.insertMany(body.events);

    console.log("Updated data: ", updatedTimelineEvents); // Correct variable name here
    return new Response(JSON.stringify({ success: true, data: updatedTimelineEvents }), { status: 200 });
  } catch (error) {
    console.error("Error updating timeline events:", error);
    return new Response(
      JSON.stringify({ success: false, message: error.message || "Error updating timeline events" }),
      { status: 500 }
    );
  }
}

export async function DELETE(req) {
  await connectToDB();
  await isSuperAdmin();  
  
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    await TimelineEvent.findByIdAndDelete(id);
    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch {
    return new Response(JSON.stringify({ success: false }), { status: 500 });
  }
}
