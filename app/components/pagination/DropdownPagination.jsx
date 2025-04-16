"use client";

import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import {
  faCaretDown

} from "@fortawesome/free-solid-svg-icons";

export default function CustomDropdownPagination({
  data = [],
  itemsPerPage = 100,
  onChange,
}) {
  const totalPages = Math.ceil(data.length / itemsPerPage);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedPage, setSelectedPage] = useState(0);
  const [startDropdown, setStartDropdown] = useState(0);
  const [endDropdown, setEndDropdown] = useState(0);

  useEffect(() => {
    const start = selectedPage * itemsPerPage;
    const end = Math.min(start + itemsPerPage, data.length);
    const paginatedData = data.slice(start, end);

    setStartDropdown(start);
    setEndDropdown(end);
    onChange(paginatedData, selectedPage);
  }, [data, itemsPerPage, selectedPage]);

  const handleSelect = (i) => {
    setSelectedPage(i);
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block  z-20">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full outline-1 outline-white text-white font-bold p-2 pr-10 rounded-md text-left
        text-sm
        "
      >
        EP {startDropdown + 1} - {endDropdown}

        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-white">
           <FontAwesomeIcon icon={faCaretDown} />
        </div>

      </button>

      {isOpen && (
        <ul className="absolute z-10 mt-1 w-full bg-sky-300 text-black shadow-lg rounded-md max-h-55 overflow-auto
          [&::-webkit-scrollbar]:w-2
        [&::-webkit-scrollbar-track]:bg-white
        [&::-webkit-scrollbar-thumb]:bg-gray-300
        
        ">
          {Array.from({ length: totalPages }, (_, i) => {
            const start = i * itemsPerPage;
            const end = Math.min((i + 1) * itemsPerPage, data.length);
            return (
              <li
                key={i}
                onClick={() => handleSelect(i)}
                className="cursor-pointer px-2 py-2 font-bold hover:bg-sky-400  transition-all
                text-sm
                
                "
              >
               {start + 1} - {end}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
