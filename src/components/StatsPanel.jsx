import { Flame, Home, Timer, TrendingUp } from 'lucide-react';
import { useMemo, useState } from 'react';

const StatCard = ({ label, value, icon: Icon, tone = 'primary' }) => (
  <div className="flex items-center justify-between rounded-2xl border border-border bg-card p-4 shadow-sm">
    <div>
      <p className="text-sm text-muted">{label}</p>
      <p className="text-3xl font-bold">{value}</p>
    </div>
    <div
      className={`flex h-11 w-11 items-center justify-center rounded-xl ${
        tone === 'primary' ? 'bg-primary/15 text-primary' : 'bg-accent/15 text-accent'
      }`}
    >
      <Icon size={18} />
    </div>
  </div>
);

function StatsPanel({ data }) {
  const [range, setRange] = useState(7);
  const [hoverPoint, setHoverPoint] = useState(null);

  const chartWidth = 240;
  const chartHeight = 120;

  const flatDays = useMemo(() => {
    if (!data?.heatmap) return [];
    const all = data.heatmap.flat();
    return all.slice(-30); // keep last 30 days max
  }, [data]);

  const visibleDays = useMemo(() => {
    if (!flatDays.length) return [];
    const sliced = flatDays.slice(-range);
    return sliced.map((d) => ({
      date: d.date,
      value: d.value,
      label: new Date(d.date).toLocaleDateString('tr-TR', { month: 'short', day: 'numeric' }),
    }));
  }, [flatDays, range]);

  const areaShape = useMemo(() => {
    if (!visibleDays.length) return null;
    const maxVal = Math.max(...visibleDays.map((d) => d.value), 1);
    const stepX = visibleDays.length > 1 ? chartWidth / (visibleDays.length - 1) : chartWidth;
    const points = visibleDays.map((day, idx) => {
      const x = Math.round(idx * stepX * 10) / 10;
      const y = chartHeight - 10 - (day.value / maxVal) * 80;
      return {
        x,
        y,
        label: day.label,
        value: day.value,
        date: day.date,
        xPct: (x / chartWidth) * 100,
        yPct: (y / (chartHeight + 15)) * 100,
      };
    });
    const linePath = `M ${points.map((p) => `${p.x},${p.y}`).join(' L ')}`;
    const areaPath = `${linePath} L ${chartWidth},${chartHeight} L 0,${chartHeight} Z`;
    return { linePath, areaPath, points };
  }, [visibleDays, chartHeight, chartWidth]);

  const todayDone = data?.todayTasks?.filter((t) => t.completed).length ?? 0;

  return (
    <div className="space-y-6">
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Mevcut Seri" value={`${data?.stats.currentStreak ?? '--'} gün`} icon={Flame} />
        <StatCard label="En Uzun Seri" value={`${data?.stats.longestStreak ?? '--'} gün`} icon={TrendingUp} />
        <StatCard label="Toplam Tamamlanan" value={data?.stats.totalCompletions ?? '--'} icon={Home} tone="accent" />
        <StatCard label="Bugün Tamamlanan" value={todayDone} icon={Timer} tone="accent" />
      </section>

      <section className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="rounded-2xl border border-border bg-card p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm text-primary/80">Son {range} Gün</p>
              <h3 className="text-xl font-semibold">Görev Grafiği</h3>
            </div>
            <div className="flex items-center gap-2 text-xs">
              {[7, 21, 30].map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRange(r)}
                  className={`rounded-full border px-3 py-1 transition ${
                    range === r ? 'border-primary bg-primary/15 text-primary' : 'border-border text-muted hover:border-primary'
                  }`}
                >
                  Son {r}g
                </button>
              ))}
            </div>
          </div>
          <div className="mt-6 h-[320px] rounded-2xl border border-border/60 bg-card-deep/50 p-4 relative">
            {areaShape ? (
              <svg viewBox={`0 0 ${chartWidth} ${chartHeight + 20}`} className="h-full w-full">
                <defs>
                  <linearGradient id="areaGradientStats" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="rgb(var(--color-primary))" stopOpacity="0.35" />
                    <stop offset="100%" stopColor="rgb(var(--color-primary))" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path d={areaShape.areaPath} fill="url(#areaGradientStats)" stroke="none" />
                <path d={areaShape.linePath} fill="none" stroke="rgb(var(--color-primary))" strokeWidth="1.8" />
                {areaShape.points.map((p, idx) => (
                  <g key={`pt-${idx}`}>
                    <circle
                      cx={p.x}
                      cy={p.y}
                      r="1.8"
                      fill="rgb(var(--color-accent))"
                      stroke="rgb(var(--color-primary))"
                      strokeWidth="0.5"
                      onMouseEnter={() =>
                        setHoverPoint({
                          xPct: p.xPct,
                          yPct: p.yPct,
                          label: p.label,
                          value: p.value,
                        })
                      }
                      onMouseLeave={() => setHoverPoint(null)}
                    />
                  </g>
                ))}
                {areaShape.points.map((p, idx) => {
                  const step = Math.max(1, Math.ceil(areaShape.points.length / 6));
                  if (idx !== 0 && idx !== areaShape.points.length - 1 && idx % step !== 0) return null;
                  return (
                    <text
                      key={`lbl-${idx}`}
                      x={p.x}
                      y={chartHeight + 12}
                      textAnchor="middle"
                      className="fill-muted text-[6px]"
                    >
                      {p.label}
                    </text>
                  );
                })}
              </svg>
            ) : (
              <p className="text-sm text-muted">Veri yok.</p>
            )}
            {hoverPoint && (
              <div
                className="pointer-events-none absolute z-10 rounded-xl border border-border bg-card px-3 py-2 text-xs shadow-lg"
                style={{
                  left: `${hoverPoint.xPct}%`,
                  top: `${hoverPoint.yPct}%`,
                  transform: 'translate(-50%, -110%)',
                }}
              >
                <p className="font-semibold text-foreground">{hoverPoint.label}</p>
                <p className="text-muted">Tamamlanan: {hoverPoint.value}</p>
              </div>
            )}
          </div>
          <div className="mt-3 flex justify-between text-xs text-muted">
            <span>Eski</span>
            <span>Yeni</span>
          </div>
        </div>

        <div className="space-y-4 rounded-2xl border border-border bg-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-primary/80">Dağılım</p>
              <h3 className="text-xl font-semibold">Kategori Özet</h3>
            </div>
          </div>
          <div className="space-y-3 text-sm text-muted">
            {data?.habits?.slice(0, 6).map((habit) => (
              <div key={habit.id} className="flex items-center gap-3 rounded-xl border border-border/60 bg-card-deep/60 p-3">
                <div className="h-2 w-2 rounded-full" style={{ backgroundColor: habit.color || '#34d399' }} />
                <div className="flex-1">
                  <p className="text-foreground">{habit.name}</p>
                  <p className="text-xs text-muted">{habit.category ?? 'Genel'}</p>
                </div>
                <span className="rounded-full bg-foreground/10 px-2 py-1 text-xs font-semibold text-muted">
                  Hedef {habit.targetPerDay ?? 1}/gün
                </span>
              </div>
            ))}
            {!data?.habits?.length && <p className="text-sm text-muted">Henüz alışkanlık yok.</p>}
          </div>
        </div>
      </section>
    </div>
  );
}

export default StatsPanel;
