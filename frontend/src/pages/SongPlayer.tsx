"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { ScrollArea } from "@/components/ui/scroll-area";
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
} from "lucide-react";

export default function PlayPage({ params }: { params: { id: string } }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const duration = 237; // Example duration in seconds

  useEffect(() => {
    const timer = setInterval(() => {
      if (isPlaying) {
        setCurrentTime((prevTime) => (prevTime + 1) % duration);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [isPlaying, duration]);

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  return (
    <div className="min-h-screen bg-[#121212] text-[#DCEC7C] flex">
      {/* Sidebar */}
      <div className="w-64 bg-[#1A1A1A] p-6 flex flex-col">
        <Link href="/" className="text-2xl font-bold flex items-center mb-10">
          <Home className="w-8 h-8 mr-2" />
          <span>Home</span>
        </Link>
        <div className="flex-grow" />
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Now Playing</h2>
          <p className="text-gray-400">Cosmic Harmony</p>
          <p className="text-sm text-gray-500">Stellar Soundwaves</p>
        </div>
      </div>

      {/* Main content */}
      <main className="flex-1 p-8 flex flex-col items-center justify-center">
        <div className="max-w-2xl w-full">
          {/* Album art */}
          <div className="w-64 h-64 mx-auto bg-[#1A1A1A] rounded-full flex items-center justify-center mb-8 group hover:bg-[#DCEC7C] transition-colors duration-300">
            <Play className="w-24 h-24 text-[#DCEC7C] group-hover:text-[#121212]" />
          </div>

          {/* Song info and controls */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-2">Cosmic Harmony</h1>
            <p className="text-xl text-gray-400 mb-6">Stellar Soundwaves</p>

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
                max={duration}
                onValueChange={(value) => setCurrentTime(value[0])}
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
              onClick={() => setIsMuted(!isMuted)}
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
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-[#1A1A1A] p-2 rounded-lg">
                <Slider className="w-24 h-[80px]" orientation="vertical" />
              </div>
            )}
          </div>

          {/* Lyrics */}
          <div className="mt-12">
            <h2 className="text-2xl font-semibold mb-4 text-center">Lyrics</h2>
            <ScrollArea className="h-64 w-full rounded-lg p-4 bg-[#1A1A1A]">
              <p className="text-gray-400 leading-relaxed text-center">
                Verse 1:
                <br />
                Floating through the cosmic sea
                <br />
                Stardust whispers melodies
                <br />
                Nebulas paint the darkest night
                <br />
                With colors beyond mortal sight
                <br />
                <br />
                Chorus:
                <br />
                Cosmic harmony, our celestial song
                <br />
                In this vast universe, we belong
                <br />
                Echoes of creation in every tone
                <br />
                Music of the spheres, we're not alone
                <br />
                <br />
                Verse 2:
                <br />
                Pulsars beat the rhythm true
                <br />
                Galaxies spin, a cosmic brew
                <br />
                Solar winds carry the refrain
                <br />
                Of life's eternal, sweet campaign
                <br />
                <br />
                (Repeat Chorus)
                <br />
                <br />
                Bridge:
                <br />
                From the smallest quark to the largest star
                <br />
                We're all connected, near and far
                <br />
                The universe sings its lullaby
                <br />
                In perfect harmony, you and I<br />
                <br />
                (Repeat Chorus)
                <br />
                <br />
                Outro:
                <br />
                As we drift through this cosmic sea
                <br />
                Remember the eternal melody
              </p>
            </ScrollArea>
          </div>
        </div>
      </main>
    </div>
  );
}
