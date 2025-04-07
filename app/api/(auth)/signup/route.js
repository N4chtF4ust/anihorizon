import { connectToDatabase } from '@/app/lib/mongodb';
import { emailValidation } from '@/app/lib/emailValidation';
import User from '@/app/models/User';
import Verification from '@/app/models/Verification';
import bcrypt from 'bcryptjs';
import validator from 'validator';



export async function POST(req) {

    try{

    const { name, email,password,verifyCode } = await req.json();
    const emailValidationResponse = await emailValidation(email);
    const isStrong = validator.isStrongPassword(password, {
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1
    });



    if (emailValidationResponse.status !== 200) {
      return emailValidationResponse; 
    }
  
    if (!isStrong) {

      return new Response(
        JSON.stringify({ passwordMessage: 'Weak password. ',
          alertPassMessage: 'Use at least 8 characters, with uppercase, lowercase, numbers, and symbols.<br><br>Example: MyP@ssw0rd123!'
         }),
        { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await connectToDatabase().catch((err) => {
      console.error('Database connection error:', err);
      return new Response(
        JSON.stringify({ message: 'Database connection error' }),
        { status: 500 }
      );
    });

    const existingUser = await User.findOne({ email });
    const existingVerification = await Verification.findOne({ email });

    if (existingUser) {
        if (existingUser.email === email) {
          return new Response(
            JSON.stringify({ emailMessage: 'Email already in use' }),
            { status: 400 }
          );
        }
   
      }

      else{

        if(existingVerification ){

            if(existingVerification.verificationCode === Number(verifyCode)){
                const newAcc = await User.create({
                 name: name,
                 email: email,
                 password: hashedPassword

           
                }).catch((err) => {
                  console.error('Error creating verification:', err);
                  return new Response(
                    JSON.stringify({ message: 'Error creating verification code' }),
                    { status: 500 }
                  );
                });

                return new Response(
                    JSON.stringify({ message: 'User created successfully' }),
                    { status: 200 }
                  );
            }

            else{

                return new Response(
                    JSON.stringify({ codeMessage: 'Code didnt match' }),
                    { status: 400 }
                  );
                
            }

       
 
        }

        else{

            return new Response(
                JSON.stringify({ codeMessage: 'Send a verification first' }),
                { status: 400 }
              );

        }




      }




    }catch(error){
        console.error('Server Error:', error);
        return new Response(
          JSON.stringify({ message: 'Server error. Please try again later.' }),
          { status: 500 }
        );

    }

 



}
