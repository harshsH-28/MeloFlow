"use client";

import React, { useState, useRef } from "react";
import axios from "axios";
import { MSEAudioPlayer } from "@/components/MSEAudioPlayer";
import { WebAudioPlayer } from "@/components/WebAudioPlayer";

const BASE_URL = "http://localhost:8080/api/v1";

const Page = () => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [searchQuery, setSongQuery] = useState<string>("");
  const [songs, setSongs] = useState<string[]>([]);
  const [manifestURL, setManifestURL] = useState("");

  const handleSearch = async () => {
    if (!searchQuery) return;
    const search_url = `${BASE_URL}/search=${searchQuery}`;
    const response = await axios.get(search_url);
    const songIDRes = response?.data?.data ?? "";
    setSongs((prev) => [...prev, songIDRes]);
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const song = event?.target?.value ?? "";
    setSongQuery(song);
  };

  const handlePlaySong = (song_id: string) => {
    const manifestUrl = `${BASE_URL}/stream/${song_id}/manifest.mpd`;
    setManifestURL(manifestUrl);
    return;
    const fetchAudio = async () => {
      const response = await fetch(manifestUrl);
      const manifest = await response.text();
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(manifest, "text/xml");
      const segments = xmlDoc.getElementsByTagName("SegmentURL");

      const chunks = [];

      const segmentsArray = Array.from(segments); // Convert HTMLCollection to Array
      for (let segment of segmentsArray) {
        const segmentUrl = segment.getAttribute("media");
        console.log(segmentUrl);
        if (segmentUrl) {
          // Check if segmentUrl is not null
          const segmentResponse = await fetch(segmentUrl);
          const segmentBlob = await segmentResponse.blob();
          chunks.push(segmentBlob);
        }
      }

      const fullAudioBlob = new Blob(chunks, { type: "audio/mp4" });
      const url = URL.createObjectURL(fullAudioBlob);
      setAudioUrl(url);
    };

    fetchAudio();
  };

  const togglePlayPause = () => {
    if (audioRef?.current) {
      if (isPlaying) {
        audioRef?.current?.pause();
      } else {
        audioRef?.current?.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <div className="w-screen h-screen flex flex-col justify-center text-black">
      <div className="flex flex-col items-center gap-4">
        <input
          type="text"
          className="px-2 py-1 w-[20em] h-[3em] border-solid border-[1px] border-[#181C14] rounded-xl text-pretty"
          placeholder="What song you want to hear today?"
          onChange={(e) => handleInputChange(e)}
        />
        <button
          className="w-[8em] px-4 py-2 bg-[#3C3D37] text-white rounded-lg text-center hover:bg-[#343531] transition-all ease-in-out"
          onClick={handleSearch}
        >
          Search
        </button>
        <ul className="text-pretty">
          {songs.map((song, key) => (
            <li
              key={key}
              onClick={() => handlePlaySong(song)}
              className="cursor-pointer"
            >
              {song}
            </li>
          ))}
        </ul>
      </div>
      {/* {audioUrl && <audio ref={audioRef} src={audioUrl} />}
      {audioUrl && (
        <button onClick={togglePlayPause} disabled={!audioUrl}>
          {isPlaying ? "Pause" : "Play"}
        </button>
      )} */}
      {manifestURL && <MSEAudioPlayer manifestUrl={manifestURL} />}
    </div>
  );
};

export default Page;
