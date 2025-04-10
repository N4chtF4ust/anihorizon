import { verify } from 'jsonwebtoken';


export async function GET(req) {

  const token = req.headers.get('Authorization')?.split(' ')[1]; // Assuming the token is in the form: "Bearer <token>"
  
  if (!token) {
    return new Response(JSON.stringify({ message: 'Token missing' }), { status: 401 });
  }

  try {
    // Verify the token using the JWT secret
    const decoded = verify(token, process.env.JWT_SECRET);

    // The decoded token should contain user information like userId and email
    console.log(decoded)
    const { userId, userName, email } = decoded;

    // Here you can optionally fetch more user data from your database using userId if needed
    return new Response(
      JSON.stringify({ userId: userId, 
                       userName: userName,
                       email: email,

                       }), 
      { status: 200 }
    );
  } catch (err) {
    // If the token is invalid or expired, return an error
    return new Response(JSON.stringify({ message: 'Invalid or expired token' }), { status: 401 });
  }
}
