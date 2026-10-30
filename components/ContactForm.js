'use client';
import { useState } from 'react';

export default function ContactForm({ options, buttonLabel }) {
  const [msg, setMsg] = useState(''); const [ok, setOk] = useState(false); const [busy, setBusy] = useState(false);
  async function submit(ev) {
    ev.preventDefault(); const f = ev.currentTarget; setBusy(true); setMsg('Sending...');
    const body = Object.fromEntries(new FormData(f).entries());
    try {
      const r = await fetch('/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      const j = await r.json(); setOk(!!j.ok); setMsg(j.message); if (j.ok) f.reset();
    } catch (e) { setOk(false); setMsg('Network error. Please email us directly.'); }
    setBusy(false);
  }
  return (
    <form className="c" onSubmit={submit}>
      <label>Name *</label><input name="name" required maxLength={100} />
      <label>Email *</label><input name="email" type="email" required maxLength={150} />
      <label>Comment or message</label><textarea name="message" maxLength={3000} />
      <label>Service *</label>
      <select name="service" required defaultValue=""><option value="">--- Select choice ---</option>{(options || []).map((o, i) => <option key={i}>{o}</option>)}</select>
      <input className="hp" name="website" tabIndex={-1} autoComplete="off" />
      <button className="btn" style={{ width: '100%' }} disabled={busy}>{buttonLabel}</button>
      <div id="fok" role="status" style={{ color: ok ? '#0a8a4a' : '#c0392b' }}>{msg}</div>
    </form>
  );
}
