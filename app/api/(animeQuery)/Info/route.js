import { NextResponse } from "next/server";

export async function GET(request ) {
  try {
  
    const url = new URL(request.url);
    const page = url.searchParams.get("id");

    // Enable Next.js RSC caching
    const response = await fetch(`${process.env.ANIHORIZON_API}/info?id=${page}`, {
    
      next: { revalidate: 3660 }, // Cache for 60 seconds before revalidating
      headers: {
        "Connection": "keep-alive"
      }
    });

    if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

    const data = await response.json();

    // Return cached response
    return NextResponse.json(data);
  } catch (error) {
    return new Response(
      JSON.stringify({ error: "Failed to fetch data", details: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
