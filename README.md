# MeloFlow

A full-stack music streaming application that lets you search, browse, and stream music using adaptive bitrate streaming (DASH/CMAF). Built with a FastAPI backend and a Next.js frontend.

---

## How It Works

MeloFlow connects to YouTube Music's catalog through `ytmusicapi` for search and metadata, then builds a real-time streaming pipeline:

```
User searches for a song
        |
        v
  ytmusicapi queries YouTube Music catalog
        |
        v
  Song metadata (title, artist, album art, duration) returned to frontend
        |
        v
  User clicks play
        |
        v
  Backend checks if audio is already cached locally
        |
    No? |------> yt-dlp downloads audio as AAC (48kHz, 192kbps)
        |                          |
        v                          v
  FFmpeg segments the audio into DASH/CMAF chunks (4-second segments)
        |
        v
  DASH manifest (manifest.mpd) served to frontend
        |
        v
  DashAudioPlayer parses manifest, fetches segments via HTTP 206 range requests
        |
        v
  MediaSource API buffers and plays audio in the browser
```

Once a song is downloaded and segmented, subsequent plays are served directly from cache — no re-downloading.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Backend** | Python 3.11, FastAPI, Uvicorn |
| **Frontend** | Next.js 15, React 19, TypeScript |
| **Styling** | Tailwind CSS v4, Radix UI primitives |
| **Audio Pipeline** | yt-dlp, FFmpeg, DASH/CMAF |
| **Music Catalog** | YouTube Music via `ytmusicapi` |
| **Containerization** | Docker, Docker Compose |

---

## API Endpoints

All endpoints are served under `/api/v1`:

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/` | Health check |
| `GET` | `/search={query}` | Search for a single song (returns first match ID) |
| `GET` | `/search-songs?query=...&limit=10` | Search for multiple songs with full metadata (title, artist, album, thumbnail, duration). Limit: 1–20 |
| `GET` | `/song/{song_id}` | Get detailed metadata for a specific song by YouTube video ID |
| `GET` | `/stream/{song_id}/manifest.mpd` | Get DASH manifest for a song. Triggers download + segmentation if not cached |
| `GET` | `/stream/{song_id}/{segment}` | Stream an individual audio segment with HTTP 206 partial content support |

---

## Frontend Pages

### `/home` — Dashboard
- Sidebar navigation (Home, Search, Library)
- Search bar with debounced queries (300ms) and dropdown results showing thumbnails, titles, and artists
- Search results grid — clicking a result navigates to the song player
- "Your Vibe Today" mood buttons (Energetic, Chill, Focus, Workout) — UI present, playlist logic not yet wired
- "Recently Played" horizontal scroll — UI present with placeholder tracks
- "Discover" playlist grid — UI present with placeholder items
- Floating player bar at the bottom

### `/song?id={songId}` — Song Player
- Album artwork display pulled from YouTube Music thumbnails
- Full playback controls: play/pause, progress bar with seek, volume slider with mute toggle
- Song metadata display (title, artist, album)
- Elapsed / total time display
- Shuffle, repeat, skip back/forward buttons — UI present, logic not yet connected
- Lyrics section — displays "Lyrics not available" placeholder
- DASH audio streaming via the `DashAudioPlayer` component using the browser's MediaSource API

---

## The DASH Audio Player

The `DashAudioPlayer` component (`frontend_melo/src/components/DashAudioPlayer.tsx`) is a custom implementation that handles adaptive streaming without any third-party DASH player library:

1. **Manifest parsing** — Fetches and parses the FFmpeg-generated MPD manifest, supporting both `SegmentTemplate` (with `SegmentTimeline` and repeat counts) and `SegmentURL` formats
2. **Segment loading** — Sequentially fetches the initialization segment followed by all media segments via the backend's streaming endpoint
3. **MediaSource API** — Uses `MediaSource` and `SourceBuffer` with the `audio/mp4; codecs="mp4a.40.2"` (AAC-LC) codec to buffer and play audio
4. **Lifecycle management** — Proper cleanup of `MediaSource` objects, `ObjectURL` revocation, and `AbortController`-based request cancellation on component unmount or song change

---

## Audio Processing Pipeline

The backend processes audio through three stages:

**1. Download** (`DownloadService.py`)
- Uses `yt-dlp` with cookie-based authentication to download from YouTube Music
- Extracts best available audio and post-processes to AAC format
- Normalizes to 48kHz sample rate, stereo, 192kbps bitrate
- Includes rate limiting (5–20 second intervals) to avoid throttling
- Output: `songs/{song_id}.m4a`

**2. Segmentation** (`AudioSegmentation.py`)
- Runs FFmpeg asynchronously via `asyncio.create_subprocess_exec`
- Copies AAC audio without re-encoding (`-c:a copy`)
- Produces CMAF-compliant MP4 segments with 4-second duration
- Generates `manifest.mpd` + `init.mp4` + numbered chunk files (`chunk-0-00001.m4s`, etc.)
- Output: `cmaf_files/{song_id}/`

**3. Streaming** (`routes/api.py`)
- Serves the MPD manifest as `application/dash+xml`
- Streams individual segments with HTTP 206 partial content responses
- Automatically detects content type from file extension (`.mp4`, `.m4s`, `.mp3`, `.aac`, `.webm`)

---

## Getting Started

### Prerequisites
- **Python 3.11**
- **Node.js** (v18+)
- **FFmpeg** binary — place it at `backend/ffmpeg/bin/ffmpeg`
- **YouTube Music cookies** — export your browser cookies to `backend/cookies.txt` (required for `yt-dlp` to authenticate downloads)

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

The API runs on `http://localhost:8000` in local development.

### Frontend

```bash
cd frontend_melo
npm install
npm run dev
```

The frontend runs on `http://localhost:3000` and expects the backend API at `http://localhost:8080`.

### Docker (alternative)

```bash
cd backend
docker-compose up --build
```

Runs the backend on `http://localhost:8080` with volume mounting for live reload.

> **Note:** The frontend is not containerized yet — it runs separately via `npm run dev`.

---

## Project Structure

```
MeloFlow/
├── backend/
│   ├── app/
│   │   ├── main.py                  # FastAPI app + CORS config
│   │   ├── config.py                # Paths & FFmpeg settings
│   │   ├── routes/api.py            # All API endpoints
│   │   ├── services/
│   │   │   ├── BrowseMusicService/  # YouTube Music search & metadata
│   │   │   ├── DownloadService.py   # yt-dlp audio downloads
│   │   │   └── AudioSegmentation.py # FFmpeg DASH/CMAF segmentation
│   │   └── utils/
│   │       ├── ffmpeg.py            # Async FFmpeg subprocess runner
│   │       └── file_operations.py   # File existence & directory helpers
│   ├── requirements.txt
│   ├── Dockerfile
│   └── docker-compose.yaml
│
└── frontend_melo/
    └── src/
        ├── app/
        │   ├── home/page.tsx        # Dashboard with search + browsing
        │   └── song/page.tsx        # Song player page
        ├── components/
        │   ├── SearchBar.tsx         # Debounced search with dropdown
        │   └── DashAudioPlayer.tsx   # Custom DASH streaming player
        ├── ui/                      # Radix UI components (shadcn/ui)
        └── lib/
            ├── utils.ts             # API calls, types, formatters
            └── userTracking.ts      # Client-side user ID (nanoid)
```

---

## Current Status

This project is under active development. Here's an honest look at what's working and what's not yet built:

**Working:**
- Song search with real-time results from YouTube Music
- Song metadata fetching (title, artist, album, thumbnail, duration)
- Full audio download → segmentation → DASH streaming pipeline
- Browser-based audio playback with play/pause, seek, and volume control
- Responsive dark-themed UI with custom accent color (`#DCEC7C`)
- Graceful fallback to mock data when the backend API is unavailable

**Not yet implemented:**
- User authentication (currently uses anonymous client-side IDs)
- Playlist creation and management
- Recently played / listening history tracking
- Skip, shuffle, and repeat functionality
- Lyrics fetching
- Frontend containerization
- Queue management and continuous playback across songs

---

## License

This project is for educational and personal use.
