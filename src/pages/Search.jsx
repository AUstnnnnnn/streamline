import { useState, useEffect, useRef } from 'react'
import { Search as SearchIcon } from 'lucide-react'
import { tmdb } from '../services/tmdb'
import PosterCard from '../components/PosterCard'

export default function Search() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const debounce = useRef()

  useEffect(() => {
    if (!query.trim()) {
      setResults([])
      return
    }

    clearTimeout(debounce.current)
    debounce.current = setTimeout(async () => {
      setLoading(true)
      try {
        const data = await tmdb.search(query)
        setResults(
          (data.results ?? []).filter(
            r => (r.media_type === 'movie' || r.media_type === 'tv') && r.poster_path
          )
        )
      } catch { /* ignore */ }
      setLoading(false)
    }, 400)

    return () => clearTimeout(debounce.current)
  }, [query])

  return (
    <div className="pb-24 md:pb-6">
      <div className="sticky top-0 md:top-[65px] z-30 px-4 py-3 bg-gray-950/95 backdrop-blur-sm border-b border-gray-800/60">
        <div className="relative max-w-lg mx-auto">
          <SearchIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
          <input
            type="search"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Movies, TV shows..."
            autoFocus
            className="w-full bg-surface border border-gray-700 focus:border-accent rounded-xl pl-10 pr-4 py-3 text-white text-sm placeholder-gray-500 outline-none transition-colors"
          />
        </div>
      </div>

      <div className="px-4 pt-4">
        {loading && (
          <div className="flex justify-center py-12">
            <div className="w-7 h-7 rounded-full border-2 border-accent border-t-transparent animate-spin" />
          </div>
        )}

        {!loading && results.length > 0 && (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
            {results.map(item => (
              <PosterCard key={item.id} item={item} type={item.media_type} />
            ))}
          </div>
        )}

        {!loading && query && results.length === 0 && (
          <p className="text-center text-gray-500 text-sm py-12">
            No results for &ldquo;{query}&rdquo;
          </p>
        )}

        {!query && (
          <div className="flex flex-col items-center gap-3 py-16 text-gray-600">
            <SearchIcon className="w-10 h-10 opacity-30" />
            <p className="text-sm">Search for movies and TV shows</p>
          </div>
        )}
      </div>
    </div>
  )
}
