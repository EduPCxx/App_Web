import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { FiArrowLeft, FiArrowRight } from 'react-icons/fi';

/**
 * @param {{ title: string, entities: Array<{_id: string, name: string, images?: Array<{url: string, is_primary?: boolean}>}>, filter: 'category'|'brand' }} props
 */
export default function EntityCarousel({ title, entities, filter }) {
  const trackRef = useRef(null);

  const scroll = (direction) => {
    const track = trackRef.current;
    if (!track) return;
    track.scrollBy({ left: direction * track.clientWidth * 0.8, behavior: 'smooth' });
  };

  if (!entities.length) return null;

  return (
    <section aria-label={`Explorar ${title.toLowerCase()}`}>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[hsl(var(--gold))]">Encuentra lo que buscas</p>
          <h2 className="mt-1 text-2xl font-bold">{title}</h2>
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={() => scroll(-1)} aria-label={`Ver ${title.toLowerCase()} anteriores`} className="grid h-10 w-10 place-items-center rounded-full border border-white/10 hover:border-[hsl(var(--gold))]">
            <FiArrowLeft aria-hidden="true" />
          </button>
          <button type="button" onClick={() => scroll(1)} aria-label={`Ver ${title.toLowerCase()} siguientes`} className="grid h-10 w-10 place-items-center rounded-full border border-white/10 hover:border-[hsl(var(--gold))]">
            <FiArrowRight aria-hidden="true" />
          </button>
        </div>
      </div>
      <div ref={trackRef} className="grid auto-cols-[minmax(190px,1fr)] grid-flow-col gap-4 overflow-x-auto scroll-smooth pb-3 [scrollbar-width:thin]">
        {entities.map((entity) => {
          const image = entity.images?.find((item) => item.is_primary)?.url || entity.images?.[0]?.url;
          const query = new URLSearchParams({ [filter]: entity._id });
          return (
            <Link
              key={entity._id}
              to={`/shop?${query.toString()}`}
              className="group overflow-hidden rounded-2xl border border-white/10 bg-[#121213] hover:border-[hsl(var(--gold)/0.55)]"
            >
              <div className="grid aspect-[16/9] place-items-center overflow-hidden bg-[#1a1a1b]">
                {image ? (
                  <img src={image} alt="" loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]" />
                ) : (
                  <span className="text-3xl font-bold tracking-widest text-[hsl(var(--gold)/0.8)]" aria-hidden="true">
                    {entity.name.slice(0, 2).toUpperCase()}
                  </span>
                )}
              </div>
              <div className="flex items-center justify-between gap-3 p-4">
                <h3 className="font-semibold">{entity.name}</h3>
                <FiArrowRight className="shrink-0 text-[hsl(var(--gold))] transition-transform group-hover:translate-x-1" aria-hidden="true" />
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
