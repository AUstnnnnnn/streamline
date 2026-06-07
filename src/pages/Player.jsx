import { useRef, useState, useEffect, useCallback } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { ArrowLeft, Play, Pause, Volume2, VolumeX, Maximize, Minimize } from 'lucide-react'
import { useContinueWatching } from '../hooks/useContinueWatching'

function fmt(secs) {
  if (!isFinite(secs) || isNaN(secs)) return '0:00'
  const h = Math.floor(secs / 3600)
  const m = Math.floor((secs % 3600) / 60)
  const s = Math.floor(secs % 60)
  return h > 0
    ? `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
    : `${m}:${String(s).padStart(2, '0')}`
}

export default function Player() {
  const location = useLocation()
  const navigate = useNavigate()
  const { save: saveContinue } = useContinueWatching()

  const state = location.state ?? {}
  const { url, title, imdbId, tmdbId, type, poster, season, episode, startTime = 0 } = state

  const videoRef = useRef()
  const containerRef = useRef()
  const hideTimer = useRef()
  const saveTimer = useRef()

  const [playing, setPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(startTime)
  const [duration, setDuration] = useState(0)
  const [muted, setMuted] = useState(false)
  const [fullscreen, setFullscreen] = useState(false)
  const [showControls, setShowControls] = useState(true)
  const [seeking, setSeeking] = useState(false)

  // Auto-request fullscreen on mobile load
  useEffect(() => {
    if (!url) return
    const isMobile = /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent)
    if (isMobile) {
      containerRef.current?.requestFullscreen?.().catch(() => {})
    }
    return () => {
      if (document.fullscreenElement) document.exitFullscreen().catch(() => {})
    }
  }, [url])

  // Track fullscreen changes from browser UI
  useEffect(() => {
    const onFsChange = () => setFullscreen(Boolean(document.fullscreenElement))
    document.addEventListener('fullscreenchange', onFsChange)
    return () => document.removeEventListener('fullscreenchange', onFsChange)
  }, [])

  const saveProgress = useCallback(() => {
    const v = videoRef.current
    if (!v || !imdbId || !isFinite(v.currentTime)) return
    saveContinue({
      imdbId,
      tmdbId,
      type,
      title,
      poster,
      season: season ?? null,
      episode: episode ?? null,
      timestamp: Math.floor(v.currentTime),
      duration: Math.floor(v.duration) || 0,
      savedAt: Date.now(),
    })
  }, [imdbId, tmdbId, type, title, poster, season, episode, saveContinue])

  // Save progress every 10s
  useEffect(() => {
    saveTimer.current = setInterval(saveProgress, 10000)
    return () => clearInterval(saveTimer.current)
  }, [saveProgress])

  const showControlsTemporarily = () => {
    setShowControls(true)
    clearTimeout(hideTimer.current)
    if (videoRef.current && !videoRef.current.paused) {
      hideTimer.current = setTimeout(() => setShowControls(false), 3000)
    }
  }

  const togglePlay = () => {
    const v = videoRef.current
    if (!v) return
    v.paused ? v.play() : v.pause()
  }

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen()
    } else {
      document.exitFullscreen()
    }
  }

  const toggleMute = () => {
    const v = videoRef.current
    if (!v) return
    v.muted = !v.muted
    setMuted(v.muted)
  }

  const handleBack = () => {
    saveProgress()
    navigate(-1)
  }

  if (!url) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-black text-white gap-4">
        <p className="text-gray-400">No stream URL provided.</p>
        <button onClick={() => navigate(-1)} className="text-accent underline text-sm">Go back</button>
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      className="relative w-full h-screen bg-black overflow-hidden select-none"
      onMouseMove={showControlsTemporarily}
      onTouchStart={showControlsTemporarily}
    >
      <video
        ref={videoRef}
        src={url}
        className="w-full h-full object-contain"
        playsInline
        onClick={togglePlay}
        onPlay={() => { setPlaying(true); hideTimer.current = setTimeout(() => setShowControls(false), 3000) }}
        onPause={() => { setPlaying(false); setShowControls(true); clearTimeout(hideTimer.current) }}
        onLoadedMetadata={() => {
          const v = videoRef.current
          setDuration(v.duration)
          if (startTime > 0) v.currentTime = startTime
          v.play().catch(() => {})
        }}
        onTimeUpdate={() => {
          if (!seeking) setCurrentTime(videoRef.current?.currentTime ?? 0)
        }}
        onEnded={() => { setPlaying(false); setShowControls(true); saveProgress() }}
      />

      {/* Top gradient */}
      <div
        className={`absolute top-0 left-0 right-0 h-28 bg-gradient-to-b from-black/80 to-transparent pointer-events-none transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}
      />
      {/* Bottom gradient */}
      <div
        className={`absolute bottom-0 left-0 right-0 h-36 bg-gradient-to-t from-black/90 to-transparent pointer-events-none transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}
      />

      {/* Top bar */}
      <div
        className={`absolute top-0 left-0 right-0 flex items-center gap-3 px-4 pt-safe pt-4 transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}
        onClick={e => e.stopPropagation()}
      >
        <button
          onClick={handleBack}
          className="p-2 rounded-full bg-black/40 hover:bg-black/60 text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="min-w-0">
          <p className="text-white font-medium text-sm truncate">{title}</p>
          {season != null && episode != null && (
            <p className="text-gray-400 text-xs">Season {season} · Episode {episode}</p>
          )}
        </div>
      </div>

      {/* Center play indicator (shown when paused) */}
      {!playing && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="rounded-full bg-black/50 p-5">
            <Play className="w-10 h-10 text-white" fill="currentColor" />
          </div>
        </div>
      )}

      {/* Bottom controls */}
      <div
        className={`absolute bottom-0 left-0 right-0 px-4 pb-safe pb-4 space-y-2 transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}
        onClick={e => e.stopPropagation()}
      >
        {/* Seek bar */}
        <input
          type="range"
          min={0}
          max={duration || 0}
          value={currentTime}
          step={0.5}
          onChange={e => {
            const t = Number(e.target.value)
            setCurrentTime(t)
            if (videoRef.current) videoRef.current.currentTime = t
          }}
          onMouseDown={() => setSeeking(true)}
          onMouseUp={() => setSeeking(false)}
          onTouchEnd={() => setSeeking(false)}
          className="w-full h-1 cursor-pointer rounded-full bg-gray-600 appearance-none"
          style={{
            background: `linear-gradient(to right, #e87c2d ${duration ? (currentTime / duration) * 100 : 0}%, #4b5563 0%)`,
          }}
        />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={togglePlay} className="text-white">
              {playing
                ? <Pause className="w-6 h-6" fill="currentColor" />
                : <Play className="w-6 h-6" fill="currentColor" />
              }
            </button>

            <button onClick={toggleMute} className="text-white">
              {muted
                ? <VolumeX className="w-5 h-5" />
                : <Volume2 className="w-5 h-5" />
              }
            </button>

            <span className="text-white text-xs tabular-nums">
              {fmt(currentTime)} / {fmt(duration)}
            </span>
          </div>

          <button onClick={toggleFullscreen} className="text-white">
            {fullscreen
              ? <Minimize className="w-5 h-5" />
              : <Maximize className="w-5 h-5" />
            }
          </button>
        </div>
      </div>
    </div>
  )
}
