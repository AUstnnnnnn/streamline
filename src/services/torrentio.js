const BASE = 'https://torrentio.strem.fun';

// rarbg excluded — shut down May 2023
const DEFAULT_PROVIDERS = 'yts,eztv,1337x,thepiratebay,kickasstorrents,cinemaZ,magnetdl';

function buildConfig(rdToken) {
  const parts = [`providers=${DEFAULT_PROVIDERS}`];
  if (rdToken) parts.push(`realdebrid=${encodeURIComponent(rdToken)}`);
  // iOS Safari rejects literal | in URL paths (RFC 3986 violation); use %7C
  return parts.join('%7C');
}

export async function fetchStreams(type, imdbId, { season, episode } = {}, rdToken = '') {
  const config = buildConfig(rdToken);
  const streamType = type === 'tv' ? 'series' : 'movie';
  const streamId = type === 'tv' ? `${imdbId}:${season}:${episode}` : imdbId;
  const url = `${BASE}/${config}/stream/${streamType}/${streamId}.json`;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 20000);

  let res;
  try {
    res = await fetch(url, { signal: controller.signal });
  } catch (e) {
    if (e.name === 'AbortError') throw new Error('Torrentio timed out (20s)');
    throw new Error(`Torrentio unreachable: ${e.message}`);
  } finally {
    clearTimeout(timer);
  }

  if (!res.ok) throw new Error(`Torrentio returned ${res.status}`);

  let data;
  try {
    data = await res.json();
  } catch {
    throw new Error('Torrentio returned invalid JSON');
  }

  return data.streams ?? [];
}
