# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

MeloFlow is a music streaming service that lets users browse and stream music from YouTube Music. FastAPI backend serves audio via DASH/CMAF segmented streaming; Next.js frontend provides the player UI.

## Development Commands

### Backend (from `backend/` directory)
```bash
source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload          # runs on port 8000
```

### Frontend (from `frontend_melo/` directory)
```bash
npm install
npm run dev       # runs on port 3000
npm run build     # production build
npm run lint      # ESLint
```

### Docker (from `backend/` directory)
```bash
docker-compose up --build              # API on port 8080
```

## Architecture

### Backend (`backend/app/`)
- **Framework**: FastAPI with Uvicorn (async)
- **Entry point**: `main.py` — creates the FastAPI app, mounts CORS, includes the API router
- **Routes**: `routes/api.py` — all endpoints under `/api/v1` (search, song details, DASH manifest, segment streaming with HTTP 206)
- **Services**:
  - `BrowseMusicService/` — wraps `ytmusicapi` to search YouTube Music and fetch song metadata
  - `DownloadService.py` — uses `yt-dlp` with cookies to download audio as AAC (48kHz, 192kbps)
  - `AudioSegmentation.py` — calls FFmpeg to segment audio into DASH/CMAF chunks (4-second segments, produces `manifest.mpd`)
- **Utils**: `utils/ffmpeg.py` (async FFmpeg runner), `utils/file_operations.py` (file/dir helpers)
- **Config**: `config.py` — paths for FFmpeg binary, songs dir, CMAF output dir, cookies file

### Frontend (`frontend_melo/src/`)
- **Framework**: Next.js 15 (App Router) with React 19, TypeScript, Tailwind CSS v4
- **Pages**: `/home` (dashboard with search, playlists, floating player bar), `/song` (full player with controls)
- **Key components**: `SearchBar.tsx` (debounced search with dropdown), `DashAudioPlayer.tsx` (MediaSource API for DASH streaming)
- **API layer**: `lib/utils.ts` — centralized API calls to backend at `http://localhost:8080/api/v1`, falls back to mock data
- **UI primitives**: Radix UI components in `ui/` directory (shadcn/ui pattern)
- **Path alias**: `@/*` maps to `./src/*`

### Streaming Flow
1. Client requests `/stream/{song_id}/manifest.mpd`
2. Backend downloads song via yt-dlp if not cached, then segments with FFmpeg
3. Client parses manifest, fetches segments via `/stream/{song_id}/{segment}` (range requests)
4. `DashAudioPlayer` uses MediaSource API to buffer and play segments

## Prerequisites
- FFmpeg binary at `backend/ffmpeg/bin/ffmpeg` (Docker copies to `/usr/bin/ffmpeg`)
- YouTube Music cookies file at `backend/cookies.txt` (required for yt-dlp downloads)
- Python 3.11, Node.js

## Notes
- The old `frontend/` directory has been replaced by `frontend_melo/`
- Backend port differs: 8000 local dev vs 8080 in Docker
- CORS allows origins on ports 3000 and 3001
