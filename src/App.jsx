import { HashRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Search from './pages/Search'
import Detail from './pages/Detail'
import Settings from './pages/Settings'
import Player from './pages/Player'

function RequireSettings({ children }) {
  const location = useLocation()
  const tmdbKey = localStorage.getItem('sl_tmdb_key')
  const rdToken = localStorage.getItem('sl_rd_token')

  if (!tmdbKey || !rdToken) {
    return <Navigate to="/settings" state={{ from: location }} replace />
  }
  return children
}

function Shell({ children }) {
  return (
    <div className="min-h-screen bg-gray-950">
      <Navbar />
      {children}
    </div>
  )
}

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/settings" element={<Settings />} />

        <Route
          path="/player"
          element={
            <RequireSettings>
              <Player />
            </RequireSettings>
          }
        />

        <Route
          path="/"
          element={
            <RequireSettings>
              <Shell><Home /></Shell>
            </RequireSettings>
          }
        />
        <Route
          path="/search"
          element={
            <RequireSettings>
              <Shell><Search /></Shell>
            </RequireSettings>
          }
        />
        <Route
          path="/movie/:id"
          element={
            <RequireSettings>
              <Shell><Detail type="movie" /></Shell>
            </RequireSettings>
          }
        />
        <Route
          path="/tv/:id"
          element={
            <RequireSettings>
              <Shell><Detail type="tv" /></Shell>
            </RequireSettings>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  )
}
