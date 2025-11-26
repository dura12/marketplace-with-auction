import { checkSession, connectToDB, userInfo } from "@/libs/functions";
import User from "@/models/User";

export async function PUT(req) {
  const user = await userInfo(req);
  if (!user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
    });
  }

  try {
    const body = await req.json();
    const {
      _id,
      tinNumber,
      nationalId,
      account_name,
      account_number,
      bank_code,
    } = body;

    const sessionError = await checkSession(user.email);
    if (sessionError) {
      return new Response(JSON.stringify({ error: "You are not logged in." }), {
        status: 400,
      });
    }

    if (!_id) {
      return new Response(
        JSON.stringify({ error: "ID is mandatory for merchant promotion." }),
        { status: 400 }
      );
    }

    await connectToDB();

    const existingUser = await User.findById(_id);
    if (!existingUser) {
      return new Response(JSON.stringify({ error: "User not found." }), {
        status: 404,
      });
    }

    if (existingUser.role === "merchant") {
      return new Response(
        JSON.stringify({ error: "User is already a merchant." }),
        { status: 400 }
      );
    }

    // Validate required fields
    if (!tinNumber || !nationalId || !account_name || !account_number || !bank_code) {
      return new Response(
        JSON.stringify({ error: "All fields are required for merchant promotion." }),
        { status: 400 }
      );
    }

    // Update user to merchant with pending status
    const updateData = {
      role: "merchant",
      tinNumber,
      nationalId,
      account_name,
      account_number,
      bank_code,
      approvalStatus: "pending",
    };

    const updatedUser = await User.findOneAndUpdate(
      { _id: _id },
      { $set: updateData },
      { new: true }
    );

    if (!updatedUser) {
      return new Response(JSON.stringify({ error: "Failed to promote user to merchant." }), {
        status: 400,
      });
    }

    return new Response(JSON.stringify(updatedUser), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Error in POST handler: ", err.message);
    return new Response(JSON.stringify({ error: "Internal server error." }), {
      status: 500,
    });
  }
}