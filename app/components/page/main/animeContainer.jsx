'use client';

import React, { Suspense } from 'react';
import LoadingSpinner from "@/app/components/loading/loading";
import Pagination from "@/app/components/pagination/pagination";
import AnimeCard from "@/app/components/page/main/animeCard";

function AnimeContainer({ loading, animeList, page }) {
  return (
    <>
      <section className={loading ? "" : "anime-container"}>
        {loading ? (
          <div className="relative h-[50svh] grid place-content-center">
            <LoadingSpinner LoadingColor="#FFFFFF" strokeColor="#FFFFFF" />
          </div>
        ) : (
          animeList.results.map((anime, index) => (
            <AnimeCard key={anime.id} anime={anime} index={index} />
          ))
        )}
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
