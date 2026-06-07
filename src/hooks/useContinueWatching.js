const CW_KEY = 'sl_continue_watching';
const MAX_ITEMS = 20;

function load() {
  try {
    return JSON.parse(localStorage.getItem(CW_KEY) || '[]');
  } catch {
    return [];
  }
}

function store(items) {
  localStorage.setItem(CW_KEY, JSON.stringify(items));
}

export function useContinueWatching() {
  const getAll = () => load();

  const save = (entry) => {
    const existing = load().filter(e =>
      !(e.imdbId === entry.imdbId &&
        e.season === entry.season &&
        e.episode === entry.episode)
    );
    store([entry, ...existing].slice(0, MAX_ITEMS));
  };

  const remove = (imdbId) => {
    store(load().filter(e => e.imdbId !== imdbId));
  };

  const get = (imdbId, season = null, episode = null) =>
    load().find(e =>
      e.imdbId === imdbId &&
      e.season === season &&
      e.episode === episode
    ) || null;

  const clear = () => localStorage.removeItem(CW_KEY);

  return { getAll, save, remove, get, clear };
}
