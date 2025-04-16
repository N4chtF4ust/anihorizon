"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams, useParams, useRouter, notFound } from "next/navigation";
import AnimeCard from "@/app/components/page/main/animeCard";
import LoadingSpinner from "@/app/components/loading/loading";
import DropdownPagination from "@/app/components/pagination/DropdownPagination";
import EpButton from "@/app/components/watch/EpButton"

import VideoPlayer from '@/app/components/watch/VideoPlayer';


const videoData = {
  "intro": {
    "start": 31,
    "end": 111
  },
  "outro": {
    "start": 1376,
    "end": 1447
  },
  "sources": [
    {
      "url": "https://ec.netmagcdn.com:2228/hls-playback/71f87b4028d27b3ba749bd2029f3248245618a740ca81a9a9863f257784436f85c939482f4d306945639b935dc612f23e90c190103dcbf12472df149b1deebb5d59be91a84c755a66bde4e2bfd39ee61e466d5652c9ef378658a15ce03d37fb705c0793befe2be40667ecc8a1e5f48401497c392cd16eca299dbbc40ec5b1b00dfd2617bbee7170da819faf35960a5b5/master.m3u8",
      "isM3U8": true,
      "type": "hls"
    }
  ],
  "subtitles": [
    {
      "url": "https://s.megastatics.com/subtitle/73fd2e74257659a8ef9b9cdd004623a5/eng-2.vtt",
      "lang": "English"
    },
    {
      "url": "https://s.megastatics.com/thumbnails/76c7d19582984c21fb4c9962b812820a/thumbnails.vtt",
      "lang": "thumbnails"
    }
  ]
};

function Page() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  const { query } = useParams();
  const ep = String(searchParams.get("ep"));

  const [loading, setLoading] = useState(true);
  const [animeList, setAnimeList] = useState(null);
  const [isNotFound, setIsNotFound] = useState(false);
  const [buttonEpPagination, setButtonEpPagination] = useState(null);


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
      } catch (error) {
        console.error("Error fetching anime:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnime();


  }, []);

  const [watch, setWatch] = useState(null);

  const Watch = async () => {
    console.log("Fetching data for episode:", ep);
  
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
      Watch();
    }
  }, [ep]);
  
  useEffect(() => {
    if(watch){
      console.log("Watch state updated:", watch);

    }
    
   
  }, [watch]);


    // Handle pagination change
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

  return (
    <section className="realtive inset-0 pt-20 -z-10 flex justify-center">
      <main className="grid grid-cols-5 grid-rows-[auto] w-[80%] h-[90%] absolute grid-rows-5 gap-4 max-md:w-[90%] z-0">
        {/* Video */}
        <div className="col-span-4 row-span-2 bg-blue-400 max-md:col-span-5">

          {watch ? (<> <VideoPlayer videoData={watch} /></>) : (<></>) }
        
         

        </div>

        {/* Anime Info & Episodes */}
        <div className="col-span-4 col-start-1 row-start-3 rounded-lg  max-md:col-span-5 bg-white/10 p-2">
          {Array.isArray(animeList?.episodes) && animeList.episodes.length > 100? (
            <>
              <DropdownPagination
                data={animeList.episodes}
                onChange={handlePaginationChange}
              />

              {/*buttons */ }
              <EpButton buttonEpPagination={buttonEpPagination} ep={ep}/>

            
            </>
          ):(
            <>
              <EpButton buttonEpPagination={animeList.episodes} ep={ep}/>
            </>
          )
          
          
          }
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
