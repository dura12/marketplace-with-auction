import { options } from "../auth/[...nextauth]/options";
import { getServerSession } from "next-auth";
import SuperAdmin from "@/models/SuperAdmin";
import Admin from "@/models/Admin";
import User from "@/models/User";
import { connectToDB, role } from "@/utils/functions";

export async function GET(req) {
    try {
        await connectToDB();

        const url = new URL(req.url);
        const _id = url.searchParams.get('_id');
        const email = url.searchParams.get("email");
        console.log("email for layout: ", email);

        let filterUser = {};
        if (email) {
            filterUser = { email };
        }
        if (_id) {
            filterUser = { _id };
        } else {
            const session = await getServerSession(options);
            const email = session?.user?.email;
            if (!email) {
                return new Response(JSON.stringify({ error: "No session found" }), { status: 401 });
            }
            filterUser = { email };
        }

        let user = await SuperAdmin.findOne(filterUser).lean();
        if (!user) {
           user = await Admin.findOne(filterUser).lean();
        }

        return new Response(JSON.stringify(user), { status: 200 });
    } catch (error) {
        return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
    }
}

export async function PUT(req) {
    try {
        await connectToDB();
        
        const session = await getServerSession(options);
        if (!session?.user?.email) {
            return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
        }

        // Check if user is SuperAdmin or Admin
        const userRole = await role();
        if (userRole !== "superadmin" && userRole !== "admin") {
            return new Response(JSON.stringify({ error: "Access Denied" }), { status: 403 });
        }

        // Get request body
        const { userId, newRole, isBanned } = await req.json();
        if (!userId || (!newRole && isBanned === undefined)) {
            return new Response(JSON.stringify({ error: "Missing required fields" }), { status: 400 });
        }

        // Find the user
        const user = await User.findById(userId);
        if (!user) {
            return new Response(JSON.stringify({ error: "User not found" }), { status: 404 });
        }

        // Handle role change
        if (newRole && ["customer", "merchant"].includes(newRole)) {
            user.role = newRole;
        }

        // Handle banning/unbanning merchants
        if (isBanned !== undefined && user.role === "merchant") {
            user.isBanned = isBanned;
            
            if (isBanned) {
                await sendNotification(user.email, "user", "banned");
            } else {
                await sendNotification(user.email, "user", "restored");
            }
        }

        // Save changes
        await user.save();

        return new Response(JSON.stringify({ message: "User updated successfully", user }), { status: 200 });
    } catch (error) {
        console.error("Error updating user:", error);
        return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500 });
    }
}
