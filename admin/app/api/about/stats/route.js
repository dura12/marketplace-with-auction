import { Stat } from "@/models/About";
import { connectToDB, isSuperAdmin } from "@/utils/functions";

export async function GET() {
    await connectToDB();
    // await isSuperAdmin();    

    try {
      const data = await Stat.find();
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
      const data = await Stat.create(body);
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

      await Stat.deleteMany({});
  
      const updatedStats = await Stat.insertMany(body);
  
      return new Response(JSON.stringify({ success: true, data: updatedStats }), { status: 200 });
    } catch (error) {
      console.error("Error updating stats:", error);
      return new Response(
        JSON.stringify({ success: false, message: error.message || "Error updating stats" }),
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
      await Stat.findByIdAndDelete(id);
      return new Response(JSON.stringify({ success: true }), { status: 200 });
    } catch {
      return new Response(JSON.stringify({ success: false }), { status: 500 });
    }
  }
  