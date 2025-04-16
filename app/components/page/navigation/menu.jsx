import { useState } from "react";
import Link from "next/link";

const Menu = ({ isMenuOpen }) => {
  return (
    <div
      className={`absolute bg-sky-300 mt-24 w-1/8 flex flex-col justify-evenly items-center
        transition-all  text-black font-bold rounded-2xl p-4
        max-sm:w-[92%]
        max-md:w-[50%]
        max-lg:w-[50%]
        right-4
        
        ${isMenuOpen ? "z-10" : "hidden"}`}
    >
      <Link href="/" className="nav-menu-hover">
        Home
      </Link>
      <Link href="/RecentAdded" className="nav-menu-hover">
        Recent Added
      </Link>
      <Link href="/LatestCompleted" className="nav-menu-hover">
        Latest Completed
      </Link>
      <Link href="/TopAiring" className="nav-menu-hover">
        Top Airing
      </Link>
    </div>
  );
};

export default Menu;
