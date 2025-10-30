import { connectToDB, isAdmin, isAdminOrSuperAdmin, isSuperAdmin, sendNotification } from "../../../utils/functions";
import Admin from "@/models/Admin";
import argon2 from 'argon2';

// GET: Fetch all admins
export async function GET(req) {
  try {
    await connectToDB();

    const url = new URL(req.url);
    const _id = url.searchParams.get("_id");
    const createdAt = url.searchParams.get("createdAt");
    const isBanned = url.searchParams.get("isBanned");
    const email = url.searchParams.get("email");
    const isDeleted = url.searchParams.get("isDeleted");

    // If fetching by _id, allow both superAdmin and admin roles
    if (_id) {
      isAdminOrSuperAdmin();
      const admin = await Admin.findById(_id);
      if (!admin) {
        return new Response(JSON.stringify({ message: "Admin not found" }), { status: 404 });
      }
      return new Response(JSON.stringify(admin), { status: 200 });
    }

    // For all other fetch operations, only superAdmin is allowed
    await isAdminOrSuperAdmin();

    let filter = {};

    if (createdAt) {
      filter.createdAt = { $gte: new Date(createdAt) };
    }
    if (isBanned) {
      filter.isBanned = isBanned ; 
    }
    if (email) {
      filter.email = email;
    }
    if (isDeleted) {
      filter.isDeleted = isDeleted ;
    }

    const admins = await Admin.find(filter);
    return new Response(JSON.stringify(admins), { status: 200 });

  } catch (error) {
    return new Response(
      JSON.stringify({
        message: error.message || "Error fetching admins",
      }),
      { status: error.message === "Unauthorized: Only superAdmins can perform this operation" ? 403 : 500 }
    );
  }
}

// Update Admin
export async function PUT(req) {
  try {
    await connectToDB();

    const { _id, isBanned, isDeleted, fullname, phone, password, banReason } = await req.json();

    if (!_id) {
      return new Response(JSON.stringify({ message: "User ID is required" }), { status: 400 });
    }

    const admin = await Admin.findById(_id);
    if (!admin) {
      return new Response(JSON.stringify({ message: "Admin not found" }), { status: 404 });
    }

    // SuperAdmin permission required to update isBanned
    if (typeof isBanned !== "undefined") {
      await isSuperAdmin();
    
      console.log("Ban reason: ", banReason);
    
      admin.isBanned = isBanned;
    
      if (isBanned) {
        admin.banReason = banReason; // ✅ Set before saving
      } else {
        admin.banReason = null; // ✅ Reset ban reason when unbanning
      }
    
      await admin.save(); // ✅ Save after setting banReason
    
      const action = isBanned ? "banned" : "restored";
      await sendNotification(admin.email, "admin", action);
    
      return new Response(JSON.stringify(admin), { status: 200 });
    }    

    // SuperAdmin permission required to restore a deleted admin
    if (isDeleted === false) {
      await isSuperAdmin();

      admin.isDeleted = false;
      admin.trashDate = null;
      await admin.save();

      return new Response(JSON.stringify(admin), { status: 200 });
    }

    // Admin can only update their own info (except restricted fields)
    await isAdmin();

    if (fullname) admin.fullname = fullname;
    if (phone) admin.phone = phone;

    if (password) {
      admin.password = await argon2.hash(password);
    }

    await admin.save();

    return new Response(JSON.stringify(admin), { status: 200 });

  } catch (error) {
    return new Response(
      JSON.stringify({ message: error.message || "Error updating admin" }),
      { status: error.message.includes("Unauthorized") ? 403 : 500 }
    );
  }
}

// // POST: Create a new admin
export async function POST(req) {
  try {
    await connectToDB();

    await isSuperAdmin(); 

    const { email, fullname, password, phone, createdBy } = await req.json();

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      console.log("Admin already exists: ", existingAdmin);
      return new Response(JSON.stringify({ message: "Admin already exists" }), { status: 400 });
    }

    // Hash the password
    const hashedPassword = await argon2.hash(password); 

    const newAdmin = await Admin.create({
      email,
      fullname,
      password: hashedPassword,
      phone,
      createdBy,
    });
    console.log("New admin created: ", newAdmin);

    // Send notification
    await sendNotification(newAdmin.email, "admin", "created", password);
    console.log("Notification sent successfully.");

    return new Response(JSON.stringify(newAdmin), { status: 201 });
  } catch (error) {
    return new Response(
      JSON.stringify({
        message: error.message || "Error creating admin",
      }),
      { status: error.message === "Unauthorized: Only superAdmins can perform this operation" ? 403 : 500 }
    );
  }
}

// // DELETE: Soft delete an admin
export async function DELETE(req) {
  try {
    await connectToDB(); 

    const { _id } = await req.json();

    if (!_id) {
      return new Response(JSON.stringify({ message: "User ID is required" }), { status: 400 });
    }

    const admin = await Admin.findById(_id); 
    if (!admin) {
      return new Response(JSON.stringify({ message: "Admin not found" }), { status: 404 });
    }

    await isSuperAdmin(); 

    if (!admin.isDeleted) {
      admin.isDeleted = true;
      admin.trashDate = new Date();
      await admin.save(); 
    } else {
      await Admin.findByIdAndDelete(_id); 
    }

    // Send notification
    await sendNotification(admin.email, "admin", "deleted");

    return new Response(JSON.stringify({ message: "Admin permanently deleted and stored in DeletedAdmin" }), { status: 200 });

  } catch (error) {
    return new Response(
      JSON.stringify({
        message: error.message || "Error deleting admin",
      }),
      { status: error.message === "Unauthorized: Only superAdmins can perform this operation" ? 403 : 500 }
    );
  }
}



