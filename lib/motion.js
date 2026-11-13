// Scroll reveal, hero stat counters and card spotlight. Plain DOM code, started from components/MotionEffects.js.
const REVEAL = [
  'main section .lbl', 'main section h2', 'main section .sub', 'main section .card', '.about-intro', '.about-note', '.group-heading',
  '#how .grid>div', 'main section details', 'form.c', '.ws-total>div', '.platform-caption',
].join(',');

export function initMotion() {
  const cleanups = [];
  const timers = [];
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Soft spotlight that follows the pointer on cards (mouse devices only).
  if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    const onMove = (e) => {
      const c = e.target && e.target.closest ? e.target.closest('.card') : null;
      if (!c) return;
      const r = c.getBoundingClientRect();
      c.style.setProperty('--mx', e.clientX - r.left + 'px');
      c.style.setProperty('--my', e.clientY - r.top + 'px');
    };
    document.addEventListener('pointermove', onMove, { passive: true });
    cleanups.push(() => document.removeEventListener('pointermove', onMove));
  }

  if (reduce) return () => cleanups.forEach((f) => f());

  // Count-up for numbers in the hero stats (for example "24" in "24/7"); text without a number (QC, BPO) stays as is.
  document.querySelectorAll('.stats b').forEach((el) => {
    const orig = el.dataset.orig || el.textContent;
    el.dataset.orig = orig;
    const m = orig.match(/\d+(?:\.\d+)?/);
    if (!m || parseFloat(m[0]) < 2) return;
    const n = parseFloat(m[0]);
    const dec = (m[0].split('.')[1] || '').length;
    const pre = orig.slice(0, m.index), post = orig.slice(m.index + m[0].length);
    const show = (v) => { el.textContent = pre + v.toFixed(dec) + post; };
    show(0);
    const t = setTimeout(() => {
      const t0 = performance.now(), dur = 1300;
      const step = (now) => {
        const p = Math.min(1, (now - t0) / dur);
        show(n * (1 - Math.pow(1 - p, 3)));
        if (p < 1) el._raf = requestAnimationFrame(step); else el.textContent = orig;
      };
      el._raf = requestAnimationFrame(step);
    }, 650);
    timers.push(t);
    cleanups.push(() => { cancelAnimationFrame(el._raf); el.textContent = orig; });
  });

  // Fade-up on scroll for things that start below the fold; they return to their normal styles once revealed.
  const items = [...document.querySelectorAll(REVEAL)].filter((el) => el.getBoundingClientRect().top > window.innerHeight * 0.95);
  if (items.length && 'IntersectionObserver' in window) {
    document.documentElement.classList.add('js-motion');
    const seen = new Map();
    items.forEach((el) => {
      const k = seen.get(el.parentElement) || 0;
      seen.set(el.parentElement, k + 1);
      el.style.setProperty('--d', Math.min(k, 5) * 90 + 'ms');
      el.classList.add('rv');
    });
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (!en.isIntersecting) return;
        const el = en.target;
        io.unobserve(el);
        el.classList.add('in');
        const wait = 900 + (parseInt(el.style.getPropertyValue('--d'), 10) || 0);
        timers.push(setTimeout(() => { el.classList.remove('rv', 'in'); el.style.removeProperty('--d'); }, wait));
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    items.forEach((el) => io.observe(el));
    cleanups.push(() => { io.disconnect(); items.forEach((el) => el.classList.remove('rv', 'in')); document.documentElement.classList.remove('js-motion'); });
  }

  return () => { timers.forEach(clearTimeout); cleanups.forEach((f) => f()); };
}
