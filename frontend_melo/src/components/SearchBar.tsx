"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search, AlertCircle } from "lucide-react";
import { Input } from "@/ui/input";
import { Song, searchSongs, debounce } from "@/lib/utils";

interface SearchBarProps {
  placeholder?: string;
  className?: string;
  onResults?: (results: Song[]) => void;
}

export function SearchBar({
  placeholder = "Search for songs...",
  className = "",
  onResults,
}: SearchBarProps) {
  const router = useRouter();
  const [query, setQuery] = useState<string>("");
  const [results, setResults] = useState<Song[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showResults, setShowResults] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isMockData, setIsMockData] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Close results when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setShowResults(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Create debounced search function
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSearch = useCallback(
    debounce(async (searchQuery: string) => {
      if (searchQuery.trim().length < 2) {
        setResults([]);
        setIsLoading(false);
        setError(null);
        setIsMockData(false);
        if (onResults) onResults([]);
        return;
      }

      try {
        setError(null);
        const response = await searchSongs(searchQuery);

        // Check if we're using mock data
        setIsMockData(response.message?.includes("mock data") || false);

        if (response.status !== 200) {
          setError(`Error: ${response.message}`);
          setResults([]);
          if (onResults) onResults([]);
          return;
        }

        setResults(response.data);
        // Pass results to parent component if onResults prop exists
        if (onResults) onResults(response.data);
      } catch (error) {
        console.error("Search error:", error);
        setError("Failed to search. Please try again.");
        setResults([]);
        if (onResults) onResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 300),
    [onResults]
  );

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);

    if (value.trim().length >= 2) {
      setIsLoading(true);
      setShowResults(true);
      debouncedSearch(value);
    } else {
      setResults([]);
      setShowResults(false);
      setError(null);
      setIsMockData(false);
      if (onResults) onResults([]);
    }
  };

  // Handle song selection
  const handleSongSelect = (song: Song) => {
    setShowResults(false);
    // Update the query to show the selected song
    setQuery(song.title);
    // Navigate to the song page
    router.push(`/song?id=${song.id}`);
  };

  return (
    <div ref={searchContainerRef} className={`relative ${className}`}>
      <div className="relative">
        <Input
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={handleInputChange}
          className="w-full pl-10 bg-[#1A1A1A] border-none text-white placeholder-gray-500"
        />
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
      </div>

      {showResults && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-[#1A1A1A] rounded-md shadow-lg max-h-80 overflow-auto z-50">
          {isLoading ? (
            <div className="p-4 text-center text-gray-400">Searching...</div>
          ) : error ? (
            <div className="p-4 text-center text-red-400">{error}</div>
          ) : results.length > 0 ? (
            <>
              {isMockData && (
                <div className="p-2 bg-yellow-800 text-yellow-200 flex items-center gap-2 text-xs">
                  <AlertCircle className="h-3 w-3" />
                  Using offline search results (API unavailable)
                </div>
              )}
              <ul>
                {results.map((song) => (
                  <li
                    key={song.id}
                    className="p-2 hover:bg-[#252525] cursor-pointer flex items-center gap-3"
                    onClick={() => handleSongSelect(song)}
                  >
                    <div className="w-10 h-10 rounded bg-[#252525] flex-shrink-0 overflow-hidden">
                      {song.thumbnail && (
                        <img
                          src={song.thumbnail}
                          alt={song.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 24 24' fill='none' stroke='%23DCEC7C' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M9 18V5l12-2v13'%3E%3C/path%3E%3Ccircle cx='6' cy='18' r='3'%3E%3C/circle%3E%3Ccircle cx='18' cy='16' r='3'%3E%3C/circle%3E%3C/svg%3E";
                          }}
                        />
                      )}
                    </div>
                    <div>
                      <p className="text-[#DCEC7C] font-medium">{song.title}</p>
                      <p className="text-sm text-gray-400">{song.artist}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </>
          ) : query.length >= 2 ? (
            <div className="p-4 text-center text-gray-400">No songs found</div>
          ) : null}
        </div>
      )}
    </div>
  );
}
