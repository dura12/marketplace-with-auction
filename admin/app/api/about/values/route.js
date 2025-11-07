import { Value } from "@/models/About";
import { updateValues } from "@/utils/about";
import { connectToDB, isSuperAdmin } from "@/utils/functions";

export async function GET() {
    await connectToDB();
    // await isSuperAdmin();    

    try {
      const data = await Value.find();
      return new Response(JSON.stringify({ success: true, data }), { status: 200 });
    } catch {
      return new Response(JSON.stringify({ success: false }), { status: 500 });
    }
  }
  
  // export async function POST(req) {
  //   await connectToDB();
  //   await isSuperAdmin();    
    
  //   try {
  //     const body = await req.json();
  //     const data = await Value.create(body);
  //     return new Response(JSON.stringify({ success: true, data }), { status: 201 });
  //   } catch {
  //     return new Response(JSON.stringify({ success: false }), { status: 500 });
  //   }
  // }
  
  export async function PUT(req) {
    await connectToDB();
    await isSuperAdmin();
  
    try {
      const body = await req.json();
      const data = await Value.deleteMany({});
      
      // Now insert the new values into the database
      const updatedValues = await Value.insertMany(body);
      console.log("Update datas in values: ", updateValues);
  
      return new Response(JSON.stringify({ success: true, data: updatedValues }), { status: 200 });
    } catch (error) {
      console.error("Error updating values:", error);
      return new Response(
        JSON.stringify({ success: false, message: error.message || "Error updating values" }),
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
      await Value.findByIdAndDelete(id);
      return new Response(JSON.stringify({ success: true }), { status: 200 });
    } catch {
      return new Response(JSON.stringify({ success: false }), { status: 500 });
    }
  }
  