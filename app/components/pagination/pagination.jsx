"use client";

import { useRouter, useSearchParams } from "next/navigation";

const Pagination = ({ totalPages }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentPage = Number(searchParams.get("page")) || 1;

  const goToPage = (page) => {
    if (page < 1 || page > totalPages) return;
    router.push(`?page=${page}`);
  
  };

  // Determine range for pagination
  const pageNumbers = [];
  const startPage = Math.max(1, currentPage - 2);
  const endPage = Math.min(totalPages, startPage + 3);

  for (let i = startPage; i <= endPage; i++) {
    pageNumbers.push(i);
  }

  return (
    <div className="flex justify-center space-x-2 mt-4 text-black ">
      <button
        onClick={() => goToPage(currentPage - 1)}
        disabled={currentPage <= 1}
        className="cursor-pointer px-4 py-2 bg-white rounded disabled:bg-white/10 disabled:text-white disabled:cursor-not-allowed"
      >
        Prev
      </button>

      {pageNumbers.map((page) => (
        <button
          key={page}
          onClick={() => goToPage(page)}
          className={`cursor-pointer px-4 py-2 rounded ${
            page === currentPage ? "bg-sky-300 " : "bg-white"
          }`}
        >
          {page}
        </button>
      ))}

      <button
        onClick={() => goToPage(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="cursor-pointer px-4 py-2 bg-white rounded disabled:bg-white/10 disabled:text-white disabled:cursor-not-allowed"
      >
        Next
      </button>
    </div>
  );
};

export default Pagination;
