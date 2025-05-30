"use client"
import React, { useState, useEffect, useRef  } from "react";
import { useRouter } from 'next/navigation'

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import {
  faTv,
  faCalendarAlt,
  faCircleNotch,
  faThList,
  faTag,
  faSyncAlt,
  faFilm

} from "@fortawesome/free-solid-svg-icons";

const AnimeCard = ({ anime, index  }) => {

  //Hover will fix if the hover exceeded the html and it will fetch an anime info
  const [hoverLoading, setHoverLoading] = useState(true);
  const hoverAnimeTitles = useRef([]);
  const hoverAnimeDescriptions = useRef([]);
  const hoverAnimeEpisodes = useRef([]);
  const hoverAnimeSeasons= useRef([]);
  const hoverAnimeStatus= useRef([]);
  const hoverAnimeTypes = useRef([]);
  const hoverAnimeGenres = useRef([]);
  
  const hoverBoxes = useRef([]); 
  const CACHE_TIME = 60 * 60 * 1000 ; // 60 minutes /api/Info?id=${animeid}`

  const [hoverAnimeId,setHoverAnimeId] = useState(); 
  const [hoverAnimeTitle,setHoverAnimeTitle] = useState(); 
  const [hoverAnimeEp,setHoverAnimeEp] = useState(); 
  const router = useRouter();

  const [hoverAnimeCache, setHoverAnimeCache] = useState({});

  const fetchHoverAnime = async (animeid, hoverBox) => {
    // Check if data is already available for the anime (e.g., from a cache or state)
    const cachedData = hoverAnimeCache[animeid];
    if (cachedData) {
      setHoverLoading(false); // Skip loading if data is already available
      return cachedData;
    }
  
    // Fetch new data from API if not cached
    const response = await fetch(`/api/Info?id=${animeid}`);
    const data = await response.json();
    
    // Cache the fetched data for later use
    hoverAnimeCache[animeid] = data;
    
    setHoverLoading(false);
    return data;
  };
  
  const handleMouseEnter = async (event, index, animeid) => {
    // If data is already set, don't show loading animation
    if (hoverAnimeCache[animeid]) {
      setHoverLoading(false);
    } else {
      setHoverLoading(true);
    }
  
    // Reset list before fetching new data
    if (!hoverBoxes.current[index]) return;
  
    const hoverBox = hoverBoxes.current[index];
    const bodyRect = document.body.getBoundingClientRect();
    const childRect = hoverBox.getBoundingClientRect();
  
    // Hover will fix if the hover exceeded the html body
    if (childRect.right > window.innerWidth) {
      hoverBox.classList.add("right-[50%]");
      hoverBox.classList.remove("left-[50%]");
    } else if (childRect.bottom > window.innerHeight) {
      hoverBox.classList.add("bottom-[57%]");
      hoverBox.classList.remove("top-[43%]");
    } else if (childRect.top < 0) { // Fix: Check for top overflow correctly
      hoverBox.classList.add("top-[43%]");
      hoverBox.classList.remove("bottom-[57%]");
    }
  
    // Fetch data directly from the API or from the cache
    const data = await fetchHoverAnime(animeid, hoverBox);
  
    if (data && hoverAnimeTitles.current[index]) {
      const titleElement = hoverAnimeTitles.current[index];
      const descriptionElement = hoverAnimeDescriptions.current[index];
      const episodeElement = hoverAnimeEpisodes.current[index].querySelector("span");
      const seasonElement = hoverAnimeSeasons.current[index].querySelector("span");
      const statusElement = hoverAnimeStatus.current[index].querySelector("span");
      const typeElement = hoverAnimeTypes.current[index].querySelector("span");
      const genreElement = hoverAnimeGenres.current[index].querySelector("span");
  
      // Update text content
      titleElement.textContent = data.title;
      descriptionElement.textContent = data.description;
      episodeElement.textContent = data.totalEpisodes;
      seasonElement.textContent = data.season;
      statusElement.textContent = data.status;
      typeElement.textContent = data.type;
  
      // Set the data
      setHoverAnimeId(data.id);
      setHoverAnimeTitle(data.title);
      setHoverAnimeEp(data.episodes[0].id); // Will get the id of the first episode
  
      // Clear existing genres and append new ones
      genreElement.textContent = "";
      data.genres.forEach((name, i) => {
        const link = document.createElement("a");
        link.textContent = name;
        link.href = `/genres/${name.toLowerCase().replace(/\s+/g, "-")}`;
        link.className = "text-black hover:underline";
        genreElement.appendChild(link);
  
        // Add comma separator between genres, but not after the last one
        if (i < data.genres.length - 1) {
          genreElement.appendChild(document.createTextNode(", "));
        }
      });
  
      // Show the hover description and update loading state
      hoverBox.querySelector("#description_hoverWrapper").classList.remove("invisible");
    }
  
  
  



  };
  const watchAnime = () => {
    router.push(`/watch/${hoverAnimeId}?ep=${hoverAnimeEp}`);
  };

  //Wil direct to info
  const animeInfoClick = (animeID)=>{
    console.log(animeID)
    router.push(`/info/${animeID}`)


  }
  return (
    <div
      key={anime.id}
      data-id={anime.id}
      onMouseEnter={(event) => handleMouseEnter(event, index, anime.id)}
      className="anime-image-wrapper relative cursor-pointer"
    >
      <div className="anime-card group"
      
    
      >
        {anime.sub > 0 && <h1 className="episode-top-left"> EP {anime.sub}</h1>}
        
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="1.5"
          stroke="currentColor"
          className="play-svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15.91 11.672a.375.375 0 0 1 0 .656l-5.603 3.113a.375.375 0 0 1-.557-.328V8.887c0-.286.307-.466.557-.327l5.603 3.112Z"
          />
        </svg>
        <img
              onClick={() => animeInfoClick(anime.id)}
          src={anime.image}
          alt="Anime Thumbnail"
          className="h-full w-full group-hover:brightness-50 group-hover:blur-sm transition-all object-cover"
        />


        {/* Anime Hover */}
        <div
          ref={(element) => {
            hoverBoxes.current[index] = element;
          }}
          id="description_hover"
          className="hidden description_hover notgreaterThanLeft
           top-[43%] left-[50%]
           
          "
        >
          <svg
            className={`${
              !hoverLoading ? 'hidden' : null
            } text-black absolute inset-0 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[15%]`}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 200 200"
          >
            <circle fill="#000000" stroke="#000000" strokeWidth="15" r="15" cx="40" cy="65">
              <animate
                attributeName="cy"
                calcMode="spline"
                dur="2"
                values="65;135;65;"
                keySplines=".5 0 .5 1;.5 0 .5 1"
                repeatCount="indefinite"
                begin="-.4"
              />
            </circle>
            <circle fill="#000000" stroke="#000000" strokeWidth="15" r="15" cx="100" cy="65">
              <animate
                attributeName="cy"
                calcMode="spline"
                dur="2"
                values="65;135;65;"
                keySplines=".5 0 .5 1;.5 0 .5 1"
                repeatCount="indefinite"
                begin="-.2"
              />
            </circle>
            <circle fill="#000000" stroke="#000000" strokeWidth="15" r="15" cx="160" cy="65">
              <animate
                attributeName="cy"
                calcMode="spline"
                dur="2"
                values="65;135;65;"
                keySplines=".5 0 .5 1;.5 0 .5 1"
                repeatCount="indefinite"
                begin="0"
              />
            </circle>
          </svg>

          <div id="description_hoverWrapper" className="invisible 
          grid grid-cols-5 grid-rows-auto gap-2 gap-y-5
          ">

              <div className="col-span-3 row-span-3 ">
                          <h1
                            ref={(el) => (hoverAnimeTitles.current[index] = el)}
                            id="animeHoverTitle"
                            className="line-clamp-2 text-black font-bold"
                          >

                          </h1>
                          <p
                            ref={(el) => (hoverAnimeDescriptions.current[index] = el)}
                            id="animeHoverDescription"
                            className="text-black line-clamp-3 text-sm"
                          ></p>
              </div>

              <div className="
              col-span-2 row-span-3 col-start-4 
            
              ">
                       
                          <h3
                          ref={(el) => (hoverAnimeEpisodes.current[index] = el)}
                          className="text-black font-bold text-sm"
                          >
                             <FontAwesomeIcon icon={faFilm} />: <span className="font-normal"></span>
                          </h3>
                          <h3
                          ref={(el) => (hoverAnimeSeasons.current[index] = el)}
                          className="text-black font-bold text-sm"
                          >
                              <FontAwesomeIcon icon={faCalendarAlt}/>: <span className="font-normal"></span>
                          </h3>
                          <h3
                          ref={(el) => (hoverAnimeStatus.current[index] = el)}
                          className="text-black font-bold  text-sm" 
                          >
                            <FontAwesomeIcon icon={faSyncAlt}/>: <span className="font-normal"></span>
                          </h3>
                          <h3
                          ref={(el) => (hoverAnimeTypes.current[index] = el)}
                          className="text-black font-bold text-sm"
                          >
                            <FontAwesomeIcon icon={faThList}/>: <span className="font-normal"></span>
                          </h3>
              </div>

              <div className="col-span-5 row-start-4
             
              ">
                  
                          <h3
                            ref={(el) => (hoverAnimeGenres.current[index] = el)}
                            className="text-black font-bold text-sm"
                          >
                              <FontAwesomeIcon icon={faTag}/>: <span className="font-normal"></span>
                          </h3>
              </div>

              <div className="col-span-5 row-start-5
   
              ">
                          <div id="button_wrapper" className="w-full flex justify-center gap-4">
                            <button onClick={watchAnime}
                              type="button"
                              className="rounded-3xl
                              font-bold
                              text-black
                              px-15 bg-sky-600 p-3 cursor-pointer flex justify-center gap-2 items-center
                              text-sm  "
                            >
                              <svg className="w-8 h-8" fill="black" viewBox="0 0 20 20">
                                <polygon points="5,3 19,10 5,17" />
                              </svg>
                              Watch Now
                            </button>
                            <button type="button" className="rounded-full font-bold
                             text-black bg-sky-600 px-6  cursor-pointer
                             text-sm
                             "> 
                              +
                            </button>
                          </div>
              </div>

          </div>
        </div>
      </div>
      {/* Anime Title Wrapper */}
      <h3 className="w-full text-center line-clamp-2 overflow-hidden font-bold text-white">
        {anime.title}
      </h3>
    </div>
  );
};

export default AnimeCard;
