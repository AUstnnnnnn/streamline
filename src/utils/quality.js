export const QUALITY_ORDER = ['4K', '1080p', '720p', 'SD'];

export function detectQuality(stream) {
  const text = `${stream.name ?? ''} ${stream.title ?? ''}`;
  if (/2160p|4[Kk]|\bUHD\b/i.test(text)) return '4K';
  if (/1080p/i.test(text)) return '1080p';
  if (/720p/i.test(text)) return '720p';
  return 'SD';
}

function qualityRank(q) {
  return { '4K': 4, '1080p': 3, '720p': 2, 'SD': 1 }[q] ?? 0;
}

export function isCached(stream) {
  return Boolean(stream.url);
}

export function sortStreams(streams) {
  return [...streams].sort((a, b) => {
    const cachedDiff = Number(isCached(b)) - Number(isCached(a));
    if (cachedDiff !== 0) return cachedDiff;
    return qualityRank(detectQuality(b)) - qualityRank(detectQuality(a));
  });
}

export function filterByPreference(streams, pref = 'auto') {
  if (pref === 'auto') return streams;
  const filtered = streams.filter(s => detectQuality(s) === pref);
  return filtered.length > 0 ? filtered : streams;
}

export function streamLabel(stream) {
  const quality = detectQuality(stream);
  const cached = isCached(stream);
  const sourceName = (stream.name ?? '').split('\n')[0];
  const fileInfo = (stream.title ?? '').split('\n')[0];
  return { quality, cached, sourceName, fileInfo };
}
