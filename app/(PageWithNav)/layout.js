import React from 'react';
import Link from 'next/link';
import Nav from "@/app/components/page/navigation/nav";

// Custom layout for the "About" section
const NavLayout = ({ children }) => {
  return (


      <>
        <Nav/>
     
     {children} {/* This will render the page-specific content */}
      </>
            
    


  );
};

export default NavLayout;
