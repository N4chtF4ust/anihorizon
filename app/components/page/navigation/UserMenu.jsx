"use client";

import React, { useState, useEffect } from 'react';
import Cookies from 'js-cookie';

const UserMenu = ({ isUserLoginOpen}) => {

  const [mounted, setMounted] = useState(false); // Track if component is mounted

  useEffect(() => {
    setMounted(true); // Set mounted to true once component is rendered on the client
  }, []);

  const logout = async  () => {
    await fetch('/api/logout', { method: 'POST' })

   
    window.location.reload();
 
  };

  // Prevent server-side rendering mismatch by only rendering the component on the client
  if (!mounted) {
    return null; // Avoid rendering the component during SSR
  }

  return (
    <section
         className={`absolute bg-sky-300 mt-24 w-1/8 flex flex-col justify-evenly items-center
        transition-all  text-black font-bold rounded-2xl p-4
        max-sm:w-[92%]
        max-md:w-[50%]
        max-lg:w-[50%]
        right-4
        z-10
        
        ${isUserLoginOpen ? "" : "hidden"}`}
    >
      <button onClick={logout} className="bg-white p-2 rounded-sm cursor-pointer">
        Log out
      </button>
    </section>
  );
};

export default UserMenu;
