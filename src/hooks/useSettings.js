import { useState, useCallback } from 'react';

export const STORAGE_KEYS = {
  tmdbKey: 'sl_tmdb_key',
  rdToken: 'sl_rd_token',
  qualityPref: 'sl_quality_pref',
};

export function getSettings() {
  return {
    tmdbKey: localStorage.getItem(STORAGE_KEYS.tmdbKey) || '',
    rdToken: localStorage.getItem(STORAGE_KEYS.rdToken) || '',
    qualityPref: localStorage.getItem(STORAGE_KEYS.qualityPref) || 'auto',
  };
}

export function useSettings() {
  const [settings, setSettings] = useState(getSettings);

  const save = useCallback((updates) => {
    Object.entries(updates).forEach(([k, v]) => {
      const storageKey = STORAGE_KEYS[k];
      if (storageKey) localStorage.setItem(storageKey, v);
    });
    setSettings(getSettings());
  }, []);

  const clear = useCallback(() => {
    Object.values(STORAGE_KEYS).forEach(k => localStorage.removeItem(k));
    setSettings({ tmdbKey: '', rdToken: '', qualityPref: 'auto' });
  }, []);

  return { ...settings, save, clear };
}
