import { connectToDatabase } from "@/app/lib/mongodb";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await connectToDatabase();
    return NextResponse.json({ message: "Connected to MongoDB!" });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to connect", details: error.message },
      { status: 500 }
    );
  }
}
