import User from "@/models/User";
import argon2 from 'argon2';
import { connectToDB } from "@/libs/functions";

export async function POST(req) {
    try {
        const body = await req.json();
        console.log("Body: ", body);
        await connectToDB();

        // Check if the user already exists
        const existingUser = await User.findOne({ email: body.email });
        if (existingUser) {
            return new Response(
                JSON.stringify({ message: "User already exists" }),
                { status: 400 }
            );
        }

        // Hash password
        const hashedPassword = await argon2.hash(body.password);
        body.password = hashedPassword;

        // Create user without sending OTP
        const createdUser = await User.create({ 
            ...body, 
            isEmailVerified: false 
        });

        return new Response(JSON.stringify(createdUser), { status: 201 });

    } catch (err) {
        console.error("Error while creating: ", err.message);
        return new Response(JSON.stringify({ error: err.message }), { status: 500 });
    }
}


// export async function GET(req) {
//     const url = new URL(req.url);
//     const email = url.searchParams.get("email");
//     const sessionError = await checkSession(email);

//     if (!email || sessionError) {
//         return new Response(JSON.stringify({ error: "Email is required OR Invalid  email" }), { status: 400 });
//     }

//     try {
//         await connectToDB();

//         const existingUser = await User.findOne({ email });

//         if (existingUser) {
//             return new Response(JSON.stringify(existingUser), {
//                 status: 200,
//                 headers: { "Content-Type": "application/json" }
//             });
//         } else {
//             return new Response(JSON.stringify({ error: "User not found" }), { status: 404 });
//         }
//     } catch (error) {
//         return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500 });
//     }
// }

// export async function PUT(req) {
//     try {
//         // Parse request body
//         const body = await req.json();
//         const { _id, email, fullName, password, image, stateName, cityName, phoneNumber } = body;
//         const sessionError = await checkSession(email);

//         // Validate required fields
//         if (!fullName && !password && !image && !stateName && !cityName && !phoneNumber) {
//             return new Response(JSON.stringify({ error: "At least one field to update is required." }), { status: 400 });
//         }

//         if (!_id || sessionError ) {
//             return new Response(JSON.stringify({ error: "ID is mandatory for Update" }), { status: 400 });
//         }

//         await connectToDB();

//         // Prepare the update data
//         const updateData = {};
//         if (fullName) updateData.fullName = fullName;
//         if (password) updateData.password = await argon2.hash(password);  
//         if (image) updateData.image = image;
//         if (stateName) updateData.stateName = stateName;
//         if (cityName) updateData.cityName = cityName;
//         if (phoneNumber) updateData.phoneNumber = phoneNumber;

//         // Update the user in the database using the _id
//         const updatedUser = await User.findOneAndUpdate(
//             { _id: _id }, // Find user by _id
//             { $set: updateData }, // Update specified fields
//             { new: true } // Return the updated document
//         );

//         if (!updatedUser) {
//             return new Response(JSON.stringify({ error: "User not found." }), { status: 404 });
//         }

//         // Return the updated user data
//         return new Response(JSON.stringify(updatedUser), {
//             status: 200,
//             headers: { "Content-Type": "application/json" },
//         });
//     } catch (err) {
//         console.error("Error in PUT handler: ", err.message);
//         return new Response(
//             JSON.stringify({ error: "Internal server error." }),
//             { status: 500 }
//         );
//     }
// }

// export async function DELETE(req) {
//     try {
//         const url = new URL(req.url);
//         const email = url.searchParams.get("email");

//         // Check session and email
//         const sessionError = await checkSession(email);
//         if (sessionError) {
//             return sessionError; // Return the error response
//         }

//         // Proceed with your logic if the session is valid
//         await connectToDB();
//         const user = await User.findOne({ email });
//         if (!user) {
//             return new Response(
//                 JSON.stringify({ error: "User not found." }),
//                 { status: 404 }
//             );
//         }

//         user.isDeleted = true;
//         user.trashDate = new Date();
//         await user.save();

//         return new Response(
//             JSON.stringify({
//                 message:
//                     "User soft deleted. It will be permanently deleted after 30 days.",
//             }),
//             { status: 200 }
//         );
//     } catch (err) {
//         console.error("Error in DELETE handler: ", err.message);
//         return new Response(
//             JSON.stringify({ error: "Internal server error." }),
//             { status: 500 }
//         );
//     }
// }
