const BASE = 'https://torrentio.strem.fun';

const DEFAULT_PROVIDERS = 'yts,eztv,rarbg,1337x,thepiratebay,kickasstorrents,cinemaZ,magnetdl';

function buildConfig(rdToken) {
  const parts = [`providers=${DEFAULT_PROVIDERS}`];
  if (rdToken) parts.push(`realdebrid=${rdToken}`);
  return parts.join('|');
}

export async function fetchStreams(type, imdbId, { season, episode } = {}, rdToken = '') {
  const config = buildConfig(rdToken);
  const streamType = type === 'tv' ? 'series' : 'movie';
  const streamId = type === 'tv' ? `${imdbId}:${season}:${episode}` : imdbId;
  const url = `${BASE}/${config}/stream/${streamType}/${streamId}.json`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`Torrentio error ${res.status}`);
  const data = await res.json();
  return data.streams || [];
}
