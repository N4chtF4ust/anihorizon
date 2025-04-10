import { connectToDatabase } from '@/app/lib/mongodb';
import { emailValidation } from '@/app/lib/emailValidation';
import User from '@/app/models/User';
import Verification from '@/app/models/Verification';
import nodemailer from 'nodemailer';

const rateLimitMap = new Map();

function rateLimit(email) {
  const now = Date.now();
  const last = rateLimitMap.get(email) || 0;
  if (now - last < 60000) return false; // 1 request per minute
  rateLimitMap.set(email, now);
  return true;
}

export async function POST(req) {
  try {
    const { email } = await req.json();

    if (!rateLimit(email)) {
      return new Response(JSON.stringify({ rateLimitMessage: 'Please wait before retrying.' }), {
        status: 429,
      });
    }

    const emailValidationResponse = await emailValidation(email);
    if (!emailValidationResponse.ok) {
      return emailValidationResponse; 
    }
    // Ensure database connection before proceeding
    await connectToDatabase().catch((err) => {
      console.error('Database connection error:', err);
      return new Response(
        JSON.stringify({ message: 'Database connection error' }),
        { status: 500 }
      );
    });

    const transporter = nodemailer.createTransport({
      service: 'gmail', // Or another SMTP provider
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },

    });
    const emailWithoutDomain = email.split('@')[0];

    const existingUser = await User.findOne({ email });
    const existingVerification = await Verification.findOne({ email });

    const randomCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiration = new Date(Date.now() + 60 * 3 * 1000); // expires in 3 minute

    if (existingUser) {
      if (existingUser.email === email) {
        return new Response(
          JSON.stringify({ message: 'Email already in use' }),
          { status: 400 }
        );
      }
 
    }


     if (existingVerification) {
      existingVerification.verificationCode = randomCode;
      existingVerification.expiresAt = expiration;
      await existingVerification.save()
      console.log(`Resent code for ${email}: ${randomCode}`)
      return new Response(
        JSON.stringify({ message: 'New verification code sent.' }),
        { status: 200 }
      );
  
      }


    const newVerification = await Verification.create({
      email,
      verificationCode: randomCode,
      expiresAt: expiration,
    }).catch((err) => {
      console.error('Error creating verification:', err);
      return new Response(
        JSON.stringify({ message: 'Error creating verification code' }),
        { status: 500 }
      );
    });

    console.log(`Verification code for ${email}: ${randomCode}`);

    try {
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Your Verification Code',
        text: ` Hello ${emailWithoutDomain} , your verification code is: ${randomCode}`,
        html:  `<!DOCTYPE html>
                  <html lang="en">
                  <head>
                      <meta charset="UTF-8">
                      <meta name="viewport" content="width=device-width, initial-scale=1.0">
                      <title>Verification Code</title>
                      <style>
                          body {
                              font-family: Arial, sans-serif;
                              color: #333;
                              background-color: #f9f9f9;
                              margin: 0;
                              padding: 20px;
                          }
                          .container {
                              background-color: #ffffff;
                              border-radius: 8px;
                              padding: 20px;
                              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                          }
                          .header {
                              font-size: 24px;
                              font-weight: bold;
                              color: #007BFF;
                              margin-bottom: 20px;
                          }
                          .message {
                              font-size: 16px;
                              line-height: 1.5;
                          }
                          .code {
                              font-weight: bold;
                              font-size: 18px;
                              color: #007BFF;
                          }
                          .footer {
                              font-size: 14px;
                              margin-top: 20px;
                              color: #777;
                          }
                          .note {
                              font-size: 14px;
                              color: #888;
                              margin-top: 10px;
                          }
                      </style>
                  </head>
                  <body>
                      <div class="container">
                          <p class="header">Hello ${emailWithoutDomain},</p>
                          <p class="message">Here is your verification code:</p>
                          <p class="code">${randomCode}</p>
                          <p class="note">This code will expire in 3 minutes. Please enter it before it expires.</p>
                          <p class="footer">If you did not request this code, please disregard this email.</p>
                      </div>
                  </body>
                </html>

`,
        headers: {
          'X-Mailer': 'Anihorizon', 
        },
      });
  

      return new Response(
        JSON.stringify({ message: 'Verification code sent.' }),
        { status: 200 }
      );
    } catch (err) {
         // Check if the error is related to Gmail's sending limit
      if (err.response && err.response.includes('Quota exceeded')) {
        return new Response(
          JSON.stringify({ message: 'Gmail sending limit reached' }),
          { status: 429 } // HTTP status code for Too Many Requests
        );
      }
    
      // Generic error handling for other cases
      return new Response(
        JSON.stringify({ message: 'Error sending email' }),
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Server Error:', error);
    return new Response(
      JSON.stringify({ message: 'Server error. Please try again later.' }),
      { status: 500 }
    );
  }
}
