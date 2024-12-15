"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import {
  Disc3,
  Search,
  Library,
  Home,
  Play,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

export default function Dashboard() {
  const router = useRouter();
  const [isMuted, setIsMuted] = useState(false);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const recentlyPlayedRef = useRef<HTMLDivElement>(null);
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

  const scrollRecentlyPlayed = (direction: "left" | "right") => {
    if (recentlyPlayedRef.current) {
      const scrollAmount = direction === "left" ? -200 : 200;
      recentlyPlayedRef.current.scrollBy({
        left: scrollAmount,
        behavior: "smooth",
      });
    }
  };

  // Show nothing while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#121212] flex items-center justify-center">
        <Disc3 className="w-12 h-12 text-[#DCEC7C] animate-spin" />
      </div>
    );
  }

  // Don't render the dashboard if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#121212] text-[#DCEC7C]">
      {/* Sidebar */}
      <div className="fixed left-0 top-0 bottom-0 w-64 bg-[#1A1A1A] p-6">
        <h1 className="text-3xl font-bold flex items-center mb-10">
          <Disc3 className="w-8 h-8 mr-2 animate-spin-slow" />
          MeloFlow
        </h1>
        <nav className="space-y-4">
          <Link
            href="/"
            className="flex items-center space-x-2 text-lg hover:text-white transition-colors"
          >
            <Home className="w-5 h-5" />
            <span>Home</span>
          </Link>
          <Link
            href="/search"
            className="flex items-center space-x-2 text-lg hover:text-white transition-colors"
          >
            <Search className="w-5 h-5" />
            <span>Search</span>
          </Link>
          <Link
            href="/library"
            className="flex items-center space-x-2 text-lg hover:text-white transition-colors"
          >
            <Library className="w-5 h-5" />
            <span>Library</span>
          </Link>
        </nav>
      </div>

      {/* Main content */}
      <main className="ml-64 p-8">
        <header className="flex justify-between items-center mb-12">
          <Input
            className="w-64 bg-[#1A1A1A] border-none text-white placeholder-gray-500"
            placeholder="Search for artists, songs, or podcasts"
          />
          <Button
            variant="outline"
            className="rounded-full border-[#DCEC7C] text-[#DCEC7C] hover:bg-[#DCEC7C] hover:text-[#121212]"
          >
            Log in
          </Button>
        </header>

        <div className="mb-12">
          <h2 className="text-2xl font-semibold mb-6">Your Vibe Today</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {["Energetic", "Chill", "Focus", "Workout"].map((vibe) => (
              <Button
                key={vibe}
                variant="outline"
                className="h-24 rounded-2xl text-lg font-medium border-[#DCEC7C] text-[#DCEC7C] hover:bg-[#DCEC7C] hover:text-[#121212] transition-colors"
              >
                {vibe}
              </Button>
            ))}
          </div>
        </div>

        <div className="mb-12">
          <h2 className="text-2xl font-semibold mb-6">Recently Played</h2>
          <div className="relative">
            <Button
              variant="ghost"
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10"
              onClick={() => scrollRecentlyPlayed("left")}
            >
              <ChevronLeft className="w-6 h-6" />
            </Button>
            <div
              ref={recentlyPlayedRef}
              className="flex space-x-6 overflow-x-auto scrollbar-hide"
              style={{ scrollBehavior: "smooth" }}
            >
              {[...Array(10)].map((_, i) => (
                <Link
                  key={i}
                  href={`/play/${i}`}
                  className="flex-shrink-0 w-48 group"
                >
                  <div className="w-48 h-48 bg-[#1A1A1A] rounded-full flex items-center justify-center group-hover:bg-[#DCEC7C] transition-colors duration-300">
                    <Play className="w-12 h-12 text-[#DCEC7C] group-hover:text-[#121212]" />
                  </div>
                  <div className="mt-4 text-center">
                    <p className="font-medium">Track {i + 1}</p>
                    <p className="text-sm text-gray-400">Artist {i + 1}</p>
                  </div>
                </Link>
              ))}
            </div>
            <Button
              variant="ghost"
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10"
              onClick={() => scrollRecentlyPlayed("right")}
            >
              <ChevronRight className="w-6 h-6" />
            </Button>
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-semibold mb-6">Discover</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {[...Array(6)].map((_, i) => (
              <Link key={i} href={`/playlist/${i}`} className="group">
                <div className="aspect-square bg-[#1A1A1A] rounded-2xl overflow-hidden relative">
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-[#DCEC7C] bg-opacity-90">
                    <Play className="w-12 h-12 text-[#121212]" />
                  </div>
                </div>
                <p className="mt-2 font-medium">Playlist {i + 1}</p>
                <p className="text-sm text-gray-400">Curated for you</p>
              </Link>
            ))}
          </div>
        </div>
      </main>

      {/* Floating player */}
      <div className="fixed bottom-6 left-70 right-6 bg-[#1A1A1A] rounded-full p-4 shadow-lg flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-[#DCEC7C] rounded-full flex items-center justify-center">
            <Play className="w-6 h-6 text-[#121212]" />
          </div>
          <div>
            <p className="font-medium">Now Playing</p>
            <p className="text-sm text-gray-400">Artist Name</p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <SkipBack className="w-5 h-5" />
          <Button
            size="icon"
            variant="ghost"
            className="rounded-full hover:bg-[#DCEC7C] hover:text-[#121212]"
          >
            <Play className="w-5 h-5" />
          </Button>
          <SkipForward className="w-5 h-5" />
        </div>
        <div className="relative">
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
      </div>
    </div>
  );
}
