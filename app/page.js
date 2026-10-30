import { getContent } from '../lib/store';
import ContactForm from '../components/ContactForm';

export const dynamic = 'force-dynamic';
const href = (u) => (/^\s*javascript:/i.test(u || '') ? '#' : u || '#');
const arr = (x) => (Array.isArray(x) ? x : []);

function Head({ sec }) {
  return (
    <>
      <div className="lbl">{sec.label}</div>
      <h2>{sec.title} <em>{sec.titleAccent}</em></h2>
      {sec.subtitle ? <p className="mut sub">{sec.subtitle}</p> : null}
    </>
  );
}
function Points({ list }) {
  return arr(list).length ? <ul>{arr(list).map((p, i) => <li key={i}>{p}</li>)}</ul> : null;
}

export default async function Home() {
  const c = await getContent();
  const s = c.settings || {}, h = c.hero || {}, ct = c.contact || {};
  const wa = String(s.whatsapp || '').replace(/\D/g, '');
  const pn = h.panel || {};
  return (
    <>
      <header><div className="w">
        <a className="brand" href="#top">
          {s.logoIcon ? <img src={s.logoIcon} alt="" /> : null}
          <span><b>{s.brandName}</b><small>{String(s.brandSub || '').toUpperCase()}</small></span>
        </a>
        <nav>{arr(c.nav).map((n, i) => <a key={i} href={href(n.href)}>{n.label}</a>)}</nav>
        <a className="btn" href={href(c.navButton && c.navButton.href)}>{c.navButton && c.navButton.label}</a>
      </div></header>

      <main id="top">
        <div className="w hero">
          <div>
            <span className="pill">● {h.badge}</span>
            <h1>{h.title} <em>{h.titleAccent}</em></h1>
            <p className="lead">{h.subtitle}</p>
            <p>
              <a className="btn" href={href(h.button1 && h.button1.href)}>{h.button1 && h.button1.label}</a>{' '}
              <a className="btn o" href={href(h.button2 && h.button2.href)}>{h.button2 && h.button2.label}</a>
            </p>
            <div className="stats">{arr(h.stats).map((x, i) => <div key={i}><b>{x.value}</b><span>{x.label}</span></div>)}</div>
          </div>
          {h.panelShow ? (
            <div className="panel">
              <span className="pill">{pn.tag}</span>
              <h3 style={{ fontWeight: 500, fontSize: 22, margin: '14px 0 6px' }}>{pn.title}</h3>
              {arr(pn.items).map((i, k) => <div className="chk" key={k}><i>✓</i><div><b>{i.title}</b><br /><span className="mut">{i.desc}</span></div></div>)}
              <div className="ok"><span>{pn.footerLeft}</span><span>● {pn.footerRight}</span></div>
            </div>
          ) : null}
        </div>

        {c.platforms && c.platforms.show && arr(c.platforms.items).length ? (
          <div className="plat"><div className="marq"><div className="track">
            {[0, 1].map((n) => (
              <div key={n} aria-hidden={n === 1}>{[0, 1, 2].map((r) => c.platforms.items.map((x, i) => <b key={r + '-' + i}>{x}</b>))}</div>
            ))}
          </div></div></div>
        ) : null}

        {c.services && c.services.show ? (
          <section id="services"><div className="w"><Head sec={c.services} /><div className="grid">
            {arr(c.services.items).map((x, k) => (
              <div className="card" key={k}><span className="num">{String(k + 1).padStart(2, '0')}</span><h3>{x.title}</h3><p className="mut">{x.desc}</p><Points list={x.points} /></div>
            ))}
          </div></div></section>
        ) : null}

        {c.steps && c.steps.show ? (
          <section id="how" style={{ paddingTop: 20 }}><div className="w"><Head sec={c.steps} /><div className="grid">
            {arr(c.steps.items).map((x, k) => (
              <div key={k}><div className="n">{k + 1}</div><h3 style={{ margin: '0 0 6px', color: 'var(--d)' }}>{x.title}</h3><p className="mut" style={{ margin: 0 }}>{x.desc}</p></div>
            ))}
          </div></div></section>
        ) : null}

        {c.why && c.why.show ? (
          <section className="dark" id="why"><div className="w"><Head sec={c.why} /><div className="grid">
            {arr(c.why.items).map((x, k) => <div className="card" key={k}><h3>{x.title}</h3><p className="mut">{x.desc}</p></div>)}
          </div></div></section>
        ) : null}

        {c.pricing && c.pricing.show ? (
          <section id="pricing"><div className="w"><Head sec={c.pricing} /><div className="grid">
            {arr(c.pricing.items).map((x, k) => (
              <div className={'card' + (x.featured ? ' feat' : '')} key={k}>
                <span className="num">{String(x.name || '').toUpperCase()}</span><div className="price">{x.price}</div><p className="mut">{x.desc}</p>
                <Points list={x.features} />
                <p style={{ marginTop: 18 }}><a className={'btn' + (x.featured ? '' : ' o')} href="#contact">{x.buttonLabel}</a></p>
              </div>
            ))}
          </div></div></section>
        ) : null}

        {c.testimonials && c.testimonials.show && arr(c.testimonials.items).length ? (
          <section id="reviews"><div className="w"><Head sec={c.testimonials} /><div className="grid">
            {c.testimonials.items.map((x, k) => (
              <div className="card" key={k}><p className="quote">“{x.text}”</p><div className="who"><b>{x.name}</b><br /><span className="mut">{x.role}</span></div></div>
            ))}
          </div></div></section>
        ) : null}

        {c.faq && c.faq.show ? (
          <section id="faq"><div className="w" style={{ maxWidth: 760 }}><Head sec={c.faq} />
            {arr(c.faq.items).map((x, k) => <details key={k}><summary>{x.q}</summary><p className="mut">{x.a}</p></details>)}
          </div></section>
        ) : null}

        <section className="dark" id="contact"><div className="w" style={{ textAlign: 'center' }}>
          <div className="lbl">{ct.label}</div>
          <h2>{ct.title} <em>{ct.titleAccent}</em></h2>
          <p className="mut">{ct.subtitle}</p>
          {s.email ? <p><a href={'mailto:' + s.email} style={{ color: '#4fb0ff', fontWeight: 700 }}>{s.email}</a></p> : null}
          <ContactForm options={arr(ct.options)} buttonLabel={ct.buttonLabel} />
        </div></section>
      </main>

      <footer><div className="w">
        <div className="fg">
          <div>
            {s.logoFull ? <img src={s.logoFull} alt={s.brandName} /> : null}
            <p>{s.footerText}</p>{s.address ? <p>{s.address}</p> : null}
          </div>
          <div><h4>Company</h4>{arr(c.nav).map((n, i) => <a key={i} href={href(n.href)}>{n.label}</a>)}</div>
          <div><h4>Connect</h4>
            {s.email ? <a href={'mailto:' + s.email}>{s.email}</a> : null}
            {s.phone ? <a href={'tel:' + s.phone}>{s.phone}</a> : null}
            {s.linkedin ? <a href={href(s.linkedin)} target="_blank" rel="noopener noreferrer">LinkedIn</a> : null}
            {s.facebook ? <a href={href(s.facebook)} target="_blank" rel="noopener noreferrer">Facebook</a> : null}
          </div>
        </div>
        <div className="cp">© {new Date().getFullYear()} {s.copyright}</div>
      </div></footer>
      {wa ? <a className="wa" href={'https://wa.me/' + wa} target="_blank" rel="noopener noreferrer">💬 <span>{s.whatsappLabel}</span></a> : null}
    </>
  );
}
