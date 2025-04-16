import { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import {
    faPause,
    faPlay,
    faVolumeHigh,
    faForwardFast,
    faClosedCaptioning,
    faExpand,
    faCompress,

} from "@fortawesome/free-solid-svg-icons";

const VideoPlayer = ({ videoData }) => {
  const videoRef = useRef(null);
  const panelRef = useRef(null);
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
  const [idleTimeout, setIdleTimeout] = useState(null);

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
    if (panel.requestFullscreen) {
      panel.requestFullscreen();
    } else if (panel.webkitRequestFullscreen) {
      panel.webkitRequestFullscreen();
    } else if (panel.mozRequestFullScreen) {
      panel.mozRequestFullScreen();
    } else if (panel.msRequestFullscreen) {
      panel.msRequestFullscreen();
    }
  };

  const handleExitFullscreen = () => {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
    } else if (document.mozCancelFullScreen) {
      document.mozCancelFullScreen();
    } else if (document.msExitFullscreen) {
      document.msExitFullscreen();
    }
  };

  const handleFullscreenChange = () => {
    const fsElement =
      document.fullscreenElement ||
      document.webkitFullscreenElement ||
      document.mozFullScreenElement ||
      document.msFullscreenElement;
    setIsFullscreen(!!fsElement);
  };

  useEffect(() => {
    const video = videoRef.current;
    const hls = new Hls();

    if (video && Hls.isSupported()) {
      const proxyUrl = `/api/proxy?url=${videoData.sources[0].url}`;
      hls.loadSource(proxyUrl);
      hls.attachMedia(video);
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);

    return () => {
      hls.destroy();
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
    };
  }, [videoData]);

  const handleTimeUpdate = () => {
    const video = videoRef.current;
    const time = video?.currentTime || 0;

    setCurrentTime(time);
    setShowIntroButton(time >= videoData.intro.start && time <= videoData.intro.end);
    setShowOutroButton(time >= videoData.outro.start && time <= videoData.outro.end);
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handlePlayPause = () => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused && !video.ended) {
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => setIsPlaying(true))
          .catch((error) => {
            console.warn("Play request was interrupted or failed:", error);
          });
      }
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);

    video.addEventListener("play", onPlay);
    video.addEventListener("pause", onPause);

    return () => {
      video.removeEventListener("play", onPlay);
      video.removeEventListener("pause", onPause);
    };
  }, []);

  const handleSpeedChange = (e) => {
    const rate = parseFloat(e.target.value);
    setPlaybackRate(rate);
    if (videoRef.current) videoRef.current.playbackRate = rate;
  };

  useEffect(() => {
    if (videoData?.subtitles?.length > 0) {
      const englishSubtitle = videoData.subtitles.find(sub => sub.lang.toLowerCase() === 'english' || sub.lang.toLowerCase() === 'en');
      if (englishSubtitle) {
        setSelectedSubtitle(englishSubtitle.lang);
        // Show English subtitle by default
        const tracks = videoRef.current?.textTracks;
        if (tracks) {
          for (let i = 0; i < tracks.length; i++) {
            tracks[i].mode = tracks[i].label === englishSubtitle.lang ? 'showing' : 'disabled';
          }
        }
      }
    }
  }, [videoData.subtitles]);
  

  const handleSubtitleChange = (e) => {
    const lang = e.target.value;
    setSelectedSubtitle(lang);
    const tracks = videoRef.current.textTracks;
    for (let i = 0; i < tracks.length; i++) {
      tracks[i].mode = tracks[i].label === lang ? 'showing' : 'disabled';
    }
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (videoRef.current) videoRef.current.volume = newVolume;
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
    if (idleTimeout) clearTimeout(idleTimeout);
    setControlsVisible(true);
    const timeout = setTimeout(() => {
      setControlsVisible(false);
    }, 3000);
    setIdleTimeout(timeout);
  };

  useEffect(() => {
    const panel = panelRef.current;
    const video = videoRef.current;

    const handleUserInteraction = () => {
      resetIdleTimeout();
    };

    panel.addEventListener('mousemove', handleUserInteraction);
    panel.addEventListener('mousedown', handleUserInteraction);
    panel.addEventListener('keydown', handleUserInteraction);
    video.addEventListener('play', handleUserInteraction);
    video.addEventListener('pause', handleUserInteraction);
    video.addEventListener('seeked', handleUserInteraction);

    return () => {
      clearTimeout(idleTimeout);
      panel.removeEventListener('mousemove', handleUserInteraction);
      panel.removeEventListener('mousedown', handleUserInteraction);
      panel.removeEventListener('keydown', handleUserInteraction);
      video.removeEventListener('play', handleUserInteraction);
      video.removeEventListener('pause', handleUserInteraction);
      video.removeEventListener('seeked', handleUserInteraction);
    };
  }, [idleTimeout]);

  return (
    <div ref={panelRef} className="relative bg-black w-full aspect-video overflow-hidden">
      <video
        ref={videoRef}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        className="w-full h-full"
        controls={false}
        controlsList="nofullscreen"
        autoPlay
      >
        {[...new Map(videoData.subtitles.map(sub => [sub.lang, sub])).values()].map((subtitle, index) => (
          <track
            key={index}
            kind="subtitles"
            src={`/api/proxy?url=${encodeURIComponent(subtitle.url)}`}
            label={subtitle.lang}
            default={index === 0}
          />
        ))}
      </video>

      {(showIntroButton || showOutroButton) && (
        <div className="bg-pink-500 absolute bottom-30 left-0 right-0 flex justify-between px-4 z-50 pointer-events-none">
          {showIntroButton && (
            <button
              onClick={handleSkipIntro}
              className="bg-sky-300 text-black font-bold cursor-pointer px-4 py-2 rounded shadow pointer-events-auto absolute right-5
              max-md:text-sm
              "
            >
              Skip Intro
            </button>
          )}
          {showOutroButton && (
            <button
              onClick={handleSkipOutro}
              className="bg-sky-300 text-black font-bold cursor-pointer
               px-4 py-2 rounded shadow pointer-events-auto absolute right-4
               max-md:text-sm"
            >
              Skip Outro
            </button>
          )}
        </div>
      )}

      {controlsVisible && (
        <div className="absolute bottom-0 left-0 right-0 bg-black/60 p-4 flex flex-wrap gap-4 items-center justify-center text-white z-50">
          <button
            onClick={handlePlayPause}
            className="bg-gray-800 px-4 py-2 rounded"
          >
            {isPlaying ? (<><FontAwesomeIcon icon={faPause} /></>) : (<><FontAwesomeIcon icon={faPlay} /></>)}
          </button>

          <div className="flex items-center gap-2">
            <span>{formatTime(currentTime)}</span>
            <input
              type="range"
              min={0}
              max={duration}
              step={0.1}
              value={currentTime}
              onChange={handleSeek}
              className="w-48"
            />
            <span>{formatTime(duration)}</span>
          </div>

          <div>
            <label className="mr-2">
 

 <FontAwesomeIcon icon={faVolumeHigh} /></label>
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={volume}
              onChange={handleVolumeChange}
              className="w-32"
            />
          </div>

          <div>
            <label className="mr-2"><FontAwesomeIcon icon={faForwardFast} /></label>
            <select
              value={playbackRate}
              onChange={handleSpeedChange}
              className="bg-gray-800 text-white px-2 py-1 rounded"
            >
              <option value="0.5">0.5x</option>
              <option value="1">1x</option>
              <option value="1.5">1.5x</option>
              <option value="2">2x</option>
            </select>
          </div>

          <div>
            <label className="mr-2">

 <FontAwesomeIcon icon={faClosedCaptioning} /></label>
            <select
              value={selectedSubtitle}
              onChange={handleSubtitleChange}
              className="bg-gray-800 text-white text-sm px-2 py-1 rounded truncate max-w-[15ch]"
            >
              <option value=""  >No Subtitle</option>
              {[...new Map(videoData.subtitles.map(sub => [sub.lang, sub])).values()].map((subtitle, index) => (
                <option key={index} value={subtitle.lang}>
                  {subtitle.lang}
                </option>
              ))}
            </select>
          </div>

          {!isFullscreen ? (
            <button
              onClick={handleFullscreen}
              className="bg-gray-800 text-white px-4 py-2 rounded"
            >
                <FontAwesomeIcon icon={faExpand} />
            </button>
          ) : (
            <button
              onClick={handleExitFullscreen}
              className="bg-gray-800 text-white px-4 py-2 rounded"
            >
          <FontAwesomeIcon icon={faCompress} />
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default VideoPlayer;
