import React, { useEffect, useRef, useState } from "react";

export const BlobAudioPlayer = ({ manifestUrl }: { manifestUrl: string }) => {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);

  useEffect(() => {
    if (!manifestUrl) return;

    const fetchAudio = async () => {
      const response = await fetch(manifestUrl);
      const manifest = await response.text();
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(manifest, "text/xml");
      const segments = xmlDoc.getElementsByTagName("SegmentURL");

      const chunks = [];

      for (let segment of segments) {
        const segmentUrl = segment.getAttribute("media");
        const segmentResponse = await fetch(segmentUrl);
        const segmentBlob = await segmentResponse.blob();
        chunks.push(segmentBlob);
      }

      const fullAudioBlob = new Blob(chunks, { type: "audio/mp4" });
      const url = URL.createObjectURL(fullAudioBlob);
      setAudioUrl(url);
    };

    fetchAudio();

    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [manifestUrl]);

  const togglePlayPause = () => {
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <div>
      {audioUrl && <audio ref={audioRef} src={audioUrl} />}
      <button onClick={togglePlayPause} disabled={!audioUrl}>
        {isPlaying ? "Pause" : "Play"}
      </button>
    </div>
  );
};
