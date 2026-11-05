// Shared by the homepage and the public /api/work-status route.
const arr = (x) => (Array.isArray(x) ? x : []);
const num = (x) => (Number.isFinite(Number(x)) && Number(x) > 0 ? Number(x) : 0);
const str = (x, n = 200) => String(x == null ? '' : x).slice(0, n);

export function normalizeWork(w) {
  w = w || {};
  const items = arr(w.items).map((x) => {
    const jobs = arr(x.jobs)
      .map((j) => ({
        date: str(j.date, 40), type: str(j.type), llc: str(j.llc), location: str(j.location),
        revenue: num(j.revenue), completed: j.completed === true, note: str(j.note, 400),
      }))
      .filter((j) => j.type || j.llc || j.location || j.date)
      .reverse(); // newest-added first
    const auto = x.autoCount !== false && jobs.length > 0;
    const completed = auto ? jobs.filter((j) => j.completed).length : Math.floor(num(x.completed));
    const pending = auto ? jobs.filter((j) => !j.completed).length : Math.floor(num(x.pending));
    const revenue = jobs.filter((j) => j.completed).reduce((a, j) => a + j.revenue, 0);
    return { name: str(x.name, 80), note: str(x.note, 400), completed, pending, revenue, jobs };
  });
  return {
    show: w.show === true,
    showRevenue: w.showRevenue !== false,
    updatedAt: str(w.updatedAt, 80),
    refreshSeconds: Math.max(10, Math.floor(num(w.refreshSeconds)) || 30),
    items,
  };
}
