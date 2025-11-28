import Wishlist from "@/models/Wishlist";
import { connectToDB, userInfo } from "libs/functions"; 

    export async function POST(req) {
    try {
        const user = await userInfo();
        if (!user) {
            return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
        }

        const email = user.email; 
        const { productIds } = await req.json(); 

        if (!Array.isArray(productIds) || productIds.length === 0) {
            return new Response(JSON.stringify({ error: "At least one product ID is required" }), { status: 400 });
        }
        await connectToDB();
        
        let wishlist = await Wishlist.findOne({ email });

        if (!wishlist) {
            wishlist = new Wishlist({ email, products: productIds.map(productId => ({ product_id: productId })) });
        } else {
            const existingProductIds = wishlist.products.map(item => item.product_id.toString());
            const newProducts = productIds.filter(productId => !existingProductIds.includes(productId));
            if (newProducts.length > 0) {
                wishlist.products.push(...newProducts.map(productId => ({ product_id: productId })));
            } else {
                return new Response(JSON.stringify({ message: "All products are already in the wishlist" }), { status: 400 });
            }
        }

        await wishlist.save(); // Save changes

        return new Response(JSON.stringify({ message: "Products added to wishlist", wishlist }), { status: 200 });
    } catch (error) {
        console.error("Error adding to wishlist:", error);
        return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500 });
    }
    }
    export async function GET(req) {
        try {
            const user = await userInfo();
            const email = user.email;
            await connectToDB();
            const wishlist = await Wishlist.findOne({email: email})
            if(wishlist) {
                return new Response(
                    JSON.stringify({ products: wishlist.products }),
                    { status: 200 });
            }
            return new Response(
                JSON.stringify({ message: "user has no wishlist" }),
                { status: 201 });
            
        } catch (error) {
            console.error("Error fetching wishlist:", error);
            return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500 });
        }
    }
    export async function DELETE(req) {
        try {
          const user = await userInfo();
          if (!user) {
            return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
          }
      
          await connectToDB();
          const { productId } = await req.json();
          const wishlist = await Wishlist.findOne({ email: user.email });
      
          if (!wishlist) {
            return new Response(JSON.stringify({ error: "Wishlist not found" }), { status: 404 });
          }
      
          if (productId) {
            // Remove a single product
            wishlist.products = wishlist.products.filter(
              (item) => item.product_id.toString() !== productId
            );
            await wishlist.save();
            return new Response(JSON.stringify({ message: "Product removed from wishlist" }), { status: 200 });
          } else {
            // Clear all products
            wishlist.products = [];
            await wishlist.save();
            return new Response(JSON.stringify({ message: "Wishlist cleared successfully" }), { status: 200 });
          }
      
        } catch (error) {
          console.error("Error managing wishlist:", error);
          return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500 });
        }
      }
