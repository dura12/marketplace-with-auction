import { checkSession, connectToDB, userInfo } from "@/libs/functions";
import User from "@/models/User";
import argon2 from "argon2";

export async function GET(req) {
  await connectToDB();

  const user = await userInfo(req);

  if (!user) {
    // console.log("No user found. Returning 401 Unauthorized.");
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
    });
  }

  try {
    // console.log("Connecting to database...");
    await connectToDB();
    // console.log("Database connection established.");

    // console.log("Looking for user in database with email:", user.email);
    const existingUser = await User.findOne({ email: user.email });

    if (existingUser) {
      // console.log("User found in database:", existingUser);
      return new Response(JSON.stringify(existingUser), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } else {
      // console.log("User not found in database.");
      return new Response(JSON.stringify({ error: "User not found" }), {
        status: 404,
      });
    }
  } catch (error) {
    console.error("Error occurred during GET request:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
    });
  }
}

export async function PUT(req) {
  const user = await userInfo(req);
  if (!user)
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
    });
  try {
    // Parse request body
    const body = await req.json();
    const {
      _id,
      fullName,
      password,
      bio,
      image,
      stateName,
      cityName,
      phoneNumber,
      tinNumber,
      nationalId,
      account_name,
      account_number,
      bank_code,
    } = body;
    const sessionError = await checkSession(user.email);

    if (sessionError) {
      // console.log("Not logged in");
      return new Response(JSON.stringify({ error: "You are not logged in." }), {
        status: 400,
      });
    }

    if (!_id) {
      // console.log("Not id in");

      return new Response(
        JSON.stringify({ error: "ID is mandatory for update." }),
        { status: 400 }
      );
    }

    await connectToDB();

    // Fetch user from DB
    const existingUser = await User.findById(_id);
    if (!existingUser) {
      return new Response(JSON.stringify({ error: "User not found." }), {
        status: 404,
      });
    }

    const updateData = {};

    // Allow updates to profile fields
    if (fullName) updateData.fullName = fullName;
    if (password) updateData.password = await argon2.hash(password);
    if (bio) updateData.bio = bio;
    if (image) updateData.image = image;
    if (stateName) updateData.stateName = stateName;
    if (cityName) updateData.cityName = cityName;
    if (phoneNumber) updateData.phoneNumber = phoneNumber;

    // Prevent merchants from updating tinNumber and nationalId
    if (existingUser.role === "merchant" && (tinNumber || nationalId)) {
      return new Response(
        JSON.stringify({
          error: "Merchants cannot update tinNumber or nationalId.",
        }),
        { status: 400 }
      );
    }

    // Check if the user is a customer and wants to promote to merchant
    if (existingUser.role === "customer") {
      if ((tinNumber && !nationalId) || (!tinNumber && nationalId)) {
        return new Response(
          JSON.stringify({
            error:
              "You must provide both TIN number and National ID to be approved as a merchant.",
          }),
          { status: 400 }
        );
      }

      if (tinNumber && nationalId) {
        updateData.role = "merchant";
        updateData.tinNumber = tinNumber;
        updateData.nationalId = nationalId;
        updateData.isMerchant = false;
      }
    }

    // Add new fields for account details
    if (account_name) updateData.account_name = account_name;
    if (account_number) updateData.account_number = account_number;
    if (bank_code) updateData.bank_code = bank_code;

    // Update the user in the database
    const updatedUser = await User.findOneAndUpdate(
      { _id: _id }, // Find user by _id
      { $set: updateData }, // Update specified fields
      { new: true } // Return the updated document
    );

    if (!updatedUser) {
      // console.log("Not updated in");

      return new Response(JSON.stringify({ error: "Failed to update user." }), {
        status: 400,
      });
    }

    return new Response(JSON.stringify(updatedUser), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Error in PUT handler: ", err.message);
    return new Response(JSON.stringify({ error: "Internal server error." }), {
      status: 500,
    });
  }
}

export async function DELETE(req) {
  const user = await userInfo(req);
  if (!user)
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
    });
  try {
    const url = new URL(req.url);
    const email = url.searchParams.get("email");

    // Check session and email
    const sessionError = await checkSession(email);
    if (sessionError) {
      return sessionError; // Return the error response
    }

    // Proceed with your logic if the session is valid
    await connectToDB();
    const user = await User.findOne({ email });
    if (!user) {
      return new Response(JSON.stringify({ error: "User not found." }), {
        status: 404,
      });
    }

    user.isDeleted = true;
    user.trashDate = new Date();
    await user.save();

    return new Response(
      JSON.stringify({
        message:
          "User soft deleted. It will be permanently deleted after 30 days.",
      }),
      { status: 200 }
    );
  } catch (err) {
    console.error("Error in DELETE handler: ", err.message);
    return new Response(JSON.stringify({ error: "Internal server error." }), {
      status: 500,
    });
  }
}
