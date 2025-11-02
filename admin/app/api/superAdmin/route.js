import { isSuperAdmin } from '../../../utils/functions'
import SuperAdmin from "../../../models/SuperAdmin";
import argon2 from "argon2";


export async function GET(req) {
    try {
        const url = new URL(req.url);
        const _id = url.searchParams.get("_id");
        let superAdmins;

        if (_id) {
            superAdmins = await SuperAdmin.findById(_id).select('email fullname phone');
            
            if (!superAdmins) {
                return new Response(
                    JSON.stringify({ error: "SuperAdmin not found" }),
                    { status: 404 }
                );
            }
        } else {
            // If _id is not passed, fetch all SuperAdmins
            superAdmins = await SuperAdmin.find().select('email fullname phone');
        }

        return new Response(
            JSON.stringify(superAdmins),
            { status: 200, headers: { "Content-Type": "application/json" } }
        );
    } catch (error) {
        console.error("Error fetching SuperAdmin info:", error.message);
        return new Response(
            JSON.stringify({ error: "Internal server error" }),
            { status: 500 }
        );
    }
}


export async function PUT(req) {
    try {
        // First, check if the user is a SuperAdmin
        console.log("Starting ....")
        await isSuperAdmin();

        const { _id, fullname, phone, password } = await req.json();
        console.log("Data: ", _id, fullname, phone, password)

        if (!_id) {
            return new Response(
                JSON.stringify({ error: "SuperAdmin ID is required" }),
                { status: 400 }
            );
        }

        // Find the SuperAdmin by _id
        const superAdmin = await SuperAdmin.findById(_id);
        if (!superAdmin) {
            return new Response(
                JSON.stringify({ error: "SuperAdmin not found" }),
                { status: 404 }
            );
        }

        // Update SuperAdmin fields
        const updatedData = {};
        if (fullname) updatedData.fullname = fullname;
        if (phone) updatedData.phone = phone;
        if (password) {
            updatedData.password = await argon2.hash(password);
        }
        const updatedSuperAdmin = await SuperAdmin.findByIdAndUpdate(_id, updatedData, { new: true });

        if (!updatedSuperAdmin) {
            return new Response(
                JSON.stringify({ error: "Failed to update SuperAdmin" }),
                { status: 500 }
            );
        }

        return new Response(
            JSON.stringify(updatedSuperAdmin),
            { status: 200, headers: { "Content-Type": "application/json" } }
        );
    } catch (error) {
        console.error("Error updating SuperAdmin:", error.message);
        return new Response(
            JSON.stringify({ error: error.message || "Internal server error" }),
            { status: 500 }
        );
    }
}