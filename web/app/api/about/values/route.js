import { Value } from "@/models/About";
import { connectToDB } from "@/libs/functions";

export async function GET() {
    await connectToDB();   

    try {
      const data = await Value.find();
      return new Response(JSON.stringify({ success: true, data }), { status: 200 });
    } catch {
      return new Response(JSON.stringify({ success: false }), { status: 500 });
    }
  }
  
  
  
  
  