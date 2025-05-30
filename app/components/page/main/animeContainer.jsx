import dynamic from "next/dynamic";
import React, { Suspense } from "react";
import ShimmerCard from "@/app/components/loading/ShimmerCard";
import AnimeCard from "@/app/components/page/main/animeCard";
import Pagination from "@/app/components/pagination/pagination"




function AnimeContainer({ loading, animeList, page }) {
  return (
    <>
      <section
        className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 p-4 ${
          loading ? "animate-fade" : "anime-container"
        }`}
      >
        {loading
          ? Array.from({ length: 10 }).map((_, i) => <ShimmerCard key={i} />)
          : animeList.results.map((anime, index) => (
              <AnimeCard key={anime.id} anime={anime} index={index} />
            ))}
      </section>

      {!loading && (
        <Suspense fallback={<div></div>}>
          <Pagination currentPage={page} totalPages={animeList.totalPages} />
        </Suspense>
      )}
    </>
  );
}

export default AnimeContainer;
