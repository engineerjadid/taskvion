'use client';
import { useEffect, useState } from 'react';

const list = (v) => Array.isArray(v) ? v : [];
export default function WorkOrders({ data }) {
  const categories = list(data?.categories).filter((c) => c && c.name);
  const [active, setActive] = useState(null);
  const [lightbox, setLightbox] = useState(null);
  const photos = list(active?.photos).filter((p) => p && p.image);
  useEffect(() => {
    if (!lightbox) return;
    const onKey = (e) => { if (e.key === 'Escape') setLightbox(null); };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = ''; };
  }, [lightbox]);
  return <section id="work-orders" className="portfolio-section" aria-label="Completed work order portfolio">
    <div className="w">
      <div className="lbl">{data.label || 'OUR COMPLETED WORK'}</div>
      <h2>{data.title || 'Work Order'} <em>{data.titleAccent || 'Portfolio'}</em></h2>
      {data.subtitle ? <p className="mut sub">{data.subtitle}</p> : null}
      {!active ? <div className="portfolio-grid">
        {categories.map((category, i) => <button className="portfolio-category" key={category.id || category.name} onClick={() => setActive(category)}>
          <div className="portfolio-cover">{category.photoCover || category.photos?.[0]?.image ? <img src={category.photoCover || category.photos[0].image} alt={category.name + ' project'} loading="lazy" /> : <div className="portfolio-placeholder"><span>TV</span></div>}<span className="portfolio-count">{list(category.photos).length} Photos</span></div>
          <div className="portfolio-cat-text"><span className="num">WORK TYPE / {String(i + 1).padStart(2, '0')}</span><h3>{category.name}</h3>{category.description ? <p>{category.description}</p> : null}<span className="portfolio-link">View projects <b>→</b></span></div>
        </button>)}
      </div> : <div className="portfolio-gallery-wrap">
        <div className="portfolio-gallery-head"><div><button className="portfolio-back" onClick={() => setActive(null)}>← All work types</button><h3>{active.name}</h3>{active.description ? <p className="mut">{active.description}</p> : null}</div><span className="portfolio-count-inline">{photos.length} {photos.length === 1 ? 'Photo' : 'Photos'}</span></div>
        {photos.length ? <div className="portfolio-photos">{photos.map((photo, i) => <button className="portfolio-photo" key={photo.id || photo.image || i} onClick={() => setLightbox(photo)} aria-label={'View ' + (photo.alt || active.name + ' photo')}><img src={photo.image} alt={photo.alt || active.name + ' completed work'} loading="lazy" />{photo.caption ? <span>{photo.caption}</span> : null}</button>)}</div> : <div className="portfolio-empty">Project photos will be added soon.</div>}
      </div>}
    </div>
    {lightbox ? <div className="portfolio-lightbox" role="dialog" aria-modal="true" aria-label="Project photo viewer" onClick={() => setLightbox(null)}><button className="portfolio-lightbox-close" onClick={() => setLightbox(null)} aria-label="Close photo">×</button><img src={lightbox.image} alt={lightbox.alt || active?.name || 'Completed project'} onClick={(e) => e.stopPropagation()} />{lightbox.caption ? <p>{lightbox.caption}</p> : null}</div> : null}
  </section>;
}
