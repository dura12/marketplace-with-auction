import { Cta } from "@/models/About";
import { connectToDB, isSuperAdmin } from "@/utils/functions";

export async function GET() {
  await connectToDB();
  // await isSuperAdmin();

  try {
    const data = await Cta.findOne();
    return new Response(JSON.stringify({ success: true, data }), {
      status: 200,
    });
  } catch {
    return new Response(JSON.stringify({ success: false }), { status: 500 });
  }
}

export async function POST(req) {
  await connectToDB();
  // await isSuperAdmin();

  try {
    const body = await req.json();
    const data = await Cta.create(body);
    return new Response(JSON.stringify({ success: true, data }), {
      status: 201,
    });
  } catch {
    return new Response(JSON.stringify({ success: false }), { status: 500 });
  }
}

export async function PUT(req) {
  await connectToDB();
  // await isSuperAdmin();

  try {
    const body = await req.json();
    const data = await Cta.findOneAndUpdate({}, body, {
      new: true,
      upsert: true,
    });
    return new Response(JSON.stringify({ success: true, data }), {
      status: 200,
    });
  } catch {
    return new Response(JSON.stringify({ success: false }), { status: 500 });
  }
}

export async function DELETE() {
  await connectToDB();
  // await isSuperAdmin();

  try {
    await Cta.deleteMany();
    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch {
    return new Response(JSON.stringify({ success: false }), { status: 500 });
  }
}
