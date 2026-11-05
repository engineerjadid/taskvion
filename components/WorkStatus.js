'use client';
import { useEffect, useState } from 'react';

const num = (x) => (Number.isFinite(Number(x)) && Number(x) > 0 ? Math.floor(Number(x)) : 0);

export default function WorkStatus({ initialItems, initialUpdatedAt, refreshSeconds }) {
  const [items, setItems] = useState(initialItems || []);
  const [updatedAt, setUpdatedAt] = useState(initialUpdatedAt || '');

  useEffect(() => {
    const every = Math.max(10, num(refreshSeconds) || 30) * 1000;
    let stop = false;
    async function load() {
      if (document.hidden) return;
      try {
        const r = await fetch('/api/work-status', { cache: 'no-store' });
        if (!r.ok) return;
        const j = await r.json();
        if (!stop && j && j.show && Array.isArray(j.items)) { setItems(j.items); setUpdatedAt(j.updatedAt || ''); }
      } catch { /* keep showing last data */ }
    }
    const t = setInterval(load, every);
    document.addEventListener('visibilitychange', load);
    return () => { stop = true; clearInterval(t); document.removeEventListener('visibilitychange', load); };
  }, [refreshSeconds]);

  const done = items.reduce((a, x) => a + num(x.completed), 0);
  const left = items.reduce((a, x) => a + num(x.pending), 0);
  const all = done + left;

  return (
    <>
      <div className="ws-total">
        <div><b>{done}</b><span>Completed</span></div>
        <div><b>{left}</b><span>Pending</span></div>
        <div><b>{all ? Math.round((done / all) * 100) : 0}%</b><span>Overall progress</span></div>
      </div>
      <div className="grid ws-grid">
        {items.map((x, k) => {
          const c = num(x.completed), p = num(x.pending), t = c + p, pct = t ? Math.round((c / t) * 100) : 0;
          return (
            <div className="card ws-card" key={k}>
              <h3>{x.name}</h3>
              <div className="ws-nums">
                <div><b className="ws-done">{c}</b><span>Completed</span></div>
                <div><b className="ws-pend">{p}</b><span>Pending</span></div>
              </div>
              <div className="ws-bar" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct} aria-label={x.name + ' progress'}><i style={{ width: pct + '%' }} /></div>
              <div className="ws-pct">{pct}% complete</div>
              {x.note ? <p className="mut ws-note">{x.note}</p> : null}
            </div>
          );
        })}
      </div>
      <p className="ws-live"><span className="ws-dot" />Live{updatedAt ? ' · Last updated: ' + updatedAt : ''}</p>
    </>
  );
}
