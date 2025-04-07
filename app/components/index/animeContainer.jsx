
import React from 'react'
import LoadingSpinner from "@/app/components/loading/loading";
import Pagination from "@/app/components/pagination/pagination";
import  AnimeCard  from "@/app/components/index/animeCard";

function AnimeContainer({loading,animeList,page}) {
  return (
    <>

           <section className={loading ? "" : "anime-container"}>
               {loading ? (
                 <div className="relative h-[50svh]  grid place-content-center">
                      <LoadingSpinner LoadingColor="#FFFFFF" strokeColor="#FFFFFF" />
                 </div>
                 ) : (
                 animeList.results.map((anime,index) => 
                     ( <AnimeCard key={anime.id} anime={anime} index={index}/> )
                   )
                 )
               }
             </section>
   
             { loading ? null : (<Pagination   currentPage={page} totalPages={animeList.totalPages} />) }
          
    </> 
          
  )
}

export default AnimeContainer
