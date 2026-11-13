'use client';
import { useEffect, useState } from 'react';

// Work Order types (grid) -> click a type -> gallery of completed-work photos -> click a photo for a large view.
const ICONS = {
  leaf: <><path d="M5 19c0-8 5-13 14-14 0 9-5 14-13 14" /><path d="M5 19c3-5 6-8 10-10" /></>,
  thermo: <path d="M10 14V5a2 2 0 014 0v9a4 4 0 11-4 0z" />,
  snow: <path d="M12 3v18M4.2 7.5l15.6 9M19.8 7.5l-15.6 9" />,
  lock: <><rect x="5" y="11" width="14" height="9" rx="2" /><path d="M8 11V8a4 4 0 018 0v3" /></>,
  trash: <path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13M10 11v5M14 11v5" />,
  layers: <path d="M12 3l9 5-9 5-9-5 9-5zM3 13l9 5 9-5" />,
  check: <path d="M5 12l4 4 10-10" />,
};
function iconFor(name) {
  const n = String(name || '').toLowerCase();
  if (/secure|lock/.test(n)) return 'lock';
  if (/winteri/.test(n)) return 'thermo';
  if (/snow/.test(n)) return 'snow';
  if (/junk|trash|debris|haul/.test(n)) return 'trash';
  if (/(lawn|sod|turf).*remov|remov.*(lawn|sod|turf)/.test(n)) return 'layers';
  if (/grass|lawn|mow|cut|trim/.test(n)) return 'leaf';
  return 'check';
}
function Icon({ name }) {
  return <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{ICONS[iconFor(name)]}</svg>;
}

export default function WorkOrders({ tag, title, hint, footerLeft, footerRight, types }) {
  const [open, setOpen] = useState(null); // index of the selected work type
  const [big, setBig] = useState(null); // index of the photo shown large
  const cur = open !== null ? types[open] : null;
  const photos = cur ? cur.photos : [];

  useEffect(() => {
    if (open === null) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') { if (big !== null) setBig(null); else setOpen(null); }
      else if (big !== null && e.key === 'ArrowRight') setBig((b) => (b + 1) % photos.length);
      else if (big !== null && e.key === 'ArrowLeft') setBig((b) => (b - 1 + photos.length) % photos.length);
    };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = prev; };
  }, [open, big, photos.length]);

  const close = () => { setBig(null); setOpen(null); };

  return (
    <>
      <div className="panel wo">
        {tag ? <span className="pill">{tag}</span> : null}
        <h3 className="wo-title">{title}</h3>
        {hint ? <p className="mut wo-hint">{hint}</p> : null}
        <div className="wo-grid">
          {types.map((t, k) => (
            <button type="button" className="wo-type" key={k} style={{ '--i': k }} onClick={() => { setBig(null); setOpen(k); }} aria-haspopup="dialog">
              <span className={'wo-vis' + (t.photos[0] ? ' has' : '')}>
                {t.photos[0] ? <img src={t.photos[0].image} alt="" loading="lazy" /> : null}
                <span className="wo-ic"><Icon name={t.name} /></span>
                {t.photos.length ? <span className="wo-badge">{t.photos.length} {t.photos.length === 1 ? 'photo' : 'photos'}</span> : null}
              </span>
              <span className="wo-info">
                <span className="wo-name">{t.name}</span>
                <span className={'wo-go' + (t.photos.length ? '' : ' soon')}>{t.photos.length ? 'View photos →' : 'Photos coming soon'}</span>
              </span>
            </button>
          ))}
        </div>
        {footerLeft || footerRight ? <div className="ok"><span>{footerLeft}</span><span>● {footerRight}</span></div> : null}
      </div>

      {cur ? (
        <div className="ws-ov" onClick={close}>
          <div className="ws-modal wo-modal" role="dialog" aria-modal="true" aria-label={cur.name + ' photos'} onClick={(e) => e.stopPropagation()}>
            <div className="ws-mh">
              <div><div className="lbl">COMPLETED WORK</div><h3>{cur.name}</h3>{cur.desc ? <p className="mut" style={{ margin: '6px 0 0', fontSize: 14 }}>{cur.desc}</p> : null}</div>
              <button type="button" className="ws-x" onClick={close} aria-label="Close">✕</button>
            </div>
            {photos.length ? (
              <div className="wo-photos">
                {photos.map((p, i) => (
                  <button type="button" key={i} className="wo-ph" onClick={() => setBig(i)} aria-label={'View photo ' + (i + 1)}>
                    <img src={p.image} alt={p.caption || cur.name + ' photo ' + (i + 1)} loading="lazy" />
                    {p.caption ? <span>{p.caption}</span> : null}
                  </button>
                ))}
              </div>
            ) : <p className="mut ws-empty">Photos for this work type will be added soon.</p>}
          </div>
        </div>
      ) : null}

      {cur && big !== null && photos[big] ? (
        <div className="wo-lb" onClick={() => setBig(null)} role="dialog" aria-modal="true" aria-label="Photo viewer">
          <button type="button" className="wo-lbx" onClick={() => setBig(null)} aria-label="Close photo">✕</button>
          {photos.length > 1 ? <button type="button" className="wo-nav l" onClick={(e) => { e.stopPropagation(); setBig((big - 1 + photos.length) % photos.length); }} aria-label="Previous photo">‹</button> : null}
          <figure onClick={(e) => e.stopPropagation()}>
            <img src={photos[big].image} alt={photos[big].caption || cur.name + ' photo ' + (big + 1)} />
            <figcaption>{photos[big].caption ? photos[big].caption + ' · ' : ''}{big + 1} / {photos.length}</figcaption>
          </figure>
          {photos.length > 1 ? <button type="button" className="wo-nav r" onClick={(e) => { e.stopPropagation(); setBig((big + 1) % photos.length); }} aria-label="Next photo">›</button> : null}
        </div>
      ) : null}
    </>
  );
}
