import { useState, useEffect } from 'react'
import { tmdb } from '../services/tmdb'
import { useContinueWatching } from '../hooks/useContinueWatching'
import PosterRow from '../components/PosterRow'

function Spinner() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 rounded-full border-2 border-accent border-t-transparent animate-spin" />
    </div>
  )
}

export default function Home() {
  const [movies, setMovies] = useState([])
  const [shows, setShows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { getAll } = useContinueWatching()
  const continueWatching = getAll()

  useEffect(() => {
    Promise.all([tmdb.trending('movie'), tmdb.trending('tv')])
      .then(([m, tv]) => {
        setMovies(m.results ?? [])
        setShows(tv.results ?? [])
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <Spinner />
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3 text-center px-4">
        <p className="text-red-400 text-sm">{error}</p>
        <p className="text-gray-500 text-xs">Check your TMDB API key in Settings.</p>
      </div>
    )
  }

  return (
    // iPhone 16 status bar = 59pt; use env() with 60px fallback
    <div
      className="pb-24 md:pb-6"
      style={{ paddingTop: 'max(60px, env(safe-area-inset-top, 60px))' }}
    >
      {continueWatching.length > 0 && (
        <PosterRow title="Continue Watching" items={continueWatching} isContinue />
      )}
      <PosterRow title="Trending Movies" items={movies} type="movie" />
      <PosterRow title="Trending TV Shows" items={shows} type="tv" />
    </div>
  )
}
