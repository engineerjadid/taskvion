'use client';
import { useEffect, useMemo, useState } from 'react';

const usd = (n) => '$' + Number(n || 0).toLocaleString('en-US', { maximumFractionDigits: 2 });

export default function WorkStatus({ initial }) {
  const [data, setData] = useState(initial);
  const [open, setOpen] = useState(null); // index of the platform whose list is open
  const [filter, setFilter] = useState('all');
  const { items, showRevenue, updatedAt, refreshSeconds } = data;

  useEffect(() => {
    let stop = false;
    async function load() {
      if (document.hidden) return;
      try {
        const r = await fetch('/api/work-status', { cache: 'no-store' });
        if (!r.ok) return;
        const j = await r.json();
        if (!stop && j && j.show && Array.isArray(j.items)) setData(j);
      } catch { /* keep last data */ }
    }
    const t = setInterval(load, Math.max(10, refreshSeconds || 30) * 1000);
    document.addEventListener('visibilitychange', load);
    return () => { stop = true; clearInterval(t); document.removeEventListener('visibilitychange', load); };
  }, [refreshSeconds]);

  useEffect(() => {
    if (open === null) return undefined;
    const onKey = (e) => { if (e.key === 'Escape') setOpen(null); };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = prev; };
  }, [open]);

  const done = items.reduce((a, x) => a + x.completed, 0);
  const left = items.reduce((a, x) => a + x.pending, 0);
  const revenue = items.reduce((a, x) => a + x.revenue, 0);
  const all = done + left;
  const cur = open !== null ? items[open] : null;
  const jobs = useMemo(() => (cur ? cur.jobs.filter((j) => filter === 'all' || (filter === 'done' ? j.completed : !j.completed)) : []), [cur, filter]);

  return (
    <>
      <div className={'ws-total' + (showRevenue ? ' four' : '')}>
        <div><b>{done}</b><span>Completed</span></div>
        <div><b>{left}</b><span>Pending</span></div>
        <div><b>{all ? Math.round((done / all) * 100) : 0}%</b><span>Overall progress</span></div>
        {showRevenue ? <div><b>{usd(revenue)}</b><span>Revenue (completed work)</span></div> : null}
      </div>

      <div className="grid ws-grid">
        {items.map((x, k) => {
          const t = x.completed + x.pending, pct = t ? Math.round((x.completed / t) * 100) : 0;
          return (
            <button type="button" className="card ws-card" key={k} onClick={() => { setFilter('all'); setOpen(k); }} aria-haspopup="dialog">
              <h3>{x.name}</h3>
              <div className="ws-nums">
                <div><b className="ws-done">{x.completed}</b><span>Completed</span></div>
                <div><b className="ws-pend">{x.pending}</b><span>Pending</span></div>
              </div>
              <div className="ws-bar" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct} aria-label={x.name + ' progress'}><i style={{ width: pct + '%' }} /></div>
              <div className="ws-pct">{pct}% complete</div>
              {x.note ? <p className="mut ws-note">{x.note}</p> : null}
              <span className="ws-more">View work list →</span>
            </button>
          );
        })}
      </div>
      <p className="ws-live"><span className="ws-dot" />Live{updatedAt ? ' · Last updated: ' + updatedAt : ''}</p>

      {cur ? (
        <div className="ws-ov" onClick={() => setOpen(null)}>
          <div className="ws-modal" role="dialog" aria-modal="true" aria-label={cur.name + ' work list'} onClick={(e) => e.stopPropagation()}>
            <div className="ws-mh">
              <div><div className="lbl">WORK LIST</div><h3>{cur.name}</h3></div>
              <button type="button" className="ws-x" onClick={() => setOpen(null)} aria-label="Close">✕</button>
            </div>
            <div className="ws-sum">
              <span><b>{cur.completed}</b> Completed</span>
              <span><b>{cur.pending}</b> Pending</span>
              {showRevenue ? <span><b>{usd(cur.revenue)}</b> Revenue</span> : null}
            </div>
            <div className="ws-tabs" role="tablist">
              {[['all', 'All'], ['done', 'Completed'], ['pend', 'Pending']].map(([id, label]) => (
                <button key={id} type="button" role="tab" aria-selected={filter === id} className={filter === id ? 'on' : ''} onClick={() => setFilter(id)}>{label}</button>
              ))}
            </div>
            {jobs.length ? (
              <div className="ws-tw">
                <table className="ws-table">
                  <thead><tr><th>Date</th><th>Type of work</th><th>LLC</th><th>Location</th>{showRevenue ? <th className="r">Revenue</th> : null}<th>Status</th></tr></thead>
                  <tbody>
                    {jobs.map((j, i) => (
                      <tr key={i}>
                        <td data-l="Date">{j.date || '—'}</td>
                        <td data-l="Type of work">{j.type || '—'}{j.note ? <small>{j.note}</small> : null}</td>
                        <td data-l="LLC">{j.llc || '—'}</td>
                        <td data-l="Location">{j.location || '—'}</td>
                        {showRevenue ? <td data-l="Revenue" className="r">{j.revenue ? usd(j.revenue) : '—'}</td> : null}
                        <td data-l="Status"><span className={'ws-badge ' + (j.completed ? 'ok' : 'pe')}>{j.completed ? 'Completed' : 'Pending'}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : <p className="mut ws-empty">{cur.jobs.length ? 'No work in this filter.' : 'Detailed work list is not available yet.'}</p>}
          </div>
        </div>
      ) : null}
    </>
  );
}
