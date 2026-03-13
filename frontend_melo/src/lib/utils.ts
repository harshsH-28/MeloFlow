import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// API base URL - use relative URL to avoid CORS issues
const API_BASE_URL = "http://localhost:8080/api/v1";

// Define TypeScript interfaces for API responses
export interface Song {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: string;
  thumbnail: string;
}

export interface SearchResponse {
  data: Song[];
  status: number;
  message: string;
}

/**
 * Format seconds into MM:SS format
 * @param seconds Total seconds to format
 * @returns Formatted time string (MM:SS)
 */
export function formatTime(seconds: number): string {
  if (isNaN(seconds) || !isFinite(seconds)) {
    return "0:00";
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
}

/**
 * Parse duration string (like "3:45") to seconds
 * @param duration Duration string in MM:SS format
 * @returns Total seconds
 */
export function parseDuration(duration: string): number {
  if (!duration) return 0;

  // Handle formats like "3:45"
  const parts = duration.split(":");
  if (parts.length === 2) {
    const minutes = parseInt(parts[0], 10);
    const seconds = parseInt(parts[1], 10);
    return minutes * 60 + seconds;
  }

  // Return 0 for invalid format
  return 0;
}

/**
 * Search for songs with metadata
 * @param query Search query string
 * @param limit Maximum number of results to return
 * @returns Promise with search results
 */
export async function searchSongs(
  query: string,
  limit: number = 10
): Promise<SearchResponse> {
  try {
    if (!query || query.trim().length < 2) {
      return { data: [], status: 400, message: "Query too short" };
    }

    // Use mock data as fallback when API is unavailable
    const mockData: Song[] = [
      {
        id: "dQw4w9WgXcQ",
        title: query + " - Search Result 1",
        artist: "Artist Name",
        album: "Album Name",
        duration: "3:45",
        thumbnail: "https://i.ytimg.com/vi/dQw4w9WgXcQ/default.jpg",
      },
      {
        id: "y6120QOlsfU",
        title: query + " - Search Result 2",
        artist: "Another Artist",
        album: "Another Album",
        duration: "4:20",
        thumbnail: "https://i.ytimg.com/vi/y6120QOlsfU/default.jpg",
      },
    ];

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(
        `${API_BASE_URL}/search-songs?query=${encodeURIComponent(
          query
        )}&limit=${limit}`,
        { signal: controller.signal }
      );

      clearTimeout(timeoutId);

      if (!response.ok) {
        console.warn(`API returned error status: ${response.status}`);
        return {
          data: mockData,
          status: 200,
          message: "Using mock data (API unavailable)",
        };
      }

      const data = await response.json();
      return data as SearchResponse;
    } catch (error) {
      console.warn("API fetch failed, using mock data:", error);
      return {
        data: mockData,
        status: 200,
        message: "Using mock data (API unavailable)",
      };
    }
  } catch (error) {
    console.error("Error in searchSongs:", error);
    return {
      data: [],
      status: 500,
      message: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Get details for a specific song by ID
 * @param id Song ID
 * @returns Promise with song details
 */
export async function getSongById(id: string): Promise<Song | null> {
  try {
    if (!id) {
      console.error("Song ID is required");
      return null;
    }

    // Create mock data as fallback
    const mockSong: Song = {
      id: id,
      title: "Song Title",
      artist: "Artist Name",
      album: "Album Name",
      duration: "3:45",
      thumbnail: `https://img.youtube.com/vi/${id}/maxresdefault.jpg`,
    };

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(`${API_BASE_URL}/song/${id}`, {
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        console.warn(`API returned error status: ${response.status}`);
        return mockSong;
      }

      const data = await response.json();
      return data.data as Song;
    } catch (error) {
      console.warn("API fetch failed, using mock data:", error);
      return mockSong;
    }
  } catch (error) {
    console.error("Error fetching song details:", error);
    return null;
  }
}

/**
 * Creates a debounced function that delays invoking the provided function
 * @param func Function to debounce
 * @param wait Wait time in milliseconds
 * @returns Debounced function
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return function (...args: Parameters<T>): void {
    if (timeout) {
      clearTimeout(timeout);
    }

    timeout = setTimeout(() => {
      func(...args);
      timeout = null;
    }, wait);
  };
}
