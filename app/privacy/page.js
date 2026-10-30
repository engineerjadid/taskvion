import { notFound } from 'next/navigation';
import { getContent } from '../../lib/store';

export const dynamic = 'force-dynamic';

export async function generateMetadata() {
  const c = await getContent();
  const p = c.privacy || {};
  const brand = (c.settings && c.settings.brandName) || 'TaskVion';
  return { title: p.title || 'Privacy Policy', description: 'How ' + brand + ' collects, uses and protects your information.', alternates: { canonical: '/privacy' } };
}

function Body({ text }) {
  const lines = String(text || '').split('\n').map((l) => l.trim()).filter(Boolean);
  const out = []; let list = [];
  const flush = () => { if (list.length) { out.push(<ul key={'u' + out.length}>{list.map((x, i) => <li key={i}>{x}</li>)}</ul>); list = []; } };
  lines.forEach((l) => { if (l.startsWith('- ')) list.push(l.slice(2)); else { flush(); out.push(<p key={'p' + out.length}>{l}</p>); } });
  flush();
  return out;
}

export default async function Privacy() {
  const c = await getContent();
  const p = c.privacy;
  if (!p || !p.show) notFound();
  const s = c.settings || {};
  return (
    <>
      <header><div className="w">
        <a className="brand" href="/">
          {s.logoIcon ? <img src={s.logoIcon} alt="" /> : null}
          <span><b>{s.brandName}</b><small>{String(s.brandSub || '').toUpperCase()}</small></span>
        </a>
        <a className="btn" href="/" style={{ marginLeft: 'auto' }}>← Back to home</a>
      </div></header>
      <main className="doc">
        <h1>{p.title}</h1>
        {p.lastUpdated ? <p className="upd">Last updated: {p.lastUpdated}</p> : null}
        {p.intro ? <p>{p.intro}</p> : null}
        {(p.sections || []).map((x, i) => (<section key={i} style={{ padding: 0 }}><h2>{x.heading}</h2><Body text={x.body} /></section>))}
        <h2>Contact us</h2>
        <p>{s.email ? <>Email: <a href={'mailto:' + s.email} style={{ color: 'var(--p)' }}>{s.email}</a></> : null}{s.address ? <><br />{s.address}</> : null}</p>
      </main>
      <footer><div className="w"><div className="cp" style={{ border: 0, margin: 0, padding: 0 }}>© {new Date().getFullYear()} {s.copyright} · <a href="/">Home</a></div></div></footer>
    </>
  );
}
