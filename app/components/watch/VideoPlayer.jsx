import { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import LoadingSpinner from "@/app/components/loading/loading";

import {
    faPause,
    faPlay,
    faVolumeHigh,
    faForwardFast,
    faClosedCaptioning,
    faExpand,
    faCompress,
    faEllipsisVertical,
    faGear,
} from "@fortawesome/free-solid-svg-icons";

// Utility function to prevent rapid successive calls
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

const VideoPlayer = ({ videoData }) => {
  if (videoData.error) {
    return (
      <div className="text-center p-4 h-full">
        <h2 className="text-2xl font-bold text-red-600">Video Not Found</h2>
        <p className="text-gray-500 mt-2">
          We couldn't load the video. Please try again later or check the URL.
        </p>
      </div>
    );
  }
  
  const videoRef = useRef(null);
  const panelRef = useRef(null);
  const containerRef = useRef(null);
  const [showIntroButton, setShowIntroButton] = useState(false);
  const [showOutroButton, setShowOutroButton] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [selectedSubtitle, setSelectedSubtitle] = useState(videoData.subtitles[0]?.lang || "");
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [controlsVisible, setControlsVisible] = useState(true);
  const idleTimeoutRef = useRef(null); 
  const [isLoading, setIsLoading] = useState(true);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [availableQualities, setAvailableQualities] = useState([]);
  const [currentQuality, setCurrentQuality] = useState('auto');
  const hlsRef = useRef(null);
  const subtitleStylesApplied = useRef(false);
  const playPromiseRef = useRef(null); // Track current play promise
  const autoplayAttempted = useRef(false); // Track if we've tried autoplay

  const handleSkipIntro = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = videoData.intro.end;
    }
  };

  const handleSkipOutro = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = videoData.outro.end;
    }
  };

  const handleFullscreen = () => {
    const panel = panelRef.current;
    if (!panel) return;
  
    try {
      if (panel.requestFullscreen) {
        panel.requestFullscreen();
      } else if (panel.webkitRequestFullscreen) {
        panel.webkitRequestFullscreen();
      } else if (panel.mozRequestFullScreen) {
        panel.mozRequestFullScreen();
      } else if (panel.msRequestFullscreen) {
        panel.msRequestFullscreen();
      }
    } catch (error) {
      console.error("Fullscreen request failed:", error);
    }
  };
  
  const handleExitFullscreen = () => {
    try {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      }
    } catch (error) {
      console.error("Exit fullscreen request failed:", error);
    }
  };
  
  const handleFullscreenChange = () => {
    const fsElement =
      document.fullscreenElement ||
      document.webkitFullscreenElement ||
      document.mozFullScreenElement ||
      document.msFullscreenElement;
  
    setIsFullscreen(!!fsElement);
    
    // Always show controls when fullscreen state changes
    setControlsVisible(true);
    
    // Apply subtitle styles when entering/exiting fullscreen
    applySubtitleStyles();
    
    // Reset the idle timeout
    resetIdleTimeout();
  };

  // Apply custom styles to subtitle cues to prevent flickering
  const applySubtitleStyles = () => {
    if (subtitleStylesApplied.current) return;
    
    // Create a style element for custom subtitle styling
    const styleElement = document.createElement('style');
    styleElement.innerHTML = `
      ::cue {
      background-color: rgba(0, 0, 0, 0.5); /* 50% transparent black */

        text-shadow: 0px 0px 1px #000, 0px 0px 3px #000;
        -webkit-font-smoothing: antialiased;
        font-family: sans-serif;
        font-weight: bold;
        opacity: 1 !important;
        visibility: visible !important;
        z-index: 100 !important;
      }
      
      video::cue {
        opacity: 1 !important;
        visibility: visible !important;
        z-index: 100 !important;
      }
      
      video::-webkit-media-text-track-container {
        opacity: 1 !important;
        visibility: visible !important;
        z-index: 100 !important;
      }
      
      video::-webkit-media-text-track-display {
        opacity: 1 !important;
        visibility: visible !important;
        z-index: 100 !important;
      }
    `;
    
    document.head.appendChild(styleElement);
    subtitleStylesApplied.current = true;
  };

  const handleQualityChange = (e) => {
    const quality = e.target.value;
    setCurrentQuality(quality);
    
    if (!hlsRef.current) return;
    
    if (quality === 'auto') {
      hlsRef.current.currentLevel = -1; // Auto quality
    } else {
      // Find level index that matches the selected height
      const height = parseInt(quality);
      const levelIndex = hlsRef.current.levels.findIndex(level => level.height === height);
      if (levelIndex !== -1) {
        hlsRef.current.currentLevel = levelIndex;
      }
    }
  };

  // Fixed handlePlayPause function to properly handle promises
  const handlePlayPause = async () => {
    const video = videoRef.current;
    if (!video) return;
  
    try {
      // If there's a pending play promise, wait for it to complete
      if (playPromiseRef.current) {
        await playPromiseRef.current;
        playPromiseRef.current = null;
      }
      
      if (video.paused) {
        // Make sure it's not muted when we explicitly press play
        video.muted = false;
        
        // Store the play promise to track it
        playPromiseRef.current = video.play();
        
        if (playPromiseRef.current !== undefined) {
          try {
            await playPromiseRef.current;
            setIsPlaying(true);
          } catch (error) {
            console.warn("Play request was interrupted:", error);
            setIsPlaying(false);
            playPromiseRef.current = null;
          }
        } else {
          setIsPlaying(true);
        }
      } else {
        video.pause();
        setIsPlaying(false);
      }
    } catch (error) {
      console.warn("Play/pause operation failed:", error);
      setIsPlaying(video ? !video.paused : false);
    }
  };
  
  // Create a debounced version of the play/pause handler
  const debouncedPlayPause = debounce(handlePlayPause, 300);

  // Two-stage autoplay approach
  const attemptAutoplay = async (video) => {
    if (!video || autoplayAttempted.current) return;
    autoplayAttempted.current = true;
    
    try {
      // First try unmuted autoplay
      video.muted = false;
      playPromiseRef.current = video.play();
      
      if (playPromiseRef.current !== undefined) {
        await playPromiseRef.current;
        setIsPlaying(true);
        console.log("Unmuted autoplay successful");
      }
    } catch (error) {
      console.log("Unmuted autoplay failed, trying muted:", error);
      
      try {
        // If unmuted fails, try muted (more likely to succeed due to browser policies)
        video.muted = true;
        playPromiseRef.current = video.play();
        
        if (playPromiseRef.current !== undefined) {
          await playPromiseRef.current;
          setIsPlaying(true);
          
          // Add a UI element to notify user that video is muted
          // This could be a toast notification or a UI overlay
          console.log("Muted autoplay successful - user needs to unmute");
          
          // Optional: automatically unmute after first interaction
          const unmuteFn = () => {
            if (video.muted) {
              video.muted = false;
              document.removeEventListener('click', unmuteFn);
              document.removeEventListener('keydown', unmuteFn);
              document.removeEventListener('touchstart', unmuteFn);
            }
          };
          
          document.addEventListener('click', unmuteFn, { once: true });
          document.addEventListener('keydown', unmuteFn, { once: true });
          document.addEventListener('touchstart', unmuteFn, { once: true, passive: true });
        }
      } catch (mutedError) {
        console.warn("Both autoplay attempts failed:", mutedError);
        setIsPlaying(false);
      }
    } finally {
      playPromiseRef.current = null;
    }
  };


  

  useEffect(() => {
    const video = videoRef.current;
    const hls = new Hls({
      // HLS.js configuration to improve stability
      fragLoadingMaxRetry: 5,
      manifestLoadingMaxRetry: 5,
      levelLoadingMaxRetry: 5
    });
    hlsRef.current = hls;
    autoplayAttempted.current = false;
  
    // Reset loading state when videoData changes
    setIsLoading(true);
  
    if (video && Hls.isSupported()) {
      const proxyUrl = `/api/proxy?url=${encodeURIComponent(videoData.sources[0].url)}`;

      hls.loadSource(proxyUrl);
      hls.attachMedia(video);
  
      hls.on(Hls.Events.MANIFEST_PARSED, (event, data) => {
        setIsLoading(false); // done loading when manifest is parsed
        
        // Process available qualities
        if (data.levels && data.levels.length > 0) {
          // Extract unique resolutions
          const qualities = data.levels.map(level => level.height);
          const uniqueQualities = [...new Set(qualities)].sort((a, b) => b - a);
          setAvailableQualities(uniqueQualities);
        }
        
        // Attempt autoplay after a short delay to let component settle
        setTimeout(() => {
          if (video && video.paused) {
            attemptAutoplay(video);
          }
        }, 300);
      });
      
      // Apply custom subtitle styles
      applySubtitleStyles();
    }
  
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);
  
    return () => {
      if (hls) {
        hls.destroy();
      }
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
    };
  }, [videoData]);  


  
  
  

  const handleTimeUpdate = () => {
    const video = videoRef.current;
    const time = video?.currentTime || 0;

    setCurrentTime(time);
    setShowIntroButton(time > videoData.intro.start && time < videoData.intro.end && !videoRef.current.ended);
    setShowOutroButton(time > videoData.outro.start && time < videoData.outro.end);
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
      applySelectedSubtitle();
    }
  };

  // Improved event listener for play state synchronization
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onEnded = () => setIsPlaying(false);
    const onError = (e) => {
      console.error("Video error:", e);
      setIsPlaying(false);
    };

    video.addEventListener("play", onPlay);
    video.addEventListener("playing", onPlay);
    video.addEventListener("pause", onPause);
    video.addEventListener("ended", onEnded);
    video.addEventListener("error", onError);

    return () => {
      video.removeEventListener("play", onPlay);
      video.removeEventListener("playing", onPlay);
      video.removeEventListener("pause", onPause);
      video.removeEventListener("ended", onEnded);
      video.removeEventListener("error", onError);
    };
  }, []);

  const handleSpeedChange = (e) => {
    const rate = parseFloat(e.target.value);
    setPlaybackRate(rate);
    if (videoRef.current) videoRef.current.playbackRate = rate;
  };

  // Apply selected subtitle
  const applySelectedSubtitle = () => {
    const video = videoRef.current;
    if (!video || !video.textTracks) return;
    
    const tracks = video.textTracks;
    
    // Reset all tracks first
    for (let i = 0; i < tracks.length; i++) {
      tracks[i].mode = 'disabled';
    }
    
    // Enable the selected track if any
    if (selectedSubtitle) {
      for (let i = 0; i < tracks.length; i++) {
        if (tracks[i].label === selectedSubtitle) {
          tracks[i].mode = 'showing';
          break;
        }
      }
    }
  };

  useEffect(() => {
    // Initialize subtitles
    if (videoData?.subtitles?.length > 0) {
      const englishSubtitle = videoData.subtitles.find(sub => 
        sub.lang && (sub.lang.toLowerCase() === 'english' || sub.lang.toLowerCase() === 'en')
      );
      
      if (englishSubtitle) {
        setSelectedSubtitle(englishSubtitle.lang);
      }
    }
  }, [videoData.subtitles]);
  
  // Apply subtitle selection when it changes
  useEffect(() => {
    if (videoRef.current && videoRef.current.readyState >= 2) {
      applySelectedSubtitle();
    }
  }, [selectedSubtitle]);

  const handleSubtitleChange = (e) => {
    const lang = e.target.value;
    setSelectedSubtitle(lang);
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
      // Unmute when volume is adjusted
      if (newVolume > 0 && videoRef.current.muted) {
        videoRef.current.muted = false;
      }
    }
  };

  const handleSeek = (e) => {
    const time = parseFloat(e.target.value);
    if (videoRef.current) videoRef.current.currentTime = time;
    setCurrentTime(time);
  };

  const formatTime = (time) => {
    const mins = Math.floor(time / 60).toString().padStart(2, '0');
    const secs = Math.floor(time % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };

  const resetIdleTimeout = () => {
    if (idleTimeoutRef.current) {
      clearTimeout(idleTimeoutRef.current);
    }
    
    setControlsVisible(true);
    
    // Update cursor style
    if (containerRef.current) {
      containerRef.current.style.cursor = 'default';
    }

    // Set timeout to hide controls and cursor
    if (!(showIntroButton || showOutroButton)) {
      idleTimeoutRef.current = setTimeout(() => {
        setControlsVisible(false);
        
        // Hide cursor when controls are hidden
        if (containerRef.current) {
          containerRef.current.style.cursor = 'none';
        }
      }, 3000);
    }
  };

  // This effect controls the mouse cursor visibility
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.style.cursor = controlsVisible ? 'default' : 'none';
    }
  }, [controlsVisible]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleUserInteraction = () => {
      resetIdleTimeout();
    };

    // Attach all event listeners to the container
    container.addEventListener('mousemove', handleUserInteraction);
    container.addEventListener('mousedown', handleUserInteraction);
    container.addEventListener('keydown', handleUserInteraction);
    container.addEventListener('touchstart', handleUserInteraction, { passive: true });
    container.addEventListener('touchmove', handleUserInteraction, { passive: true });
    container.addEventListener('touchend', handleUserInteraction, { passive: true });

    // If intro or outro buttons are visible, keep controls visible


    return () => {
      if (idleTimeoutRef.current) {
        clearTimeout(idleTimeoutRef.current);
      }

      container.removeEventListener('mousemove', handleUserInteraction);
      container.removeEventListener('mousedown', handleUserInteraction);
      container.removeEventListener('keydown', handleUserInteraction);
      container.removeEventListener('touchstart', handleUserInteraction);
      container.removeEventListener('touchmove', handleUserInteraction);
      container.removeEventListener('touchend', handleUserInteraction);
    };
  }, []);

  const [buffered, setBuffered] = useState(0);

  useEffect(() => {
    let animationFrameId;
  
    const updateBuffered = () => {
      const video = videoRef.current;
      if (video) {
        const bufferedRanges = video.buffered;
        if (bufferedRanges.length > 0) {
          setBuffered(bufferedRanges.end(bufferedRanges.length - 1));
        }
      }
      animationFrameId = requestAnimationFrame(updateBuffered);
    };
  
    updateBuffered(); // Start updating
  
    return () => {
      cancelAnimationFrame(animationFrameId); // Clean up
    };
  }, []);
  

  return (
    <div 
      ref={containerRef}
      className="relative bg-black w-full aspect-video overflow-hidden"
      style={{ 
        cursor: controlsVisible ? 'default' : 'none',
        WebkitUserSelect: 'none',
        MozUserSelect: 'none',
        msUserSelect: 'none',
        userSelect: 'none'
      }}
    >
      <div
        ref={panelRef}
        className="relative w-full h-full"
        style={{ position: 'relative', zIndex: 1 }}
      >
        {isLoading && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 text-white">
            <LoadingSpinner LoadingColor="#FFFFFF" strokeColor="#FFFFFF" />
          </div>
        )}

        <video
          ref={videoRef}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          className="w-full h-full cursor-pointer"
          controls={false}
          controlsList="nofullscreen"
          style={{ position: 'absolute', top: 0, left: 0, zIndex: 5 }}
          onClick={debouncedPlayPause} // Using debounced handler
        >
          {[...new Map(videoData.subtitles
            .filter(sub => sub.lang && typeof sub.lang === 'string' && sub.lang !== 'thumbnails')
            .map(sub => [sub.lang, sub]))
            .values()].map((subtitle, index) => (
            <track
              key={index}
              kind="subtitles"
              src={`/api/proxy?url=${encodeURIComponent(subtitle.url)}`}
              label={subtitle.lang}
              default={index === 0}
            />
          ))}
        </video>

        {/* Skip buttons with higher z-index */}
        {(showIntroButton || showOutroButton) && (
          <>
            {showIntroButton && (
              <button
                onClick={handleSkipIntro}
                className="bg-gray-800 font-bold cursor-pointer px-4 py-2 rounded shadow text-white 
                z-10 absolute
                right-0
                bottom-20
                max-md:text-sm 
                mr-2"
              >
                Skip Intro
              </button>
            )}
            {showOutroButton && (
              <button
                onClick={handleSkipOutro}
                className="bg-gray-800 font-bold cursor-pointer px-4 py-2 rounded shadow text-white 
                z-10 absolute
                right-0
                bottom-20
                max-md:text-sm 
                mr-2"
              >
                Skip Outro
              </button>
            )}
        </>
        )}

        {/* Play/Pause center button */}
        {controlsVisible && (
          <>
            <div 
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-30"
              style={{ pointerEvents: 'none' }}
            >
              <button
                onClick={handlePlayPause}
                className="text-4xl bg-gray-800 bg-opacity-70 px-4 py-2 rounded-full text-white cursor-pointer"
                style={{ pointerEvents: 'auto' }}
              >
                {isPlaying ? (
                  <FontAwesomeIcon icon={faPause} />
                ) : (
                  <FontAwesomeIcon icon={faPlay} />
                )}
              </button>
            </div>

            {/* Controls bar with higher z-index */}
            <div 
              className="absolute bottom-0 left-0 right-0 bg-black/60 p-4 flex flex-nowrap gap-4 items-center justify-center text-white max-md:h-10"
              style={{ zIndex: 30 }}
            >
              {/* Settings popover */}
              <div className="relative text-left z-40">
                <button
                  onClick={() => setIsPopoverOpen(!isPopoverOpen)}
                  className="text-white px-2 cursor-pointer"
                >
                  <FontAwesomeIcon icon={faEllipsisVertical} />
                </button>

                {isPopoverOpen && (
                  <div
                    className="absolute translate-x-[0] mt-2 -top-40 rounded-lg shadow-lg bg-gray-900 ring-1 ring-white/10 focus:outline-none flex flex-col gap-2 p-3 text-white text-sm max-md:-top-30
                    "
                  >
                    {/* Resolution Quality */}
                    <div className="flex items-center justify-between">
                      <label className="mr-2 flex items-center gap-1 max-md:text-[.5rem]">
                        <FontAwesomeIcon icon={faGear} />
                        Quality
                      </label>
                      <select
                        value={currentQuality}
                        onChange={handleQualityChange}
                        className="bg-gray-800 text-white px-2 py-1 rounded max-md:text-[.5rem]
                        cursor-pointer
                        "
                      >
                        <option value="auto" >Auto</option>
                        {availableQualities.map((quality) => (
                          <option key={quality} value={quality}>
                            {quality}p
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Playback Rate */}
                    <div className="flex items-center justify-between">
                      <label className="mr-2 flex items-center gap-1 max-md:text-[.5rem]">
                        <FontAwesomeIcon icon={faForwardFast} />
                        Speed
                      </label>
                      <select
                        value={playbackRate}
                        onChange={handleSpeedChange}
                        className="bg-gray-800 text-white px-2 py-1 rounded max-md:text-[.5rem]
                        cursor-pointer"
                      >
                        <option value="0.5">0.5x</option>
                        <option value="1">1x</option>
                        <option value="1.5">1.5x</option>
                        <option value="2">2x</option>
                      </select>
                    </div>

                    {/* Subtitles */}
                    <div className="flex items-center justify-between">
                      <label className="mr-2 flex items-center gap-1 max-md:text-[.5rem]">
                        <FontAwesomeIcon icon={faClosedCaptioning} />
                        Subtitles
                      </label>
                      <select
                        value={selectedSubtitle}
                        onChange={handleSubtitleChange}
                        className="bg-gray-800 text-white text-sm px-2 py-1 rounded truncate max-w-[15ch] max-md:text-[.5rem]
                        cursor-pointer"
                      >
                        <option value="">No Subtitle</option>
                        {[...new Map(
                          videoData.subtitles
                            .filter(sub => sub.lang && sub.lang !== "thumbnails" && typeof sub.lang === 'string')
                            .map(sub => [sub.lang.trim(), sub])
                        ).values()].map((subtitle, index) => (
                          <option key={index} value={subtitle.lang}>
                            {subtitle.lang}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}
              </div>

              <button
                onClick={handlePlayPause}
                className="text-white"
              >
                {isPlaying ? (<FontAwesomeIcon icon={faPause} />) : (<FontAwesomeIcon icon={faPlay} />)}
              </button>

              <div className="flex items-center gap-2 w-[40%] relative max-lg:w-[50%]">
                <span className="max-md:text-[10px]">{formatTime(currentTime)}</span>

                <div className="relative w-[75%] h-4">
                  {/* Buffered progress background */}
                  <div className="absolute top-1/2 -translate-y-1/2 w-full h-1 bg-gray-600 rounded overflow-hidden">
                    {/* Played background */}
                    <div
                      className="absolute top-0 left-0 h-full bg-blue-500 z-10"
                      style={{ width: `${(currentTime / duration) * 100}%` }}
                    />
                    {/* Buffered background */}
                    <div
                      className="absolute top-0 left-0 h-full bg-gray-300 "
                      style={{ width: `${(buffered / duration) * 100}%` }}
                    />
                  </div>

                  {/* Range input */}
                  <input
                    type="range"
                    min={0}
                    max={duration}
                    step={0.1}
                    value={currentTime}
                    onChange={handleSeek}
                    className="w-full appearance-none bg-transparent z-10 relative"
                  />
                </div>

                <span className="max-md:text-[10px]">{formatTime(duration)}</span>
              </div>

              <div className='flex justify-center items-center w-[15%] relative max-lg:w-[25%]'>
                <label className="mr-2">
                  <FontAwesomeIcon icon={faVolumeHigh} />
                </label>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.01}
                  value={volume}
                  onChange={handleVolumeChange}
                  className="w-[90%]"
                />
              </div>

              {!isFullscreen ? (
                <button
                  onClick={handleFullscreen}
                  className="text-white"
                >
                  <FontAwesomeIcon icon={faExpand} />
                </button>
              ) : (
                <button
                  onClick={handleExitFullscreen}
                  className="text-white"
                >
                  <FontAwesomeIcon icon={faCompress} />
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default VideoPlayer;