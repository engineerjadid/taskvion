'use client';
import { useEffect, useState } from 'react';

// Work Order types (grid) -> click a type -> gallery of completed-work photos -> click a photo for a large view.
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
            <button type="button" className="wo-type" key={k} onClick={() => { setBig(null); setOpen(k); }} aria-haspopup="dialog">
              <span className="wo-thumb">{t.photos[0] ? <img src={t.photos[0].image} alt="" loading="lazy" /> : <i aria-hidden="true">✓</i>}</span>
              <span className="wo-name">{t.name}</span>
              <span className="wo-count">{t.photos.length ? t.photos.length + (t.photos.length === 1 ? ' photo' : ' photos') : 'Photos soon'}</span>
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
