import { NextResponse } from "next/server";

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const url = new URL(request.url);
    const page = url.searchParams.get("page") || 1;

    const response = await fetch(`${process.env.ANIHORIZON_API}/${id}?page=${page}`, {
      next: { revalidate: 3600 }, // Cache for 60 seconds per unique page
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
