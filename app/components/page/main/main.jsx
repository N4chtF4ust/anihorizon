"use client";
import React, { useState, useEffect, useRef } from "react";
import { useSearchParams, useParams, useRouter, notFound } from "next/navigation";
import _ from "lodash";
//Components
import  AnimeContainer  from "@/app/components/page/main/animeContainer";

const Main = () => {
  const { query } = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const page = Number(searchParams.get("page")) || 1;
  const validQuery = query || "MostPopular";
  const [animeList, setAnimeList] = useState([]);
  const [loading, setLoading] = useState(true);
  
  if (!["TopAiring", "MostPopular", "RecentAdded", "LatestCompleted"].includes(validQuery)) {
    notFound();
    return null;
  }

  if(page > animeList.totalPages ){
    notFound();
    return null;
  }

  useEffect(() => {
    const fetchAnime = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/Anime/${_.kebabCase(validQuery)}?page=${page}`);
        if (!response.ok) throw new Error("Failed to fetch anime data");

        const data = await response.json();
        setAnimeList(data || []);
      } catch (error) {
      
        console.error("Error fetching anime:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnime();

    
  }, [page, validQuery]); 

  const formatText = (text) => text.match(/[A-Z][a-z]+/g).join(" ");

    return (

      <main className="absolute inset-0 pt-20 flex justify-center -z-10 ">
        
        {/* Left Container */}
        <section className="relative max-xl:hidden bg-yellow-700 w-1/5 h-full"></section>
  
        {/* Right Side */}
        <section className="w-3/5 max-xl:w-[95%]">
          {/* Slide Container */}
          <section className="relative h-90 w-full bg-amber-900 max-xl:h-50">
            <div id="Slide-Wrapper" className="bg-pink-500 w-full h-90 absolute max-xl:h-50"></div>
          </section>
  
          <h1 className="pl-0 p-5 font-bold text-white text-4xl">{formatText(validQuery)}</h1>
  
          {/* Anime Container */}
          <AnimeContainer  loading={loading} animeList={animeList} page={page} /> 

          </section>
      </main>
    );
  };
  
  export default Main;
  