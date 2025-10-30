import { connectToDB, isAdmin, sendNotification, userInfo, isAdminOrSuperAdmin } from "../../../utils/functions";
import User from "../../../models/User";

export async function GET(req) {
  try {
    await isAdminOrSuperAdmin();

    await connectToDB();

    const url = new URL(req.url);
    const _id = url.searchParams.get("_id");
    const email = url.searchParams.get("email");
    const fullName = url.searchParams.get("fullName");
    const isBanned = url.searchParams.get("isBanned");
    const role = url.searchParams.get("role");
    const approvalStatus = url.searchParams.get("approvalStatus");
    const stateName = url.searchParams.get("stateName");
    const cityName = url.searchParams.get("cityName");
    const approvedBy = url.searchParams.get("approvedBy");
    const bannedBy = url.searchParams.get("bannedBy");

    // Build the filter object dynamically
    let filter = {};
    if (_id) filter._id = _id;
    if (email) filter.email = email;
    if (fullName) filter.fullName = { $regex: fullName, $options: "i" };
    if (isBanned) filter.banned = isBanned === "true"; 
    if (role) filter.role = role;
    if (approvedBy) filter.approvedBy = approvedBy;
    if (bannedBy) filter.bannedBy = bannedBy;
    if (approvalStatus) filter.approvalStatus = approvalStatus === "true";
    if (stateName) filter.stateName = { $regex: stateName, $options: "i" }; 
    if (cityName) filter.cityName = { $regex: cityName, $options: "i" }; 

    // Fetch users based on the filter
    const users = await User.find(filter);

    return new Response(JSON.stringify(users), { status: 200 });
  } catch (error) {
    console.error("Error occurred:", error.message);
    return new Response(
      JSON.stringify({ message: error.message || "Error fetching users" }),
      { status: 500 }
    );
  }
}

export async function PUT(req) {
  try {
    await isAdminOrSuperAdmin();
    await connectToDB();

    const userData = await userInfo();
    
    const { action, userId, data, uniqueTin } = await req.json();
    console.log("User ID and actions: ", action, userId, data);

    if (!userId || !action) {
      return new Response(JSON.stringify({ message: "User ID and action are required" }), { status: 400 });
    }

    const user = await User.findById(userId);
    if (!user) {
      return new Response(JSON.stringify({ message: "User not found" }), { status: 404 });
    }

    switch (action) {
      case "approve":
        console.log("Unique Tin: ", uniqueTin);
        user.approvalStatus = "approved";
        user.approvedBy = userData.email;
        user.rejectionReason = null;
        if (user) {
          user.uniqueTinNumber = uniqueTin;
        } else {
          user.uniqueTinNumber = uniqueTin ;
        }        console.log("Updated user: ", user)
        await user.save();
        await sendNotification(user.email, "user", "approved");
        return new Response(JSON.stringify({ message: "User approved" }), { status: 200 });

      case "reject":
        if (!data || !data.rejectionReason || !data.rejectionReason.reason) {
          return new Response(JSON.stringify({ message: "Rejection reason is required" }), { status: 400 });
        }
        user.approvalStatus = "rejected";
        user.rejectionReason = {
          reason: data.rejectionReason.reason,
          description: data.rejectionReason.description || "",
        };
        user.approvedBy = null;
        await user.save();
        await sendNotification(user.email, "user", "rejected");
        return new Response(JSON.stringify({ message: "User rejected" }), { status: 200 });

      case "ban":
        if (!data || !data.banReason || !data.banReason.reason) {
          return new Response(JSON.stringify({ message: "Ban reason is required" }), { status: 400 });
        }
        user.isBanned = true;
        user.banReason = {
          reason: data.banReason.reason,
          description: data.banReason.description || "",
        };
        user.bannedBy = userData.email;
        await user.save();
        await sendNotification(user.email, "user", "banned");
        return new Response(JSON.stringify({ message: "User banned" }), { status: 200 });

      case "unban":
        user.isBanned = false;
        user.banReason = null;
        user.bannedBy = null;
        await user.save();
        await sendNotification(user.email, "user", "unbanned");
        return new Response(JSON.stringify({ message: "User unbanned" }), { status: 200 });

      case "delete":
        user.isDeleted = true;
        user.trashDate = new Date();
        await user.save();
        await sendNotification(user.email, "user", "deleted");
        return new Response(JSON.stringify({ message: "User deleted" }), { status: 200 });

      case "restore":
        user.isDeleted = false;
        user.trashDate = null;
        await user.save();
        await sendNotification(user.email, "user", "restored");
        return new Response(JSON.stringify({ message: "User restored" }), { status: 200 });

      case "permanent-delete":
        await User.findByIdAndDelete(userId);
        await sendNotification(user.email, "user", "permanently deleted");
        return new Response(JSON.stringify({ message: "User permanently deleted" }), { status: 200 });

      default:
        return new Response(JSON.stringify({ message: "Invalid action" }), { status: 400 });
    }
  } catch (error) {
    console.error("Error occurred:", error.message);
    return new Response(
      JSON.stringify({ message: error.message || "Error updating user data" }),
      { status: 500 }
    );
  }
}

export async function DELETE(req) {
  try {
    await connectToDB();
    await isAdminOrSuperAdmin();

    const { _id } = await req.json();
    console.log("id: ", _id);

    // Find the user
    const user = await User.findById(_id);
    console.log("User to delete: ", user);
    if (!user) {
      return new Response(JSON.stringify({ message: "User not found" }), { status: 404 });
    }

    if (user.isDeleted) {
      await User.findByIdAndDelete(_id);

      return new Response(
        JSON.stringify({ message: "User permanently deleted from the trash." }),
        { status: 200 }
      );
    }

    // Soft delete: mark user as deleted and set trash date
    user.isDeleted = true;
    user.trashDate = new Date();
    await user.save();

    await sendNotification(user.email, "user", "deleted");

    return new Response(
      JSON.stringify({ message: "User soft deleted. It will be permanently deleted after 30 days." }),
      { status: 200 }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ message: error.message || "Error deleting user" }),
      { status: 500 }
    );
  }
}
