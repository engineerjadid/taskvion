'use client';
import { useState } from 'react';

export default function Header({ brandName, brandSub, logoIcon, nav, btn }) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);
  return (
    <header className={open ? 'open' : ''}>
      <div className="w">
        <a className="brand" href="#top" onClick={close}>
          {logoIcon ? <img src={logoIcon} alt="" /> : null}
          <span><b>{brandName}</b><small>{String(brandSub || '').toUpperCase()}</small></span>
        </a>
        <nav className={open ? 'show' : ''}>
          {nav.map((n, i) => <a key={i} href={n.href} onClick={close}>{n.label}</a>)}
          <a className="btn navcta" href={btn.href} onClick={close}>{btn.label}</a>
        </nav>
        <a className="btn hcta" href={btn.href}>{btn.label}</a>
        <button type="button" className={'burger' + (open ? ' on' : '')} aria-label="Menu" aria-expanded={open} onClick={() => setOpen(!open)}>
          <span /><span /><span />
        </button>
      </div>
    </header>
  );
}
