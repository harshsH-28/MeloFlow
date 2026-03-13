import React, { useEffect, useRef, useState } from "react";

interface DashAudioPlayerProps {
  songId: string;
  onTimeUpdate?: (currentTime: number, duration: number) => void;
  onEnded?: () => void;
  onPlay?: () => void;
  onPause?: () => void;
  onError?: (error: string) => void;
  onLoaded?: (duration: number) => void;
  volume?: number;
  isMuted?: boolean;
  isPlaying?: boolean;
}

const API_BASE_URL = "http://localhost:8080/api/v1";

const DashAudioPlayer: React.FC<DashAudioPlayerProps> = ({
  songId,
  onTimeUpdate,
  onEnded,
  onPlay,
  onPause,
  onError,
  onLoaded,
  volume = 1,
  isMuted = false,
  isPlaying = false,
}) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const mediaSourceRef = useRef<MediaSource | null>(null);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);

  // Parse MPD manifest to get segment URLs
  const parseManifest = async (manifestUrl: string): Promise<string[]> => {
    try {
      const response = await fetch(manifestUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch manifest: ${response.statusText}`);
      }

      const manifest = await response.text();
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(manifest, "text/xml");

      const baseUrl = manifestUrl.substring(
        0,
        manifestUrl.lastIndexOf("/") + 1
      );
      const segmentUrls: string[] = [];

      // Try for SegmentTemplate format first (FFmpeg DASH output)
      const segmentTemplates = xmlDoc.getElementsByTagName("SegmentTemplate");
      if (segmentTemplates.length > 0) {
        // Get adaptation set
        const adaptationSets = xmlDoc.getElementsByTagName("AdaptationSet");
        if (adaptationSets.length > 0) {
          const adaptationSet = adaptationSets[0]; // Take first one
          const segmentTemplate =
            adaptationSet.getElementsByTagName("SegmentTemplate")[0];

          if (segmentTemplate) {
            // Get initialization segment
            const initialization =
              segmentTemplate.getAttribute("initialization");
            if (initialization) {
              // Add initialization segment (required first segment)
              segmentUrls.push(
                `${baseUrl}${initialization.replace("$RepresentationID$", "0")}`
              );
            }

            // Get media segments
            const media = segmentTemplate.getAttribute("media");
            const startNumber = parseInt(
              segmentTemplate.getAttribute("startNumber") || "1",
              10
            );

            // Get segment timeline
            const segmentTimeline =
              segmentTemplate.getElementsByTagName("SegmentTimeline")[0];
            if (segmentTimeline && media) {
              const segments = segmentTimeline.getElementsByTagName("S");
              let segmentNumber = startNumber;

              for (let i = 0; i < segments.length; i++) {
                const segment = segments[i];
                // Get repeat count (r attribute) - default to 0 if not present
                const repeatCount = parseInt(
                  segment.getAttribute("r") || "0",
                  10
                );

                // Generate URLs for this segment and all its repeats
                for (let j = 0; j <= repeatCount; j++) {
                  const formattedNumber = String(segmentNumber).padStart(
                    5,
                    "0"
                  );
                  const segmentUrl = `${baseUrl}${media}`
                    .replace("$RepresentationID$", "0")
                    .replace("$Number%05d$", formattedNumber)
                    .replace("$Number$", String(segmentNumber));

                  segmentUrls.push(segmentUrl);
                  segmentNumber++;
                }
              }
            }
          }
        }
      } else {
        // Fallback to SegmentURL format
        const segments = xmlDoc.getElementsByTagName("SegmentURL");
        for (let i = 0; i < segments.length; i++) {
          const segment = segments[i];
          const media = segment.getAttribute("media");
          if (media) {
            segmentUrls.push(`${baseUrl}${media}`);
          }
        }
      }

      return segmentUrls;
    } catch (error) {
      console.error("Error parsing manifest:", error);
      return [];
    }
  };

  // Initialize the player for a new song
  useEffect(() => {
    if (!songId) return;

    const manifestUrl = `${API_BASE_URL}/stream/${songId}/manifest.mpd`;
    console.log("Loading manifest from:", manifestUrl);

    const abortController = new AbortController();
    let cleanedUp = false;

    // Reset state
    setIsInitialized(false);

    const initializeAudioPlayer = async () => {
      try {
        // Create MediaSource
        const mediaSource = new MediaSource();
        mediaSourceRef.current = mediaSource;

        if (audioRef.current) {
          audioRef.current.src = URL.createObjectURL(mediaSource);
        }

        // Process when the MediaSource is open
        mediaSource.addEventListener(
          "sourceopen",
          async () => {
            try {
              // Don't continue if we've already cleaned up
              if (cleanedUp) return;

              // Add source buffer
              const sourceBuffer = mediaSource.addSourceBuffer(
                'audio/mp4; codecs="mp4a.40.2"'
              );

              // Get segment URLs from manifest
              const segmentUrls = await parseManifest(manifestUrl);
              console.log(`Found ${segmentUrls.length} segments`);

              if (segmentUrls.length === 0 || cleanedUp) return;

              // Load all segments sequentially (like in the working MSEAudioPlayer example)
              for (let i = 0; i < segmentUrls.length; i++) {
                if (cleanedUp) break;

                // Load a segment
                try {
                  // Wait if the sourceBuffer is currently updating
                  if (sourceBuffer.updating) {
                    await new Promise<void>((resolve) => {
                      sourceBuffer.addEventListener(
                        "updateend",
                        () => resolve(),
                        { once: true }
                      );
                    });
                  }

                  // Don't continue if we've already cleaned up
                  if (cleanedUp) break;

                  // Fetch and append segment
                  const response = await fetch(segmentUrls[i], {
                    signal: abortController.signal,
                  });
                  const data = await response.arrayBuffer();
                  sourceBuffer.appendBuffer(data);

                  // Mark player as initialized after we've processed the first segment
                  if (i === 1 && !cleanedUp) {
                    setIsInitialized(true);
                  }

                  // Wait for segment to be appended
                  await new Promise<void>((resolve) => {
                    sourceBuffer.addEventListener(
                      "updateend",
                      () => resolve(),
                      { once: true }
                    );
                  });
                } catch (err: unknown) {
                  if (
                    err instanceof DOMException &&
                    err.name !== "AbortError"
                  ) {
                    console.warn(`Error loading segment ${i}:`, err);
                  } else if (err instanceof Error) {
                    console.warn(`Error loading segment ${i}:`, err);
                  }
                  // Continue with next segment
                }
              }

              // End the stream when all segments are loaded
              if (!cleanedUp && !mediaSource.readyState.includes("closed")) {
                try {
                  mediaSource.endOfStream();
                } catch (err) {
                  // MediaSource might already be closed
                }
              }
            } catch (error) {
              console.error("Error in sourceopen handler:", error);
            }
          },
          { once: true }
        );
      } catch (error) {
        console.error("Error initializing player:", error);
      }
    };

    initializeAudioPlayer();

    // Cleanup function
    return () => {
      cleanedUp = true;
      abortController.abort();

      // Clean up MediaSource
      if (
        mediaSourceRef.current &&
        !mediaSourceRef.current.readyState.includes("closed")
      ) {
        try {
          mediaSourceRef.current.endOfStream();
        } catch (error) {
          // MediaSource might already be closed
        }
      }

      // Revoke object URL
      if (audioRef.current && audioRef.current.src) {
        URL.revokeObjectURL(audioRef.current.src);
      }
    };
  }, [songId]);

  // Handle play/pause
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    // Set volume and mute properties
    audio.volume = volume;
    audio.muted = isMuted;

    // Handle play/pause
    if (isPlaying && isInitialized) {
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch((error) => {
          console.log("Play error:", error);
          // Don't report error to UI
        });
      }
    } else if (!isPlaying) {
      audio.pause();
    }
  }, [isPlaying, isInitialized, volume, isMuted]);

  // Set up audio element event handlers
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      onTimeUpdate?.(audio.currentTime, audio.duration);
    };

    const handleEnded = () => {
      onEnded?.();
    };

    const handlePlay = () => {
      onPlay?.();
    };

    const handlePause = () => {
      onPause?.();
    };

    const handleLoadedMetadata = () => {
      onLoaded?.(audio.duration);
    };

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("play", handlePlay);
    audio.addEventListener("pause", handlePause);
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("pause", handlePause);
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
    };
  }, [onTimeUpdate, onEnded, onPlay, onPause, onLoaded]);

  return <audio ref={audioRef} />;
};

export default DashAudioPlayer;
