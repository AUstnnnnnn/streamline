import PosterCard from './PosterCard'

export default function PosterRow({ title, items = [], type, isContinue = false }) {
  if (!items.length) return null

  return (
    <section className="py-3">
      <h2 className="px-4 mb-2.5 text-sm font-semibold text-gray-300 uppercase tracking-wider">
        {title}
      </h2>
      <div className="flex gap-3 overflow-x-auto px-4 pb-2 scrollbar-hide">
        {items.map((item, i) => (
          <PosterCard
            key={item.imdbId ?? item.id ?? i}
            item={item}
            type={type ?? item.media_type ?? item.type}
            isContinue={isContinue}
          />
        ))}
      </div>
    </section>
  )
}
