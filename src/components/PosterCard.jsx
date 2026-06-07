import { Link } from 'react-router-dom'
import { Play } from 'lucide-react'
import { tmdb } from '../services/tmdb'

export default function PosterCard({ item, type, isContinue = false }) {
  const tmdbId = item.tmdbId ?? item.id
  const title = item.title ?? item.name
  const mediaType = (type === 'movie' || item.media_type === 'movie') ? 'movie' : 'tv'

  const posterPath = isContinue ? item.poster : item.poster_path
  const posterUrl = tmdb.posterUrl(posterPath)

  const progress =
    isContinue && item.duration && item.duration > 0
      ? Math.min((item.timestamp / item.duration) * 100, 100)
      : null

  const subtitle =
    isContinue && item.season != null
      ? `S${item.season} E${item.episode}`
      : null

  return (
    <Link to={`/${mediaType}/${tmdbId}`} className="group flex-shrink-0 w-28 md:w-36">
      <div className="relative rounded-lg overflow-hidden bg-surface aspect-[2/3]">
        {posterUrl ? (
          <img
            src={posterUrl}
            alt={title}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-surface-2 p-2">
            <span className="text-gray-500 text-xs text-center leading-tight">{title}</span>
          </div>
        )}

        {/* Hover overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/50 transition-colors">
          <Play
            className="w-9 h-9 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg"
            fill="currentColor"
          />
        </div>

        {/* Continue watching progress bar */}
        {progress !== null && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-700/80">
            <div
              className="h-full bg-accent transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}

        {/* Type badge (search results) */}
        {!isContinue && (
          <span className={`absolute top-1.5 left-1.5 text-[9px] font-bold uppercase tracking-wide px-1 py-0.5 rounded ${
            mediaType === 'movie'
              ? 'bg-accent/90 text-white'
              : 'bg-blue-600/90 text-white'
          }`}>
            {mediaType === 'movie' ? 'Movie' : 'TV'}
          </span>
        )}
      </div>

      <div className="mt-1.5 space-y-0.5">
        <p className="text-xs text-gray-200 truncate leading-tight">{title}</p>
        {subtitle && <p className="text-[10px] text-gray-500">{subtitle}</p>}
      </div>
    </Link>
  )
}
