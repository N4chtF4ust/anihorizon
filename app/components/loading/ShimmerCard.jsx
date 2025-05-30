// components/loading/ShimmerCard.tsx
"use client";

import React from "react";

const ShimmerCard = () => {
  return (
    <div className="animate-pulse bg-zinc-800/50 rounded-xl shadow-md w-full h-75 flex flex-col items-center">
      <div className="bg-zinc-700 h-[85%] w-full rounded-xl  shimmer" />
      <div className="h-4 bg-zinc-700 rounded w-3/4 mt-2 shimmer" />
   
    </div>
  );
};

export default ShimmerCard;
