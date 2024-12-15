"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Disc3,
} from "lucide-react";

export default function SongPlayer() {
  const router = useRouter();
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState([50]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.replace("/login");
    } else {
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  }, [router]);

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#121212] flex items-center justify-center">
        <Disc3 className="w-12 h-12 text-[#DCEC7C] animate-spin" />
      </div>
    );
  }

  // Don't render anything if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#121212] text-[#DCEC7C] flex flex-col">
      {/* Main player content */}
      <div className="flex-1 p-8 flex flex-col items-center justify-center">
        {/* Album art */}
        <div className="w-64 h-64 bg-[#1A1A1A] rounded-lg mb-8 flex items-center justify-center">
          <div className="w-full h-full bg-gradient-to-br from-[#DCEC7C] to-[#121212] rounded-lg" />
        </div>

        {/* Song info */}
        <h2 className="text-2xl font-bold mb-2">Song Title</h2>
        <p className="text-gray-400 mb-8">Artist Name</p>

        {/* Progress bar */}
        <div className="w-full max-w-md mb-8">
          <Slider defaultValue={[20]} max={100} step={1} />
          <div className="flex justify-between mt-2 text-sm text-gray-400">
            <span>1:23</span>
            <span>3:45</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center space-x-6">
          <Button
            variant="ghost"
            size="icon"
            className="hover:bg-[#DCEC7C] hover:text-[#121212]"
          >
            <SkipBack className="w-6 h-6" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="w-16 h-16 rounded-full hover:bg-[#DCEC7C] hover:text-[#121212]"
            onClick={() => setIsPlaying(!isPlaying)}
          >
            {isPlaying ? (
              <Pause className="w-8 h-8" />
            ) : (
              <Play className="w-8 h-8" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="hover:bg-[#DCEC7C] hover:text-[#121212]"
          >
            <SkipForward className="w-6 h-6" />
          </Button>
        </div>
      </div>

      {/* Volume control */}
      <div className="p-4 flex items-center justify-end space-x-4">
        <Button
          variant="ghost"
          size="icon"
          className="hover:bg-[#DCEC7C] hover:text-[#121212]"
          onClick={() => setIsMuted(!isMuted)}
        >
          {isMuted ? (
            <VolumeX className="w-5 h-5" />
          ) : (
            <Volume2 className="w-5 h-5" />
          )}
        </Button>
        <div className="w-32">
          <Slider
            value={volume}
            onValueChange={setVolume}
            max={100}
            step={1}
            className={isMuted ? "opacity-50" : ""}
          />
        </div>
      </div>
    </div>
  );
}
