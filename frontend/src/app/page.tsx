"use client";

import { useState, useRef } from "react";
import axios from "axios";
import dashjs from "dashjs";

export default function Home() {
  const audioRef = useRef<any>(null);
  const [search, setSearch] = useState("");
  const [songList, setSongList] = useState<any>([]);
  const baseURL = "http://localhost:8080/api/v1";

  const handleInputChange = (event: any) => {
    setSearch(event.target.value);
  };

  const handleClick = async () => {
    console.log(search);
    const res = await axios.get(`${baseURL}/search=${search}`);

    if (res && res?.data?.message && res?.data?.message === "Success") {
      const newSongs = res.data.data;

      // Check if newSongs is an array or a single string
      if (Array.isArray(newSongs)) {
        setSongList((prevList: any) => [...prevList, ...newSongs]);
      } else {
        setSongList((prevList: any) => [...prevList, newSongs]);
      }
    }
  };

  const handleSongPlayBack = (song: string) => {
    if (audioRef.current) {
      const url = `${baseURL}/stream/${song}/manifest.mpd`;
      const player = dashjs.MediaPlayer().create();
      player.initialize(audioRef.current, url, true);
    }
  };

  return (
    <div className="flex flex-col justify-center items-center">
      <h1 className="text-center text-2xl p-5 text-black">
        This is the frontend for music streaming app
      </h1>
      <input
        onChange={handleInputChange}
        type="text"
        placeholder="What do you want to hear"
        className="text-black border-2 border-x-pink-600 border-y-violet-600 my-11 px-8 py-6 w-[50vw] rounded-3xl focus:outline-none focus:text-[16.5px] transition-all ease-in-out"
      />
      <button
        onClick={handleClick}
        className="text-black focus:outline-none border-black border-2 px-4 py-2 rounded-lg mb-20"
      >
        Search Music
      </button>
      <div className="flex flex-col items-center justify-center">
        {songList.map((song: any, index: number) => (
          <div
            key={index}
            className="flex flex-col items-center justify-center gap-2"
          >
            <p
              className="text-black text-xl"
              onClick={() => handleSongPlayBack(song)}
            >
              {song}
            </p>
            {/* <p className="text-black text-xl">{song.artist}</p>
            <p className="text-black text-xl">{song.album}</p> */}
          </div>
        ))}
      </div>
      <audio ref={audioRef} controls style={{ width: "100%" }} />
    </div>
  );
}
