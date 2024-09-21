"use client";

import React, { useEffect, useRef, useState } from "react";
import { parseManifest } from "@/utils/helper";

export const MSEAudioPlayer: React.FC<{ manifestUrl: string }> = ({
  manifestUrl,
}) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (!manifestUrl) return;

    const mediaSource = new MediaSource();
    if (audioRef.current) {
      audioRef.current.src = URL.createObjectURL(mediaSource);
    }

    mediaSource.addEventListener("sourceopen", async () => {
      const sourceBuffer = mediaSource.addSourceBuffer(
        'audio/mp4; codecs="mp4a.40.2"'
      );
      const segmentUrls = await parseManifest(manifestUrl);

      for (let segmentUrl of segmentUrls) {
        const segmentResponse = await fetch(segmentUrl);
        const segmentData = await segmentResponse.arrayBuffer();
        sourceBuffer.appendBuffer(segmentData);
      }

      sourceBuffer.addEventListener("updateend", () => {
        if (!sourceBuffer.updating && mediaSource.readyState === "open") {
          mediaSource.endOfStream();
        }
      });
    });
  }, [manifestUrl]);

  const togglePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <div>
      <audio ref={audioRef} />
      <button onClick={togglePlayPause}>{isPlaying ? "Pause" : "Play"}</button>
    </div>
  );
};
