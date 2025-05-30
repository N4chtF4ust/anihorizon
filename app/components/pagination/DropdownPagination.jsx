"use client";

import { useEffect, useState, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCaretDown } from "@fortawesome/free-solid-svg-icons";

export default function CustomDropdownPagination({
  data = [],
  itemsPerPage = 100,
  onChange,
  epParam,
}) {
  const totalPages = Math.ceil(data.length / itemsPerPage);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedPage, setSelectedPage] = useState(0);
  const [startDropdown, setStartDropdown] = useState(0);
  const [endDropdown, setEndDropdown] = useState(itemsPerPage); // Initialize with itemsPerPage
  
  // Use refs to track previous values and prevent unnecessary updates
  const prevDataLengthRef = useRef(data.length);
  const prevEpParamRef = useRef(epParam);
  const prevSelectedPageRef = useRef(selectedPage);
  const initialRenderRef = useRef(true);
  
  // Initialize dropdown values on first render
  useEffect(() => {
    if (data.length > 0) {
      const end = Math.min(itemsPerPage, data.length);
      setEndDropdown(end);
    }
  }, [data, itemsPerPage]);
  
  // For ep parameter matching - run only when epParam or data changes
  useEffect(() => {
    // Skip if data or epParam hasn't changed
    if (prevDataLengthRef.current === data.length && 
        prevEpParamRef.current === epParam && 
        !initialRenderRef.current) {
      return;
    }
    
    // Update refs
    prevDataLengthRef.current = data.length;
    prevEpParamRef.current = epParam;
    
    if (epParam !== null && epParam !== undefined && data.length > 0) {
      const epIndex = data.findIndex(item => 
        item.ep === epParam || item.episode === epParam || item.id === epParam
      );
      
      if (epIndex !== -1) {
        const pageNumber = Math.floor(epIndex / itemsPerPage);
        setSelectedPage(pageNumber);
      }
    }
    
    initialRenderRef.current = false;
  }, [data, epParam, itemsPerPage]);
  
  // For pagination updates
  useEffect(() => {
    // Skip if we don't need to update
    if (prevSelectedPageRef.current === selectedPage && !initialRenderRef.current) {
      return;
    }
    
    prevSelectedPageRef.current = selectedPage;
    
    const start = selectedPage * itemsPerPage;
    const end = Math.min(start + itemsPerPage, data.length);
    
    setStartDropdown(start);
    setEndDropdown(end);
    
    // Call onChange with a stable reference to prevent loops
    const paginatedData = data.slice(start, end);
    onChange(paginatedData, selectedPage);
  }, [selectedPage, data, itemsPerPage, onChange]);
  
  const handleSelect = (i) => {
    if (i !== selectedPage) {
      setSelectedPage(i);
    }
    setIsOpen(false);
  };

  return (
    <>


    <div className="relative inline-block z-20">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full outline-1 outline-white text-white font-bold p-2 pr-10 rounded-md text-left text-sm"
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
          [&::-webkit-scrollbar-thumb]:bg-gray-300">
          {Array.from({ length: totalPages }, (_, i) => {
            const start = i * itemsPerPage;
            const end = Math.min((i + 1) * itemsPerPage, data.length);
            return (
              <li
                key={i}
                onClick={() => handleSelect(i)}
                className={`cursor-pointer px-2 py-2 font-bold hover:bg-sky-400 transition-all text-sm
                  ${selectedPage === i ? 'bg-sky-400' : ''}`}
              >
                {start + 1} - {end}
              </li>
            );
          })}
        </ul>
      )}
    </div>
    </>
  );
}