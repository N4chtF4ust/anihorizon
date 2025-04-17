"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams, useParams, useRouter, notFound } from "next/navigation";
import AnimeCard from "@/app/components/page/main/animeCard";
import LoadingSpinner from "@/app/components/loading/loading";
import DropdownPagination from "@/app/components/pagination/DropdownPagination";
import EpButton from "@/app/components/watch/EpButton";
import VideoPlayer from '@/app/components/watch/VideoPlayer';

function Page() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  const { query } = useParams();
  const ep = searchParams.get("ep") ;


  const [loading, setLoading] = useState(true);
  const [animeList, setAnimeList] = useState(null);
  const [isNotFound, setIsNotFound] = useState(false);
  const [buttonEpPagination, setButtonEpPagination] = useState(null);
  const [watch, setWatch] = useState(null);

  // Fetch anime data
  useEffect(() => {
    const fetchAnime = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/Info?id=${query}`);
        if (!response.ok) {
          setIsNotFound(true);
          return;
        }
        const data = await response.json();
        setAnimeList(data || []);
        
        // Initialize buttonEpPagination with first 100 episodes or all episodes
        if (data && Array.isArray(data.episodes)) {
          if (data.episodes.length > 100) {
            setButtonEpPagination(data.episodes.slice(0, 100));
          } else {
            setButtonEpPagination(data.episodes);
          }
        }
      } catch (error) {
        console.error("Error fetching anime:", error);
      } finally {
        setLoading(false);
   
      }
    };

    fetchAnime();

  }, [query]);

  const fetchEpisode = async () => {
    
    try {
      const response = await fetch(`/api/watch?ep=${ep}`);
      const data = await response.json();
      setWatch(data || []);
    } catch (error) {
      console.error("Error fetching anime:", error);
    }
  };
  
  useEffect(() => {
    if (ep) {
      fetchEpisode();
     
    }
    
  }, [ep]);
  
  useEffect(() => {
    if (watch) {
      console.log("Watch state updated:", watch);

    }
  }, [watch]);

  // Handle pagination change - removed duplicate function
  const handlePaginationChange = (items, page) => {
    console.log("Selected Page:", page);
    console.log("Items:", items);
    setButtonEpPagination(items);
  };

  // Show loading screen
  if (loading) {
    return (
      <main className="absolute inset-0 grid place-items-center">
        <LoadingSpinner LoadingColor="#FFFFFF" strokeColor="#FFFFFF" />
      </main>
    );
  }

  // Show 404 page
  if (isNotFound) {
    return notFound();
  }

  if (animeList) {
  // console.log("The data is", JSON.stringify(animeList.episodes, null, 2));
  }

  if(ep){
    if (!animeList.episodes.some(e => e.id.toString() === ep)) {
      return notFound();
    }

  }


  

  return (
    <section className="realtive inset-0 pt-20 -z-10 flex justify-center">
      <main className="grid grid-cols-5 grid-rows-[auto] w-[80%] h-[90%] absolute grid-rows-5 gap-4 max-md:w-[90%] z-0">
        {/* Video */}
        <div className="col-span-4 row-span-2 bg-white/10 max-md:col-span-5">
          {
  
          
          watch ? (
            <VideoPlayer videoData={watch} />
          ) : (
            <div className="min-w-[320px] min-h-[180px] w-full h-full aspect-video grid place-items-center text-white">
             

              {!ep && (<> <h1>Please select an episodes below</h1></>)}
            </div>
          ) 
        
        
        }
        </div>

        {/* Anime Info & Episodes */}
        <div className="col-span-4 col-start-1 row-start-3 rounded-lg max-md:col-span-5 bg-white/10 p-2">
          {Array.isArray(animeList?.episodes) && animeList.episodes.length > 100 ? (
            <>
              <DropdownPagination
                data={animeList.episodes}
                onChange={handlePaginationChange}
                epParam={ep}
              />
              
              {/* Only render EpButton when buttonEpPagination is available */}
              {buttonEpPagination && (
                <EpButton buttonEpPagination={buttonEpPagination} ep={ep} />
              )}
            </>
          ) : (
            <>
              {animeList?.episodes && (
                <EpButton buttonEpPagination={animeList.episodes} ep={ep} />
              )}
            </>
          )}
        </div>

        {/* Recommendations */}
        <div className="col-span-4 row-span-2 col-start-1 row-start-4 max-md:col-span-5 bg-white/10 p-2 rounded-lg">
          <h1 className="font-bold text-2xl max-md:text-xl truncate mt-2 mb-2">
            Recommendations:
          </h1>
          <section className={loading ? "grid place-items-center h-[80%]" : "anime-container"}>
            {animeList?.recommendations?.map((anime, index) => (
              <AnimeCard key={anime.id} anime={anime} index={index} />
            ))}
          </section>
        </div>

        {/* Sidebar */}
        <aside className="row-span-5 col-start-5 row-start-1 bg-blue-950 max-md:hidden">6</aside>
      </main>
    </section>
  );
}

export default Page;