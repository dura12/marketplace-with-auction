import { Hero } from "@/models/About";
import { connectToDB } from "@/libs/functions";

export async function GET(req) {
    await connectToDB();

    try {
      const data = await Hero.findOne();
      return new Response(JSON.stringify({ success: true, data }), { status: 200 });
    } catch {
      return new Response(JSON.stringify({ success: false }), { status: 500 });
    }
  }
  

  
export async function PUT(req) {
    await connectToDB();

    try {
      const body = await req.json();
      const data = await Hero.findOneAndUpdate({}, body, { new: true, upsert: true });
      return new Response(JSON.stringify({ success: true, data }), { status: 200 });
    } catch {
      return new Response(JSON.stringify({ success: false }), { status: 500 });
    }
}
  

  