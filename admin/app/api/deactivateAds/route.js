import { NextResponse } from "next/server";
import deactivateExpiredAds from "@/utils/functions";

export async function GET(req) {
  const result = await deactivateExpiredAds();

  if (result.success) {
    return NextResponse.json({ message: "Expired ads deactivated", count: result.modified });
  } else {
    return NextResponse.json({ message: "Error", error: result.error }, { status: 500 });
  }
}
