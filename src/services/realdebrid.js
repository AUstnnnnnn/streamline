const BASE = 'https://api.real-debrid.com/rest/1.0';

function authHeader(token) {
  return { Authorization: `Bearer ${token}` };
}

async function rdGet(path, token) {
  const res = await fetch(`${BASE}${path}`, { headers: authHeader(token) });
  if (!res.ok) throw new Error(`RD ${res.status}`);
  return res.json();
}

async function rdPost(path, body, token) {
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: {
      ...authHeader(token),
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams(body).toString(),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`RD ${res.status}: ${text}`);
  }
  const text = await res.text();
  return text ? JSON.parse(text) : {};
}

const VIDEO_EXTS = ['.mkv', '.mp4', '.avi', '.mov', '.m4v', '.ts'];

function pickVideoLink(links) {
  return (
    links.find(l => VIDEO_EXTS.some(ext => l.toLowerCase().endsWith(ext))) ||
    links[0]
  );
}

export const rd = {
  unrestrict: (link, token) => rdPost('/unrestrict/link', { link }, token),

  async addMagnet(infoHash, token) {
    const magnet = `magnet:?xt=urn:btih:${infoHash}&tr=udp://open.demonii.com:1337/announce`;
    return rdPost('/torrents/addMagnet', { magnet }, token);
  },

  getTorrentInfo: (id, token) => rdGet(`/torrents/info/${id}`, token),

  selectFiles: (id, token) => rdPost(`/torrents/selectFiles/${id}`, { files: 'all' }, token),

  async resolveStream(stream, token, onStatus) {
    if (stream.url) {
      const result = await rd.unrestrict(stream.url, token);
      return result.download;
    }

    if (stream.infoHash) {
      const added = await rd.addMagnet(stream.infoHash, token);
      await rd.selectFiles(added.id, token);

      let info;
      for (let attempt = 0; attempt < 90; attempt++) {
        info = await rd.getTorrentInfo(added.id, token);
        onStatus?.(info.status, info.progress ?? 0);

        if (info.status === 'downloaded') break;
        if (info.status === 'error' || info.status === 'dead') {
          throw new Error(`RD torrent ${info.status}`);
        }
        await new Promise(r => setTimeout(r, 3000));
      }

      if (info?.status !== 'downloaded') throw new Error('RD download timed out');

      const videoLink = pickVideoLink(info.links);
      const result = await rd.unrestrict(videoLink, token);
      return result.download;
    }

    throw new Error('Stream has no URL or infoHash');
  },
};
