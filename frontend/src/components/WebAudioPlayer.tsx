import React, { useEffect, useRef, useState } from "react";

export const WebAudioPlayer = ({ manifestUrl }: { manifestUrl: string }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null); // Updated type

  useEffect(() => {
    audioContextRef.current = new (window.AudioContext ||
      (window as any).webkitAudioContext)(); // Type assertion added
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  const playAudio = async () => {
    if (!manifestUrl) return;

    const response = await fetch(manifestUrl);
    const manifest = await response.text();
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(manifest, "text/xml");
    const segments = xmlDoc.getElementsByTagName("SegmentURL");

    const segmentsArray = Array.from(segments); // Convert HTMLCollection to Array
    const buffers = [];

    for (let segment of segmentsArray) {
      const segmentUrl = segment.getAttribute("media");
      if (!segmentUrl) continue; // Skip if segmentUrl is null
      const segmentResponse = await fetch(segmentUrl);
      const segmentData = await segmentResponse.arrayBuffer();
      if (!audioContextRef.current) return; // Check if audioContextRef is not null
      const audioBuffer = await audioContextRef.current.decodeAudioData(
        segmentData
      );
      buffers.push(audioBuffer);
    }

    const totalLength = buffers.reduce((acc, buffer) => acc + buffer.length, 0);
    if (!audioContextRef.current) return; // Check if audioContextRef is not null
    const result = audioContextRef.current.createBuffer(
      buffers[0].numberOfChannels,
      totalLength,
      buffers[0].sampleRate
    );

    let offset = 0;
    for (const buffer of buffers) {
      for (let i = 0; i < buffer.numberOfChannels; i++) {
        result.copyToChannel(buffer.getChannelData(i), i, offset);
      }
      offset += buffer.length;
    }

    sourceNodeRef.current = audioContextRef.current.createBufferSource();
    sourceNodeRef.current.buffer = result;
    sourceNodeRef.current.connect(audioContextRef.current.destination);
    sourceNodeRef.current.start();
    setIsPlaying(true);
  };

  const stopAudio = () => {
    if (sourceNodeRef.current) {
      sourceNodeRef.current.stop();
      setIsPlaying(false);
    }
  };

  return (
    <div>
      <button onClick={isPlaying ? stopAudio : playAudio}>
        {isPlaying ? "Stop" : "Play"}
      </button>
    </div>
  );
};
