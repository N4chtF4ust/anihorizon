import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const ep = searchParams.get("ep");

    if (!ep) {
      return NextResponse.json(
        { error: "Missing 'ep' query parameter" },
        { status: 400 }
      );
    }

    const response = await fetch(`${process.env.ANIHORIZON_API}/watch/${ep}`, {
      next: { revalidate: 60 },
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
