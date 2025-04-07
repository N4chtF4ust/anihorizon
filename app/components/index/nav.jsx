"use client";

import { useRef, useState,useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Menu from "@/app/components/index/menu";
import Login from "@/app/components/index/login";
import LoadingSpinner from "@/app/components/loading/loading";

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMagnifyingGlass,faClapperboard,faTv,faHourglass } from '@fortawesome/free-solid-svg-icons';
import debounce from 'lodash.debounce';
import Cookies from 'js-cookie';
import jwt from 'jsonwebtoken';




const Nav = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [user, setUser] = useState(null); // This will store user data (userId, email)

  

  

  const menuPop = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const loginClick = () => {
    setIsMenuOpen(false);
    setIsLoginOpen(!isLoginOpen);
  };

  const searchClick = () => {
    setIsSearchOpen(!isSearchOpen);

    if(isMobile){
      console.log(searchRef.current)

      searchRef.current.classList.toggle("max-md:hidden");

    }
  };



  const [isMobile, setIsMobile] = useState(true);
  const searchRef = useRef(null);


  useEffect(() => {



      const token = Cookies.get('token') || false;
      if (token) {
        let decoded;
        try {
          decoded = jwt.decode(token);
          console.log(decoded); // Log the decoded payload
        } catch (error) {
          console.error('Invalid token:', error);
        } finally {
          setUser(decoded);
        }
      }
    

    

    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768); // Adjust breakpoint as needed
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);



  }, []);





  const [debounceQuery, setDebounceQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loadingSearch, setLoadingSearch] = useState(false);
 

  const handleSearch = debounce(async (event) => {
    const searchQuery = event.target.value;
    setDebounceQuery(searchQuery);

    if (searchQuery) {
      setLoadingSearch(true);

      try {
        const res = await fetch(`/api/search/${searchQuery}`);
        const data = await res.json();

        if (data) {
          setResults(data.results);
          setLoadingSearch(false);
          console.log(data.results);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoadingSearch(false);
      }
    } else {
      setResults([]);
      setLoadingSearch(false);
    }
  }, 500); // 500ms debounce delay





  return (
    <>
      <nav className="  bg-amber- absolute top-0 w-full h-20 text-white z-10    ">
        {/* Left side wrapper */}
        <section className={`    bg-yellow- absolute h-full  flex gap-6 gap-x-6 items-center 
          w-1/3
          max-md:w-[100%]
          max-xl:w-2/3
          
             max-2xl:w-[50%]  `} >
          <img className="relative h-[60%] left-3  " src="/Logo.png" alt="Logo" />

          {/* Search Wrapper */}
          <FontAwesomeIcon
  className={` bg-amber-  relative left-4 max-md:left-0  text-3xl w-7 h-7 transition-colors ${isMobile ? (isSearchOpen ? "text-sky-400" : "") : ""}`}
  icon={faMagnifyingGlass}
  onClick={isMobile ? searchClick : undefined}
/>

<input
  type="search"
  placeholder="Search"
  ref={searchRef}

  onChange={handleSearch}
  

  className={`
    peer 
    p-2
    rounded-sm
    max-md:hidden

     max-md:left-[50%] max-md:-translate-x-1/2 max-md:-translate-y-1/2
     max-md:absolute max-md:top-25 max-md:w-[95%]

    

    w-[70%]
    transition-all duration-300 bg-white h-1/2 text-black 
    
  `}
/>

<div className="hidden   peer-not-placeholder-shown:peer-focus:block active:block  absolute bg-sky-300 left-31 top-20  w-[70%] max-h-80 overflow-y-auto
max-md:left-1/2 max-md:-translate-x-1/2 max-md:w-[95%] max-md:top-32 overflow-x-hidden rounded-md 
    [&::-webkit-scrollbar]:w-2
  [&::-webkit-scrollbar-track]:bg-white
  [&::-webkit-scrollbar-thumb]:bg-gray-300


">
{loadingSearch ? (

  <div className="w-full  p-4 text-black grid place-content-center " >
     <LoadingSpinner LoadingColor="#000000" strokeColor="#808080" />

  </div>


) : results.length === 0 ? (
  <h1 className="text-black m-4" >No anime found</h1>
) : (
  results.map((anime) => (
    <Link key={anime.id} href={`/info/${anime.title}?id=${anime.id}`} passHref>
      <section
        className="relative flex justify-evenly bg-sky-300 w-full h-20 p-1 border-b-1 border-black border-dashed
        cursor-pointer hover:bg-sky-400/50"
      >
        <img className="h-full" src={anime.image} alt={anime.title} />

        <aside className="relative w-[85%] h-full flex flex-col justify-center">
          <h1 className="text-black font-bold truncate pl-2">{anime.title}</h1>
          <div className="text-black flex gap-3 items-center">
            <h5 className="flex items-center gap-1">
              <FontAwesomeIcon icon={faTv} className="font-thin pl-2" />
              <span className="text-[.7rem]">{anime.type}</span>
            </h5>
            <h5 className="flex items-center gap-1">
              <FontAwesomeIcon icon={faHourglass} />
              <span className="text-[.7rem]">{anime.duration}</span>
            </h5>
          </div>
        </aside>
      </section>
    </Link>
  ))
)}

</div>

        </section>

        {/* Right side wrapper */}
        <section className="  absolute w-1/3 h-full right-0 flex items-center flex-col justify-center">
          <div
            className="group relative size-10 self-end right-3 flex flex-col justify-between transition cursor-pointer"
            onClick={menuPop}
            aria-label="Toggle menu"
          >
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className={`w-full h-1 transition duration-300 ${
                  isMenuOpen ? "bg-sky-400" : "bg-white"
                }`}
              />
            ))}
          </div>
        </section>

        {/* Login Button */}
        <button
          type="button"
          onClick={loginClick}
          className="right-15 top-5 absolute rounded-sm bg-white p-2 font-bold text-black active:bg-sky-400 cursor-pointer"
          aria-label="Log in"
        >
         {user ? user.userName : "Log in"}
        </button>
      </nav>

    
      {/* Sidebar Menu */}
      <Menu isMenuOpen={isMenuOpen} />

      {/* Login Modal */}

      {user ? null : (

      <Login isLoginOpen={isLoginOpen} setIsLoginOpen={setIsLoginOpen} />
      )}

     
    </>
  );
};

export default Nav;
