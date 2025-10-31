import { connectToDB, isAdminOrSuperAdmin, userInfo } from "@/utils/functions";
import Advertisement from "@/models/Advertisement"
import fetch from "node-fetch";
import { v4 as uuidv4 } from "uuid";

const chapaSecretKey = process.env.CHAPA_SECRET_KEY;

export const POST = async (req) => {
  await connectToDB();
  // await isAdminOrSuperAdmin();

  const user = await userInfo();
  const { product, merchantDetail, startsAt, endsAt, price, location } =
    await req.json();

  if (
    !product ||
    !merchantDetail ||
    !startsAt ||
    !endsAt ||
    !price ||
    !location
  ) {
    return new Response(JSON.stringify({ error: "Missing required fields" }), {
      status: 400,
    });
  }

  const tx_ref = uuidv4().replace(/-/g, "").slice(0, 15);

  const fullName = merchantDetail.merchantName?.split(" ") || [];
  const firstName = fullName[0] || "";
  const lastName = fullName.slice(1).join(" ") || "";

  let phone = merchantDetail.phoneNumber.toString();
  if (!phone.startsWith("+")) {
    phone = "+251" + phone.replace(/^0+/, "");
  }

  const paymentPayload = {
    amount: price,
    currency: "ETB",
    email: merchantDetail.merchantEmail,
    first_name: firstName,
    last_name: lastName,
    phone_number: phone,
    tx_ref,
    callback_url: "https://localhost:3000/callback", // replace with actual callback
    return_url: `https://localhost:3000/${tx_ref}`, // replace with actual return URL
    customization: {
      title: "Ad Payment",
      description: `Ad payment: ${product.productName}`
        .slice(0, 50)
        .replace(/[^\w\s.-]/g, ""), // sanitize
    },
  };

  try {
    const response = await fetch(
      "https://api.chapa.co/v1/transaction/initialize",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${chapaSecretKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(paymentPayload),
      }
    );

    const data = await response.json();
    console.log("Data from chapa:", data);

    if (data.status === "success") {
      const newAd = new Ad({
        product,
        merchantDetail,
        startsAt,
        endsAt,
        price,
        approvalStatus: "PENDING",
        location,
        tx_ref,
      });

      await newAd.save();

      return new Response(
        JSON.stringify({
          message: "Ad created and payment initialized successfully",
          checkout_url: data.data.checkout_url,
        }),
        { status: 201 }
      );
    } else {
      return new Response(
        JSON.stringify({
          error: "Payment initialization failed",
          details: data.message || "Unknown error",
        }),
        { status: 500 }
      );
    }
  } catch (error) {
    console.error(error);
    return new Response(
      JSON.stringify({
        error: "Error creating ad or initializing payment",
        details: error.message,
      }),
      { status: 500 }
    );
  }
};

export const GET = async (req) => {
  await connectToDB();
  await isAdminOrSuperAdmin(req);

  const url = new URL(req.url);
  const center = url.searchParams.get("center"); // e.g., "9.03-38.74"
  const radius = parseInt(url.searchParams.get("radius")) || 50000;
  const page = parseInt(url.searchParams.get("page")) || 1;
  const limit = parseInt(url.searchParams.get("limit")) || 15;
  const status = url.searchParams.get("status");

  console.log("Filters: ", center, radius, page, limit, status);

  const filter = {};
  if (status) filter.approvalStatus = status;

  try {
    if (center) {
      const [lat, lng] = center.split("-").map(Number);

      const result = await Advertisement.aggregate([
        {
          $geoNear: {
            near: { type: "Point", coordinates: [lng, lat] },
            distanceField: "distance",
            maxDistance: radius,
            spherical: true,
            query: filter,
          },
        },
        { $sort: { createdAt: -1 } },
        { $skip: (page - 1) * limit },
        { $limit: limit },
        {
          $facet: {
            metadata: [{ $count: "total" }],
            data: [
              { $sort: { createdAt: -1 } },
              { $skip: (page - 1) * limit },
              { $limit: limit },
            ],
          },
        },
      ]);

      const ads = result[0]?.data || [];
      const total = result[0]?.metadata[0]?.total || 0;

      console.log("total ads (geo):", total);

      return new Response(
        JSON.stringify({
          ads,
          pagination: {
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            totalAds: total,
          },
        }),
        { status: 200 }
      );
    } else {
      const ads = await Advertisement.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit);

      const total = await Advertisement.countDocuments(filter);

      console.log("total ads (non-geo):", total);

      return new Response(
        JSON.stringify({
          ads,
          pagination: {
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            totalAds: total,
          },
        }),
        { status: 200 }
      );
    }
  } catch (error) {
    console.error("Error fetching ads:", error);
    return new Response(
      JSON.stringify({ error: "Error fetching ads", details: error.message }),
      { status: 500 }
    );
  }
};

export const PUT = async (req) => {
  await connectToDB();
  await isAdminOrSuperAdmin();

  const { _id, action, reason, description, tx_ref, amount } = await req.json();

  console.log("Update info:", _id, action, reason, description, tx_ref, amount);

  if (!_id) {
    return new Response(JSON.stringify({ error: "Missing ad ID" }), {
      status: 400,
    });
  }

  const ad = await Advertisement.findById(_id);
  if (!ad) {
    return new Response(JSON.stringify({ error: "Ad not found" }), {
      status: 404,
    });
  }

  if (ad.approvalStatus !== "PENDING") {
    return new Response(JSON.stringify({ error: "Ad is already processed" }), {
      status: 400,
    });
  }

  if (action === "APPROVE") {
    ad.approvalStatus = "APPROVED";
    ad.isActive = true;
    await ad.save();
    return new Response(
      JSON.stringify({ message: "Ad approved successfully" }),
      { status: 200 }
    );
  }

  if (action === "REJECT") {
    ad.rejectionReason = { reason, description };
    ad.isActive = false;

    let refundAttempted = false;
    let refundSucceeded = false;
    let refundMessage = "";

    const refundUrl = `https://api.chapa.co/v1/refund/${tx_ref}`;
    const amountToRefund =
      amount && !isNaN(amount) ? amount.toString() : undefined;

    try {
      const params = new URLSearchParams();
      params.append("reason", reason || "Rejected by admin");

      if (amountToRefund) {
        params.append("amount", amountToRefund);
      }

      params.append("meta[ad_id]", _id);
      params.append("meta[initiated_by]", "admin");
      params.append("reference", `ad-reject-${_id}-${Date.now()}`);

      const refundRes = await fetch(refundUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Bearer ${chapaSecretKey}`,
        },
        body: params,
      });

      refundAttempted = true;
      const result = await refundRes.json();
      console.log("Refund result:", result);

      if (
        refundRes.ok ||
        result.message ===
          "Refund amount cannot exceed the full transaction amount or be less than 0" ||
        result.message ===
          "Oops something went wrong and this is our issue, please report to us! Thank you :)"
      ) {
        refundSucceeded = true;
        ad.approvalStatus = "REJECTED";
        refundMessage = result.message;
      } else {
        refundMessage = result.message || "Refund failed";
      }
    } catch (err) {
      console.error("Refund error:", err);
      refundMessage = err.message;
    }

    await ad.save();

    if (!refundAttempted) {
      return new Response(
        JSON.stringify({
          message: "Ad rejected. Refund skipped (probably in test mode).",
        }),
        { status: 200 }
      );
    }

    if (refundSucceeded) {
      return new Response(
        JSON.stringify({ message: "Ad rejected and refund processed" }),
        { status: 200 }
      );
    } else {
      return new Response(
        JSON.stringify({
          error: "Ad rejected but refund failed/skipped",
          refundMessage,
        }),
        { status: 500 }
      );
    }
  }

  return new Response(JSON.stringify({ error: "Invalid action" }), {
    status: 400,
  });
};
