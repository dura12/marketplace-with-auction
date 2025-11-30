// app/api/banks/route.js
import { NextResponse } from "next/server";

const CHAPA_SECRET_KEY = process.env.CHAPA_SECRET_KEY;

export async function GET() {
  try {
    const response = await fetch("https://api.chapa.co/v1/banks", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${CHAPA_SECRET_KEY}`,
      },
    });

    const result = await response.json();

    if (response.ok) {
      // Successful response
      return NextResponse.json({
        message: result.message || "Banks retrieved",
        data: result.data,
      }, { status: 200 });
    } else {
      // Failed response (e.g., invalid API key)
      return NextResponse.json({
        message: result.message || "Failed to retrieve banks",
        status: result.status || "failed",
        data: null,
      }, { status: response.status || 400 });
    }
  } catch (error) {
    console.error("Error fetching banks:", error);
    return NextResponse.json({
      message: "Internal Server Error",
      status: "failed",
      data: null,
    }, { status: 500 });
  }
}