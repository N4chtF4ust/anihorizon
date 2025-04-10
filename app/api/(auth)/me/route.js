import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verify } from 'jsonwebtoken' // Import verify from jsonwebtoken

export async function GET() {
    const cookieStore = await cookies();
    const token = cookieStore.get('anihorizon_token')?.value;

  if (!token) {
    return NextResponse.json({ user: null }, { status: 401 })
  }
  
  try {
    // Verify the token using the JWT secret
    const decoded = verify(token, process.env.JWT_SECRET);

    // The decoded token should contain user information like userId and email
    console.log(decoded);
    const { userId, userName, email } = decoded;

    // Here you can optionally fetch more user data from your database using userId if needed
    return NextResponse.json(
      { userId, userName, email },
      { status: 200 }
    );
  } catch (err) {
    // If the token is invalid or expired, return an error
    return NextResponse.json({ message: 'Invalid or expired token' }, { status: 401 });
  }
}
