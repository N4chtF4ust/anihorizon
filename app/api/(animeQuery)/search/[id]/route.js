import { NextResponse } from "next/server";

export async function GET(request, { params }) {
  try {
    const { id } = await params; // Corrected extraction of `id`
    const url = new URL(request.url);

    const response = await fetch(`${process.env.ANIHORIZON_API}/${id}`, {
      next: { revalidate: 60 }, // Cache for 60 seconds
      headers: {
        Connection: "keep-alive",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch data", details: error.message },
      { status: 500 }
    );
  }
}
