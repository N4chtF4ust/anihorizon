import { useState, useEffect,useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Swal from 'sweetalert2';
import {
  faXmark,
  faEnvelope,
  faEye,
  faEyeSlash,
  faLock,
  faUser,
  faPaperPlane
} from "@fortawesome/free-solid-svg-icons";
import { useForm } from "react-hook-form";
import Cookies from 'js-cookie';
import LoadingDots from '@/app/components/loading/LoadingDots';
import { useRouter } from 'next/navigation';

const Login = ({ isLoginOpen, setIsLoginOpen }) => {

  const router = useRouter();

  const [isPassShown, setIsPassShown] = useState(false);
  const [isSignInPassShown, setIsSignInPassShown] = useState(false);
  const [isSignInReEnterPassShown, setIsSignInReEnterPassShown] = useState(false);
  const [loginLoading,setLoginLoading] = useState(false)
  const [signupLoading,setSignupLoading] = useState(false)
  const [verificationLoading,setVerificationLoading] = useState(false)

  const loginClick = () => setIsLoginOpen(false);
  const loginForm = useRef(null);
  const signInForm = useRef(null);
  const signinCLick=()=>{
      loginForm.current.classList.toggle("translate-x-[-100%]")
      signInForm.current.classList.toggle("translate-x-[-100%]");
  }

  const { register, handleSubmit, formState: { errors },clearErrors,
  setError, } = useForm();
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [timer, setTimer] = useState(() => {
    const savedTime = Cookies.get('resendTimer');
    return savedTime ? Math.max(0, 60 - Math.floor((Date.now() - parseInt(savedTime)) / 1000)) : 0;
  });

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            Cookies.remove('resendTimer');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  const startTimer = () => {
    setTimer(60);
    Cookies.set('resendTimer', Date.now(), { expires: 1 / 1440 }); // Expires in 1 minute
  };

  // SWeet alert Custom alert
  const verificationCodeAlert = (message) => {
    Swal.fire({
      title: '✅ Email Sent!',
      text: message,
      icon: 'success',
      confirmButtonText: 'Got it!',
      background: ' #082f49', // sky-950
      color: '#7dd3fc', // sky-300
      iconColor: '#10b981', // emerald-500 (Tailwind)
      confirmButtonColor: '#7dd3fc', // blue-500 (Tailwind)
      buttonsStyling: false, 
      customClass: {
        popup: ' bg-sky-300  rounded-xl shadow-lg',
        confirmButton: 'bg-sky-300 rounded-sm  px-6 py-2 text-sky-950',
      },
      showClass: {
        popup: 'animate__animated animate__fadeInDown',
      },
      hideClass: {
        popup: 'animate__animated animate__fadeOutUp',
      }
    });
  };

  const rateLimitCodeAlert = (message) => {
    Swal.fire({
      title: 'Error',
      text: message,
      icon: 'error',
      confirmButtonText: 'Got it!',
      background: ' #082f49', // sky-950
      color: '#7dd3fc', // sky-300
      iconColor: '#FF0000', // emerald-500 (Tailwind)
      confirmButtonColor: '#7dd3fc', // blue-500 (Tailwind)
      buttonsStyling: false, 
      customClass: {
        popup: ' bg-sky-300  rounded-xl shadow-lg',
        confirmButton: 'bg-sky-300 rounded-sm  px-6 py-2 text-sky-950',
      },
      showClass: {
        popup: 'animate__animated animate__fadeInDown',
      },
      hideClass: {
        popup: 'animate__animated animate__fadeOutUp',
      }
    });
  };

  const passwordAlert = (message) => {
    Swal.fire({
      icon: "error",
      title: "Weak Password",
      html: `<p style="text-align: justify;">${message}</p>` ,
      confirmButtonText: 'Got it!',
      background: ' #082f49', // sky-950
      color: '#7dd3fc', // sky-300
      iconColor: '#FF0000', // 
      confirmButtonColor: '#7dd3fc', // blue-500 (Tailwind)
      
      buttonsStyling: false,   
 
      customClass: {
        popup: ' bg-sky-300  rounded-xl shadow-lg',
        confirmButton: 'bg-sky-300 rounded-sm  px-6 py-2 text-sky-950',
      },
      showClass: {
        popup: 'animate__animated animate__fadeInDown',
      },
      hideClass: {
        popup: 'animate__animated animate__fadeOutUp',
      }

    });

  }

  //Function Button
  const handleSignUpSubmit = async (data,event) => {

    event.preventDefault(); 
    // Get the clicked button
    const buttonClicked = event.nativeEvent.submitter?.value;
  
    if(!data.email){
      //If the data doesnt have any value it will make an error message
      setError("email", { type: "required", message: "Email is required" });
    }
     
    if (buttonClicked === "Send Code") {
      //If the user click  the send code
      try {
        if(data.email){
          setVerificationLoading(true);
         
          const res = await fetch('/api/verification', {
            method: 'POST',  // POST request
            headers: { 'Content-Type': 'application/json' }, //Json format
            body: JSON.stringify({ email: data.email.toString() }), // The data that will be sent to the backend
          });

          if (!res.ok) { //If the result has an error
            const result = await res.json();
            if("message" in result){
              setError("email", { type: "required", message: result.message });
            }
          
            if ("rateLimitMessage" in result) {
              rateLimitCodeAlert(result.rateLimitMessage);
            }
          } else { //If the result has no error
            const result = await res.json();
            verificationCodeAlert(result.message);
          }
          startTimer();

        }
        
      } catch (error) {
        console.error("Error during signup:", error);
        alert("Something went wrong. Please try again later.");
      }

      setVerificationLoading(false);
   
    }
  
     else if (buttonClicked === "Sign up") {
      let hasError = false;
      // Check for empty fields
      if (!data.name) {
        setError("name", { type: "required", message: "Username is required" });
        hasError = true;
      }
    
      if (!data.password) {
        setError("password", { type: "required", message: "Password is required" });
        hasError = true;
      }
    
      if (!data.reEnterPassword) {
        setError("reEnterPassword", { type: "required", message: "Re-Enter password is required" });
        hasError = true;
      }
    
      // Check for password mismatch
      if (data.password && data.reEnterPassword && data.password !== data.reEnterPassword) {
        setError("password", { type: "mismatch", message: "Passwords do not match" });
        setError("reEnterPassword", { type: "mismatch", message: "Passwords do not match" });
        hasError = true;
      }

      if (!data.verifyCode) {
        setError("verifyCode", { type: "required", message: "Code is required" });
        hasError = true;
      }
    
      // If there's an error, stop execution
      if (hasError) return;
    
      // No errors, proceed with signup logic
      try {

        if(data){
          setSignupLoading(true);
          const res = await fetch('/api/signup', {
            method: 'POST',  // POST request
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              name: data.name.toString(),
              email: data.email.toString(),
              password: data.password.toString(),
              verifyCode: data.verifyCode,

             }),
          });

          if (!res.ok) {
            const result = await res.json();
        
            if ("codeMessage" in result) {
              setError("verifyCode", { type: "required", message: result.codeMessage });
              
            }

           if("emailMessage" in result){
              setError("email", { type: "required", message: result.emailMessage });

            }
           if("passwordMessage" in result){
            setError("password", { type: "required", message: result.passwordMessage });
            setError("reEnterPassword", { type: "required", message: result.passwordMessage });
            passwordAlert(result.alertPassMessage);
          }
          } else {
            const result = await res.json();
            verificationCodeAlert(result.message);
        
          }
        }
        
      } catch (error) {
        console.error("Error during signup:", error);
        alert("Something went wrong. Please try again later.");
      }
      setSignupLoading(false);
    }
  };

  const handleLoginSubmit = async (data,event) => {

    event.preventDefault(); 
    let hasError = false;

    if(!data.emailLogin){
      setError("emailLogin", { type: "required", message: "Email is required" });
      hasError=true;
    }

    if(!data.passwordLogin){
      setError("passwordLogin", { type: "required", message: "Password is required" });
      hasError=true;
    }

    if (hasError) return;
    if(data){
    
      setLoginLoading(true);
      const res = await fetch('/api/login', {
        method: 'POST',  
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
           email: data.emailLogin.toString(),
           password:  data.passwordLogin.toString(),
          }),
      });

      if (res.ok) {
        window.location.reload();
      }
      else{
        const result = await res.json();
        if("messageEmail" in result){
          setError("emailLogin", { type: "required", message: result.messageEmail });

        }
        if("messagePassword" in result){
          setError("passwordLogin", { type: "required", message: result.messagePassword });
        }

        }

      setLoginLoading(false);
  
  }

}

  return (
    <>
      {isLoginOpen && (
        <>
        <div className="bg-black/50 fixed inset-0 min-h-[100dvh] overflow-y-auto
          scrollbar-hidden
          overflow-x-hidden
          backdrop-blur-sm
          z-10">

          {/* Modal overlay */}
          <div className="absolute w-[100dvw]   min-h-220 
            h-[100%]          
            overflow-y-auto
            grid place-items-center          
            ">

          {/* Modal content */}
          
          <div className="z-20 bg-sky-300 absolute                
            max-md:w-[90%]
            max-xl:w-[90%]
            h-[70%]
            flex 
            w-1/2
            rounded-2xl
            overflow-hidden
   
            ">

            {/* Close Button */}
            <FontAwesomeIcon
              onClick={loginClick}
              icon={faXmark}
              className="z-10 absolute max-md:text-black text-white text-xl top-2 left-2 active:text-red-500 cursor-pointer"
          />

            {/* Left-side Image Section */}
            <div className="relative bg-sky-950 w-1/2 max-md:w-full grid place-items-center p-4 max-md:hidden">
             <img  className="w-1/2 " src="/Logo.png" alt="" srcSet="" />
            </div>

            {/* Right-side Login Form */}
            < div className="relative w-1/2 max-md:w-full text-black 
              overflow-x-hidden
              overflow-y-auto
              flex
              items-center
              bg-sky-300">
               {/* Login Form */}
              <form ref={loginForm} onSubmit={handleSubmit(handleLoginSubmit)} className="absolute 
              left-0
              transition-all duration-500
              bg-sky-300 flex flex-col justify-center gap-4 w-full p-2 ">
                <h1 className="font-bold text-3xl self-center">Login</h1>

                {/* Email Input */}
                <section className={`
                   ${errors.emailLogin ? "Error" : " "} 
                
                 relative bg-sky-300 w-full
                 flex items-center outline-1
                  focus-within:outline-sky-950`}
                >
                  <input
                    className="peer w-[90%] p-2  focus:outline-0 transition-all duration-300 "
                    type="email"
                    id="email"
                    placeholder=""
                    {...register("emailLogin")}
                    
                  />
                  <FontAwesomeIcon className="peer-focus:text-sky-950 w-[10%]" icon={faEnvelope} />
                  <label
                    htmlFor="email"
                    className="absolute left-2 bg-sky-300 pl-1 pr-1 select-none transition-all duration-300 peer-not-placeholder-shown:-translate-y-5 peer-focus:-translate-y-5"
                  >
                    Email
                  </label>
                </section>
                {errors.emailLogin && <p className="ErrorParagraph">{errors.emailLogin.message}</p>}

                {/* Password Input */}
                <section className={`
                  ${errors.passwordLogin ? "Error" : " "} 
                  relative bg-sky-300 w-full flex items-center
                  outline-1 focus-within:outline-sky-950`}
                
                >

                  <input
                    className="peer w-[90%] p-2 pr-10 focus:outline-0 transition-all duration-300"
                    type={isPassShown ? "text" : "password"}
                    id="password"
                    placeholder=""
                    {...register("passwordLogin")}
                    
                  />
                  <FontAwesomeIcon className="peer-focus:text-sky-950 w-[10%]" icon={faLock} />
                  <FontAwesomeIcon
                    onClick={() => setIsPassShown((prev) => !prev)}
                    className="invisible absolute right-8 peer-not-placeholder-shown:visible text-sm peer-focus:text-sky-950 cursor-pointer w-[10%]"
                    icon={isPassShown ? faEye : faEyeSlash}
                  />
                  <label
                    htmlFor="password"
                    className="absolute left-2 bg-sky-300 pl-1 pr-1 select-none transition-all duration-300 peer-not-placeholder-shown:-translate-y-5 peer-focus:-translate-y-5"
                  >
                    Password
                  </label>
                </section>
                {errors.passwordLogin && <p className="ErrorParagraph">{errors.passwordLogin.message}</p>}


                {/* Forgot password */}
                <div className="w-full">
                  <p className="cursor-pointer">Forgot password?</p>
                </div>

                {/* Submit Button */}
                <button
                  className="bg-sky-950 w-1/3 place-self-center grid place-items-center rounded-lg p-2 text-white cursor-pointer"
                  type="submit"
                >
                  {loginLoading ? <LoadingDots /> : "Log in"}
                </button>

                <p className="text-center">
                  Don't have an account? <span onClick={signinCLick}  className="cursor-pointer">Sign up</span>
                </p>
              </form>

              {/* Sign Up Form */}
              <form ref={signInForm} onSubmit={handleSubmit(handleSignUpSubmit)} className="absolute bg-sky-300 flex flex-col        
                h-fit
                transition-all duration-500 left-full
                justify-center gap-4 w-full p-2 ">
                <h1 className="font-bold text-3xl self-center">Sign Up</h1>

                {/* Username */}
                <section className={`
                ${errors.name ? "Error" : " "} 
                  
                  "relative bg-sky-300 w-full flex items-center
                  text-sky-950
                   outline-1 "
                  `}>

                  <input className="peer w-[90%] p-2 focus:outline-0 transition-all duration-300" type="text" id="username" placeholder=""
                  {...register("name")}
                  />
                  <FontAwesomeIcon className=" w-[10%]" icon={faUser}/>
                  <label
                    htmlFor="username"
                    className="absolute left-4 bg-sky-300 pl-1 pr-1 select-none transition-all duration-300 peer-not-placeholder-shown:-translate-y-5 peer-focus:-translate-y-5"
                  >
                    Username
                  </label>
                </section>

                {errors.name && <p className="ErrorParagraph">{errors.name.message}</p>}

                {/* Email */}
                <section className={`
                  ${errors.email ? "Error" : " "} 
                  relative bg-sky-300 w-full flex items-center
                  outline-1 focus-within:outline-sky-950 text-sky-950
                  `}>

                  <input className={`
                    ${errors.email ? "text-red-600" : ""} 
                 
                  peer w-[90%] p-2 focus:outline-0 transition-all duration-300`} type="email" id="signUpEmail" placeholder="" 
                    {...register("email")}
                  />
                  
                  <FontAwesomeIcon className=" w-[10%]" icon={faEnvelope} />
                  <label
                    htmlFor="signUpEmail"
                    className="absolute left-2 bg-sky-300 pl-1 pr-1 select-none transition-all duration-300 peer-not-placeholder-shown:-translate-y-5 peer-focus:-translate-y-5"
                  >
                    Email
                  </label>
                  
                </section>
                {errors.email && <p className="ErrorParagraph">{errors.email.message}</p>}
      
                {/* Password */}
                <section className={`  ${errors.password ? "Error" : " "} 
                relative bg-sky-300 w-full flex items-center
                 outline-1 focus-within:outline-sky-950 text-sky-950`}>
                  <input
                    {...register("password")}
                    className="peer w-[90%] p-2 pr-10 focus:outline-0 transition-all duration-300"
                    type={isSignInPassShown ? "text" : "password"}
                    id="signUpPassword"
                    placeholder=""
                  />
                  <FontAwesomeIcon className=" w-[10%]" icon={faLock} />
                  <FontAwesomeIcon
                    onClick={() => setIsSignInPassShown((prev) => !prev)}
                    className="invisible absolute right-8 peer-not-placeholder-shown:visible text-sm  cursor-pointer w-[10%]"
                    icon={isSignInPassShown ? faEye : faEyeSlash}
                  
                  />

                  <label
                    htmlFor="signUpPassword"
                    className="absolute left-2 bg-sky-300 pl-1 pr-1 select-none transition-all duration-300 peer-not-placeholder-shown:-translate-y-5 peer-focus:-translate-y-5"
                  >
                    Password
                  </label>
                </section>
                {errors.password && <p className="ErrorParagraph">{errors.password.message}</p>}

                {/* Re-enter Password */}
                <section className={`  
                  ${errors.reEnterPassword ? "Error" : " "}
                  relative bg-sky-300 w-full
                  flex items-center outline-1 
                  focus-within:outline-sky-950 
                  text-sky-950`}
                 >
                  <input
                    className="peer w-[90%] p-2 pr-10 focus:outline-0 transition-all duration-300"
                    type={isSignInReEnterPassShown ? "text" : "password"}
                    
                    placeholder=""
                    id="signUpReEnterPassword"
                    {...register("reEnterPassword")}
                  />
                  <FontAwesomeIcon className=" w-[10%]" icon={faLock} />
                  <FontAwesomeIcon
                    onClick={() => setIsSignInReEnterPassShown((prev) => !prev)}
                    className="invisible absolute right-8 peer-not-placeholder-shown:visible text-sm  cursor-pointer w-[10%]"
                    icon={isSignInReEnterPassShown ? faEye : faEyeSlash}
              
                  />

                  <label
                    htmlFor="signUpReEnterPassword"
                    className="absolute left-2 bg-sky-300 pl-1 pr-1 select-none transition-all duration-300 peer-not-placeholder-shown:-translate-y-5 peer-focus:-translate-y-5"
                  >
                    Re-Enter Password
                  </label>
                </section>

                {errors.reEnterPassword && <p className="ErrorParagraph">{errors.reEnterPassword.message}</p>}

                  {/*Verification Code */}
                  <section className={`
                  ${errors.verifyCode ? "Error" : " "}
                  relative bg-sky-300 w-full flex items-center justify-evenly
      
                  outline-1 focus-within:outline-sky-950`}>
                  <input
                    className="peer w-[90%] p-2 pr-10 
                     focus:outline-0 transition-all duration-300  relative
                     justify-self-start
                     "
                    type="text"
                    
                    placeholder=""
                    id="signUpCode"
                    maxLength="6" pattern="\d{6}" 
                    inputMode="numeric"

                    {...register("verifyCode")}
                  />

                  <button className="bg-sky-950 p-1 rounded-sm text-white  " value="Send Code"    name="action"
                   disabled={timer > 0}
                      
                  >
                      {!verificationLoading ? (
                          timer > 0 ? (
                              <span>{timer}</span>
                          ):
                              <FontAwesomeIcon className="text-white cursor-pointer" icon={faPaperPlane} />
                               
                        ) 
                      :
                      (
                          timer > 0 ? (
                              <span>{timer}</span>
                          ) :
                          <LoadingDots />
                      )

                      }
                  </button>
                  <label
                    htmlFor="signUpCode"
                    className="absolute left-2 bg-sky-300 pl-1 pr-1 select-none transition-all duration-300 peer-not-placeholder-shown:-translate-y-5 peer-focus:-translate-y-5"
                  >
                    Code
                  </label>
                </section>

                {errors.verifyCode && <p className="ErrorParagraph">{errors.verifyCode.message}</p>}

                {/* Submit Button */}

                <button className="bg-sky-950 w-1/3 place-self-center rounded-lg p-2 text-white cursor-pointer grid place-items-center" 
                type="submit" value="Sign up"
                >
                {signupLoading ? <LoadingDots /> : "Sign up"}

                </button>
             
                <p className="text-center">
                  Already have an account? <span onClick={signinCLick} className="cursor-pointer">Log in</span>
                </p>
              </form>
            </div>
          </div>
          </div>
          </div>
        </>
      )}
    </>
  );
};

export default Login;
