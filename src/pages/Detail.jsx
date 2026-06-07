import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Play, Star, Clock, Calendar, ChevronLeft, Loader2 } from 'lucide-react'
import { tmdb } from '../services/tmdb'
import { fetchStreams } from '../services/torrentio'
import { rd } from '../services/realdebrid'
import { sortStreams, filterByPreference, isCached } from '../utils/quality'
import { getSettings } from '../hooks/useSettings'
import { useContinueWatching } from '../hooks/useContinueWatching'
import StreamPicker from '../components/StreamPicker'

function Skeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-52 md:h-72 bg-surface-2" />
      <div className="px-4 pt-4 space-y-3">
        <div className="h-6 w-48 bg-surface-2 rounded" />
        <div className="h-4 w-32 bg-surface-2 rounded" />
        <div className="h-16 bg-surface-2 rounded" />
      </div>
    </div>
  )
}

export default function Detail({ type }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const { get: getContinue } = useContinueWatching()

  const [data, setData] = useState(null)
  const [extIds, setExtIds] = useState(null)
  const [season, setSeason] = useState(1)
  const [episode, setEpisode] = useState(1)
  const [seasonData, setSeasonData] = useState(null)
  const [resolving, setResolving] = useState(false)
  const [resolveStatus, setResolveStatus] = useState('')
  const [error, setError] = useState(null)
  const [streams, setStreams] = useState([])
  const [showPicker, setShowPicker] = useState(false)

  useEffect(() => {
    setData(null)
    setExtIds(null)
    setError(null)

    const fetchFn = type === 'movie' ? tmdb.movie : tmdb.tv
    const extFn = type === 'movie' ? tmdb.movieExternalIds : tmdb.tvExternalIds

    Promise.all([fetchFn(id), extFn(id)])
      .then(([media, ext]) => {
        setData(media)
        setExtIds(ext)
        if (type === 'tv') {
          const firstReal = media.seasons?.find(s => s.season_number > 0)
          if (firstReal) setSeason(firstReal.season_number)
        }
      })
      .catch(e => setError(e.message))
  }, [id, type])

  useEffect(() => {
    if (type !== 'tv' || !data) return
    tmdb.season(id, season).then(setSeasonData).catch(() => setSeasonData(null))
  }, [id, type, season, data])

  async function startPlayback(stream) {
    const { rdToken } = getSettings()
    setShowPicker(false)
    setResolving(true)
    setResolveStatus('Unrestricting link…')

    try {
      const url = await rd.resolveStream(stream, rdToken, (status, progress) => {
        setResolveStatus(
          status === 'downloading'
            ? `Downloading ${Math.round(progress)}%…`
            : status
        )
      })

      const continueEntry = getContinue(
        extIds.imdb_id,
        type === 'tv' ? season : null,
        type === 'tv' ? episode : null
      )

      navigate('/player', {
        state: {
          url,
          title: data.title ?? data.name,
          imdbId: extIds.imdb_id,
          tmdbId: parseInt(id, 10),
          type,
          poster: data.poster_path,
          season: type === 'tv' ? season : null,
          episode: type === 'tv' ? episode : null,
          startTime: continueEntry?.timestamp ?? 0,
        },
      })
    } catch (err) {
      setError(`Unrestrict failed: ${err.message}`)
    } finally {
      setResolving(false)
      setResolveStatus('')
    }
  }

  async function handlePlay() {
    if (!extIds?.imdb_id) {
      setError('No IMDB ID — cannot fetch streams.')
      return
    }

    setResolving(true)
    setResolveStatus('Fetching streams…')
    setError(null)

    try {
      const { rdToken, qualityPref } = getSettings()
      const rawStreams = await fetchStreams(
        type,
        extIds.imdb_id,
        type === 'tv' ? { season, episode } : {},
        rdToken
      )

      if (rawStreams.length === 0) {
        setError('No streams found for this title.')
        setResolving(false)
        setResolveStatus('')
        return
      }

      const sorted = sortStreams(filterByPreference(rawStreams, qualityPref))
      const bestCached = sorted.find(isCached)

      if (bestCached) {
        await startPlayback(bestCached)
      } else {
        setStreams(sorted)
        setShowPicker(true)
        setResolving(false)
        setResolveStatus('')
      }
    } catch (err) {
      setError(`Stream fetch failed: ${err.message}`)
      setResolving(false)
      setResolveStatus('')
    }
  }

  if (error && !data) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3 px-4 text-center">
        <p className="text-red-400 text-sm">{error}</p>
        <button onClick={() => navigate(-1)} className="text-accent text-sm underline">Go back</button>
      </div>
    )
  }

  if (!data) return <Skeleton />

  const title = data.title ?? data.name
  const year = (data.release_date ?? data.first_air_date ?? '').slice(0, 4)
  const rating = data.vote_average ? data.vote_average.toFixed(1) : null
  const runtime = data.runtime
  const genres = data.genres?.map(g => g.name).join(', ')
  const backdrop = tmdb.backdropUrl(data.backdrop_path)
  const poster = tmdb.posterUrl(data.poster_path)

  return (
    <div className="pb-24 md:pb-6 min-h-screen">
      {/* Backdrop hero — extends under status bar; back button uses safe-area offset */}
      <div className="relative h-52 md:h-80 overflow-hidden bg-surface">
        {backdrop && (
          <>
            <img src={backdrop} alt="" className="w-full h-full object-cover object-top" />
            <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/60 to-transparent" />
          </>
        )}
        <button
          onClick={() => navigate(-1)}
          style={{ top: 'calc(env(safe-area-inset-top, 0px) + 12px)' }}
          className="absolute left-4 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
      </div>

      <div className="px-4 -mt-20 relative">
        <div className="flex gap-4 items-end mb-4">
          {poster && (
            <img
              src={poster}
              alt={title}
              className="w-28 md:w-36 rounded-xl shadow-2xl flex-shrink-0 border border-gray-700/40"
            />
          )}
          <div className="pb-1 min-w-0">
            <h1 className="text-xl md:text-2xl font-bold text-white leading-snug">{title}</h1>
            <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-gray-400">
              {year && (
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />{year}
                </span>
              )}
              {rating && (
                <span className="flex items-center gap-1">
                  <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />{rating}
                </span>
              )}
              {runtime && (
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />{runtime}m
                </span>
              )}
            </div>
            {genres && <p className="text-xs text-gray-500 mt-1">{genres}</p>}
          </div>
        </div>

        {data.overview && (
          <p className="text-sm text-gray-300 leading-relaxed mb-4">{data.overview}</p>
        )}

        {/* TV season / episode selector */}
        {type === 'tv' && data.seasons && (
          <div className="flex gap-2 mb-4">
            <select
              value={season}
              onChange={e => { setSeason(Number(e.target.value)); setEpisode(1) }}
              className="flex-1 bg-surface border border-gray-700 text-white rounded-lg px-3 py-2.5 outline-none focus:border-accent"
            >
              {data.seasons
                .filter(s => s.season_number > 0)
                .map(s => (
                  <option key={s.season_number} value={s.season_number}>
                    Season {s.season_number}
                  </option>
                ))}
            </select>

            <select
              value={episode}
              onChange={e => setEpisode(Number(e.target.value))}
              className="flex-1 bg-surface border border-gray-700 text-white rounded-lg px-3 py-2.5 outline-none focus:border-accent"
            >
              {(seasonData?.episodes ?? []).map(ep => (
                <option key={ep.episode_number} value={ep.episode_number}>
                  E{ep.episode_number}: {ep.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Play button */}
        <button
          onClick={handlePlay}
          disabled={resolving}
          className="w-full flex items-center justify-center gap-2 bg-accent hover:bg-orange-600 disabled:opacity-60 text-white font-semibold py-3.5 rounded-xl transition-colors"
        >
          {resolving ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>{resolveStatus || 'Loading…'}</span>
            </>
          ) : (
            <>
              <Play className="w-5 h-5" fill="currentColor" />
              Play
            </>
          )}
        </button>

        {error && (
          <p className="mt-3 text-sm text-red-400 text-center">{error}</p>
        )}
      </div>

      {showPicker && (
        <StreamPicker
          streams={streams}
          onSelect={startPlayback}
          onClose={() => setShowPicker(false)}
        />
      )}
    </div>
  )
}
