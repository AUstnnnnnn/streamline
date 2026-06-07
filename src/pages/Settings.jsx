import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Eye, EyeOff, Trash2, CheckCircle, ChevronLeft } from 'lucide-react'
import { useSettings } from '../hooks/useSettings'

export default function Settings() {
  const navigate = useNavigate()
  const location = useLocation()
  const { tmdbKey, rdToken, qualityPref, save, clear } = useSettings()

  const [form, setForm] = useState({ tmdbKey, rdToken, qualityPref })
  const [showTmdb, setShowTmdb] = useState(false)
  const [showRd, setShowRd] = useState(false)
  const [saved, setSaved] = useState(false)

  const isFirstRun = !tmdbKey || !rdToken
  const canSave = form.tmdbKey.trim() && form.rdToken.trim()

  function handleSave() {
    save(form)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
    const from = location.state?.from?.pathname
    if (from && from !== '/settings') {
      navigate(from, { replace: true })
    } else if (canSave) {
      navigate('/', { replace: true })
    }
  }

  function handleClear() {
    if (!window.confirm('Clear all settings and API keys?')) return
    clear()
    setForm({ tmdbKey: '', rdToken: '', qualityPref: 'auto' })
  }

  function field(label, hint, key, show, setShow) {
    return (
      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-gray-300">{label}</label>
        {hint && <p className="text-xs text-gray-500">{hint}</p>}
        <div className="relative">
          <input
            type={show ? 'text' : 'password'}
            value={form[key]}
            onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
            className="w-full bg-surface border border-gray-700 focus:border-accent rounded-lg px-4 py-3 pr-11 text-white text-sm placeholder-gray-600 outline-none transition-colors"
            placeholder={`Your ${label}`}
            autoComplete="off"
            spellCheck={false}
          />
          <button
            type="button"
            onClick={() => setShow(v => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
          >
            {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <header className="flex items-center gap-3 px-4 py-4 border-b border-gray-800">
        {!isFirstRun && (
          <button
            onClick={() => navigate(-1)}
            className="p-1 text-gray-400 hover:text-white transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        )}
        <h1 className="text-lg font-bold text-accent">
          {isFirstRun ? 'Welcome to Streamline' : 'Settings'}
        </h1>
      </header>

      <div className="max-w-md mx-auto px-4 py-6 space-y-6">
        {isFirstRun && (
          <div className="rounded-xl bg-amber-950/40 border border-amber-800/40 p-4 text-sm text-amber-300/90 leading-relaxed">
            Enter your API keys below to get started. Both are required and stored locally on your device.
          </div>
        )}

        {field(
          'TMDB API Key',
          'Free at themoviedb.org → Settings → API',
          'tmdbKey',
          showTmdb,
          setShowTmdb
        )}

        {field(
          'Real-Debrid API Token',
          'Find at real-debrid.com/apitoken',
          'rdToken',
          showRd,
          setShowRd
        )}

        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-gray-300">Quality Preference</label>
          <div className="grid grid-cols-3 gap-2">
            {['auto', '4K', '1080p'].map(q => (
              <button
                key={q}
                onClick={() => setForm(f => ({ ...f, qualityPref: q }))}
                className={`py-2.5 rounded-lg text-sm font-medium border transition-colors ${
                  form.qualityPref === q
                    ? 'bg-accent border-accent text-white'
                    : 'border-gray-700 text-gray-400 hover:border-gray-500 hover:text-gray-200'
                }`}
              >
                {q === 'auto' ? 'Auto (Best)' : q}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={!canSave}
          className="w-full flex items-center justify-center gap-2 bg-accent hover:bg-orange-600 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition-colors"
        >
          {saved
            ? <><CheckCircle className="w-4 h-4" /> Saved</>
            : isFirstRun ? 'Get Started' : 'Save Settings'
          }
        </button>

        {!isFirstRun && (
          <button
            onClick={handleClear}
            className="w-full flex items-center justify-center gap-2 py-3 text-sm text-red-400 hover:text-red-300 border border-red-900/50 hover:border-red-700/60 rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Clear All Settings
          </button>
        )}
      </div>
    </div>
  )
}
