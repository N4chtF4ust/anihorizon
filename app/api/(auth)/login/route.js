import { connectToDatabase } from '@/app/lib/mongodb';
import { emailValidation } from '@/app/lib/emailValidation';
import User from '@/app/models/User';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { NextResponse } from 'next/server';


export async function POST(req) {
  try {
    // Ensure database connection before proceeding
    await connectToDatabase();

    const { email, password } = await req.json();

    // Validate email format
    const emailValidationResponse = await emailValidation(email);
    if (!emailValidationResponse.ok) {
      return new Response(
        JSON.stringify({ message: 'Invalid email format' }),
        { status: 400 }
      );
    }

    // Check if email and password are provided
    if (!email || !password) {
      console.error('Missing email or password');
      return new Response(
        JSON.stringify({ message: 'All fields are required' }),
        { status: 400 }
      );
    }

    // Find the user by email
    const user = await User.findOne({ email });
    if (!user) {
      console.error('User not found for email:', email);
      return new Response(
        JSON.stringify({ message: 'User not found' }),
        { status: 404 }
      );
    }

    console.log('User found:', user.email);

    // Check if the password matches
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.error('Invalid credentials for user:', email);
      return new Response(
        JSON.stringify({ message: 'Invalid credentials' }),
        { status: 401 }
      );
    }

    console.log('Password match successful');

    // 🔐 Create JWT token


    const token = jwt.sign(
      { userId: user._id, userName: user.name, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    const response = NextResponse.json({ success: true });
    
    response.cookies.set('anihorizon_token', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'Strict',
      path: '/',

    
    });
    
    return response;
    
  } catch (err) {
    console.error('Unexpected error:', err);
    return new Response(
      JSON.stringify({ message: 'Something went wrong' }),
      { status: 500 }
    );
  }
}
