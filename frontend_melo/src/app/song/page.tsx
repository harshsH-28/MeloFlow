"use client";

import React from "react";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "@/ui/button";
import { Slider } from "@/ui/slider";
import { ScrollArea } from "@/ui/scroll-area";
import {
  Home,
  Heart,
  MoreHorizontal,
  Play,
  Pause,
  Repeat,
  Shuffle,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Disc3,
} from "lucide-react";
import { Song, getSongById, formatTime, parseDuration } from "@/lib/utils";
import DashAudioPlayer from "@/components/DashAudioPlayer";
import Image from "next/image";

const SongPage = () => {
  const searchParams = useSearchParams();
  const songId = searchParams.get("id");

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [song, setSong] = useState<Song | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSeeking, setIsSeeking] = useState(false);
  const seekTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch song data
  useEffect(() => {
    const fetchSongData = async () => {
      if (!songId) {
        setError("No song ID provided");
        setIsLoading(false);
        return;
      }

      try {
        const songData = await getSongById(songId);

        if (!songData) {
          setError("Song not found");
          setIsLoading(false);
          return;
        }

        setSong(songData);

        // Parse duration if available
        if (songData.duration) {
          setDuration(parseDuration(songData.duration));
        }
      } catch (err) {
        console.error("Error fetching song:", err);
        setError("Failed to load song data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchSongData();
  }, [songId]);

  // Handle timeupdate from the audio player
  const handleTimeUpdate = (currentTime: number, duration: number) => {
    if (!isSeeking) {
      setCurrentTime(currentTime);
    }
    if (duration > 0 && duration !== Infinity && !isNaN(duration)) {
      setDuration(duration);
    }
  };

  // Handle audio ended
  const handleEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };

  // Handle audio errors
  const handleError = (errorMessage: string) => {
    console.error("Audio player error:", errorMessage);
    setError(`Error playing audio: ${errorMessage}`);
  };

  // Handle loading complete
  const handleLoaded = (audioDuration: number) => {
    if (
      audioDuration > 0 &&
      audioDuration !== Infinity &&
      !isNaN(audioDuration)
    ) {
      setDuration(audioDuration);
    }
  };

  // Handle seek/scrub
  const handleSeek = (value: number[]) => {
    const newTime = value[0];
    setCurrentTime(newTime);
    setIsSeeking(true);

    // Clear any existing timeout
    if (seekTimeoutRef.current) {
      clearTimeout(seekTimeoutRef.current);
    }

    // Set a timeout to update the audio element's time
    seekTimeoutRef.current = setTimeout(() => {
      setIsSeeking(false);
      const audioElement = document.querySelector("audio");
      if (audioElement) {
        audioElement.currentTime = newTime;
      }
    }, 200);
  };

  // Handle volume change
  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0] / 100;
    setVolume(newVolume);
  };

  // Toggle mute
  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#121212] flex items-center justify-center">
        <Disc3 className="w-12 h-12 text-[#DCEC7C] animate-spin" />
      </div>
    );
  }

  // Show error state
  if (error || !song) {
    return (
      <div className="min-h-screen bg-[#121212] flex items-center justify-center flex-col">
        <p className="text-[#DCEC7C] text-xl mb-4">
          {error || "Song not found"}
        </p>
        <Link href="/home">
          <Button>Back to Home</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#121212] text-[#DCEC7C] flex">
      {/* Invisible audio player */}
      {songId && (
        <DashAudioPlayer
          songId={songId}
          isPlaying={isPlaying}
          volume={volume}
          isMuted={isMuted}
          onTimeUpdate={handleTimeUpdate}
          onEnded={handleEnded}
          onError={handleError}
          onLoaded={handleLoaded}
        />
      )}

      {/* Sidebar */}
      <div className="w-64 bg-[#1A1A1A] p-6 flex flex-col">
        <Link
          href="/home"
          className="text-2xl font-bold flex items-center mb-10"
        >
          <Home className="w-8 h-8 mr-2" />
          <span>Home</span>
        </Link>
        <div className="flex-grow" />
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Now Playing</h2>
          <p className="text-gray-400">{song.title}</p>
          <p className="text-sm text-gray-500">{song.artist}</p>
        </div>
      </div>

      {/* Main content */}
      <main className="flex-1 p-8 flex flex-col items-center justify-center">
        <div className="max-w-2xl w-full">
          {/* Album art */}
          <div className="w-64 h-64 mx-auto rounded-md overflow-hidden mb-8 relative">
            {song.thumbnail ? (
              <img
                src={song.thumbnail}
                alt={`${song.title} by ${song.artist}`}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-[#1A1A1A] flex items-center justify-center">
                <Play className="w-24 h-24 text-[#DCEC7C]" />
              </div>
            )}

            {/* Overlay play button */}
            {/* <div
              className={`absolute inset-0 flex items-center justify-center 
              ${isPlaying ? "bg-black bg-opacity-50" : "bg-transparent"} 
              hover:bg-black hover:bg-opacity-50 transition-colors cursor-pointer`}
              onClick={() => setIsPlaying(!isPlaying)}
            >
              {isPlaying ? (
                <Pause className="w-16 h-16 text-[#DCEC7C]" />
              ) : (
                <Play className="w-16 h-16 text-[#DCEC7C]" />
              )}
            </div> */}
          </div>

          {/* Song info and controls */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-2">{song.title}</h1>
            <p className="text-xl text-gray-400 mb-2">{song.artist}</p>
            {song.album && (
              <p className="text-md text-gray-500 mb-6">{song.album}</p>
            )}

            <div className="flex justify-center items-center space-x-6 mb-8">
              <Button
                size="icon"
                variant="ghost"
                className="rounded-full hover:bg-[#DCEC7C] hover:text-[#121212]"
              >
                <Shuffle className="w-5 h-5" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="rounded-full hover:bg-[#DCEC7C] hover:text-[#121212]"
              >
                <SkipBack className="w-6 h-6" />
              </Button>
              <Button
                size="lg"
                className="rounded-full w-16 h-16 bg-[#DCEC7C] text-[#121212] hover:bg-[#C5D36A]"
                onClick={() => setIsPlaying(!isPlaying)}
              >
                {isPlaying ? (
                  <Pause className="w-8 h-8" />
                ) : (
                  <Play className="w-8 h-8" />
                )}
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="rounded-full hover:bg-[#DCEC7C] hover:text-[#121212]"
              >
                <SkipForward className="w-6 h-6" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="rounded-full hover:bg-[#DCEC7C] hover:text-[#121212]"
              >
                <Repeat className="w-5 h-5" />
              </Button>
            </div>

            <div className="space-y-2">
              <Slider
                className="w-full"
                value={[currentTime]}
                max={duration || 100}
                step={1}
                onValueChange={handleSeek}
              />
              <div className="flex justify-between text-sm text-gray-400">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>
          </div>

          {/* Volume control */}
          <div className="flex justify-center mt-4 relative">
            <Button
              size="icon"
              variant="ghost"
              className="rounded-full hover:bg-[#DCEC7C] hover:text-[#121212]"
              onClick={toggleMute}
              onMouseEnter={() => setShowVolumeSlider(true)}
              onMouseLeave={() => setShowVolumeSlider(false)}
            >
              {isMuted ? (
                <VolumeX className="w-5 h-5" />
              ) : (
                <Volume2 className="w-5 h-5" />
              )}
            </Button>
            {showVolumeSlider && (
              <div
                className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-[#1A1A1A] p-4 rounded-lg"
                onMouseEnter={() => setShowVolumeSlider(true)}
                onMouseLeave={() => setShowVolumeSlider(false)}
              >
                <Slider
                  className="h-24"
                  orientation="vertical"
                  value={[volume * 100]}
                  max={100}
                  step={1}
                  onValueChange={handleVolumeChange}
                />
              </div>
            )}
          </div>

          {/* Lyrics section - can be updated to fetch real lyrics if available */}
          <div className="mt-12">
            <h2 className="text-2xl font-semibold mb-4 text-center">Lyrics</h2>
            <ScrollArea className="h-64 w-full rounded-lg p-4 bg-[#1A1A1A]">
              <p className="text-gray-400 leading-relaxed text-center">
                {/* Placeholder lyrics - in a real app, you would fetch these */}
                Lyrics not available for this track.
              </p>
            </ScrollArea>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SongPage;
