import Order from "@/models/Order";
import Product from "@/models/Product";
import { isAdminOrSuperAdmin } from "@/utils/functions";

const CHAPA_SECRET_KEY = process.env.CHAPA_SECRET_KEY;

export async function POST(req) {
  try {
    await isAdminOrSuperAdmin();

    const { tx_ref, reason } = await req.json();
    console.log("📥 Received data from client:", { tx_ref, reason });

    if (!tx_ref || !reason) {
      return new Response(
        JSON.stringify({
          error: "Transaction reference and reason are required.",
        }),
        { status: 400 }
      );
    }

    const chapaSecretKey = CHAPA_SECRET_KEY;

    const response = await fetch(`https://api.chapa.co/v1/refund/${tx_ref}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Bearer ${chapaSecretKey}`,
      },
      body: new URLSearchParams({
        reason: reason,
      }),
    });

    const result = await response.json();
    console.log("📨 Response from Chapa:", result);

    const order = await Order.findOne({ chapaRef: tx_ref });
    if (!order) {
      return new Response(JSON.stringify({ error: "Order not found" }), {
        status: 404,
      });
    }

    const updateProductQuantities = async () => {
      for (const orderProduct of order.products || []) {
        const { productId, quantity } = orderProduct;
        console.log(`🔍 Fetching product ${productId}`);
        const product = await Product.findById(productId);
        if (!product) {
          console.error(
            `❌ Product with ID ${productId} not found during refund`
          );
          continue;
        }

        product.quantity += quantity;
        product.soldQuantity -= quantity;
        if (product.soldQuantity < 0) product.soldQuantity = 0;

        await product.save();
        console.log(
          `✅ Updated product ${productId}: +${quantity} stock, -${quantity} sold`
        );
      }
    };

    if (result.message === "Refunds can only be processed in live mode") {
      await updateProductQuantities();

      order.paymentStatus = "Refunded";
      order.refundReason = reason;
      await order.save();

      return new Response(
        JSON.stringify({ message: "Refund processed in test mode", order }),
        { status: 200 }
      );
    }

    if (
      response.ok ||
      result.message ===
        "Refund amount cannot exceed the full transaction amount or be less than 0"
    ) {
      console.warn(
        "⚠️ Treating refund as completed due to Chapa marking it as 'initiated'"
      );

      await updateProductQuantities();

      order.paymentStatus = "Refunded";
      order.refundReason = reason;
      await order.save();

      return new Response(
        JSON.stringify({
          message: "Refund treated as completed",
          chapaMessage: result.message,
          order,
        }),
        { status: 200 }
      );
    } else {
      console.error("❌ Refund failed:", result);
      return new Response(JSON.stringify(result), { status: 400 });
    }
  } catch (error) {
    console.error("💥 Error processing refund:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
    });
  }
}
