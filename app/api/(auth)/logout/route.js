import { NextResponse } from 'next/server'



export async function POST() {
  const response = NextResponse.json({ success: true })

  response.cookies.set('anihorizon_token', {
    httpOnly: true,
    secure: true,
    sameSite: 'Strict',
    path: '/',
    expires: new Date(0) // Expire the cookie
  })

  return response
}
