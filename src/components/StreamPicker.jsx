import { X, Zap, Magnet } from 'lucide-react'
import { streamLabel } from '../utils/quality'

const QUALITY_STYLE = {
  '4K': 'bg-purple-900/80 text-purple-200',
  '1080p': 'bg-blue-900/80 text-blue-200',
  '720p': 'bg-gray-700 text-gray-300',
  'SD': 'bg-gray-800 text-gray-400',
}

export default function StreamPicker({ streams = [], onSelect, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4 bg-black/70 backdrop-blur-sm">
      <div className="w-full md:max-w-lg bg-gray-900 md:rounded-2xl overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800">
          <h2 className="font-semibold text-white">Choose Stream</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-y-auto max-h-[70vh]">
          {streams.length === 0 ? (
            <p className="text-center text-gray-500 py-10 text-sm">No streams found</p>
          ) : (
            streams.map((stream, i) => {
              const { quality, cached, sourceName, fileInfo } = streamLabel(stream)
              return (
                <button
                  key={i}
                  onClick={() => onSelect(stream)}
                  className="w-full flex items-start gap-3 px-4 py-3 hover:bg-white/5 transition-colors border-b border-gray-800/60 last:border-0 text-left"
                >
                  <div className="mt-0.5 flex-shrink-0">
                    {cached
                      ? <Zap className="w-4 h-4 text-accent" />
                      : <Magnet className="w-4 h-4 text-gray-500" />
                    }
                  </div>
                  <div className="flex-1 min-w-0 space-y-0.5">
                    <div className="flex items-center flex-wrap gap-1.5">
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${QUALITY_STYLE[quality]}`}>
                        {quality}
                      </span>
                      {cached && (
                        <span className="text-[10px] font-semibold text-accent">RD Cached</span>
                      )}
                      <span className="text-sm text-gray-200 truncate">{sourceName}</span>
                    </div>
                    {fileInfo && (
                      <p className="text-xs text-gray-500 truncate">{fileInfo}</p>
                    )}
                  </div>
                </button>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
