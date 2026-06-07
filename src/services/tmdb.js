const BASE = 'https://api.themoviedb.org/3';
const IMG = 'https://image.tmdb.org/t/p';

function key() {
  return localStorage.getItem('sl_tmdb_key') || '';
}

async function get(path, params = {}) {
  const url = new URL(`${BASE}${path}`);
  url.searchParams.set('api_key', key());
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`TMDB ${res.status}`);
  return res.json();
}

export const tmdb = {
  trending: (type, window = 'week') => get(`/trending/${type}/${window}`),
  search: (query, page = 1) => get('/search/multi', { query, page, include_adult: false }),
  movie: (id) => get(`/movie/${id}`),
  tv: (id) => get(`/tv/${id}`),
  season: (id, season) => get(`/tv/${id}/season/${season}`),
  movieExternalIds: (id) => get(`/movie/${id}/external_ids`),
  tvExternalIds: (id) => get(`/tv/${id}/external_ids`),

  posterUrl: (path, size = 'w342') =>
    path ? `${IMG}/${size}${path}` : null,
  backdropUrl: (path) =>
    path ? `${IMG}/original${path}` : null,
};
