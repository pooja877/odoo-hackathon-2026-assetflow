import * as Icons from 'lucide-react';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';
import clsx from 'clsx';

const TONE_STYLES = {
  brand: { bg: 'bg-brand/10', text: 'text-brand-light' },
  success: { bg: 'bg-success-bg', text: 'text-success' },
  warning: { bg: 'bg-warning-bg', text: 'text-warning' },
  danger: { bg: 'bg-danger-bg', text: 'text-danger' },
};

function TrendIcon({ trend }) {
  if (trend === 'up') return <ArrowUpRight size={13} />;
  if (trend === 'down') return <ArrowDownRight size={13} />;
  return <Minus size={13} />;
}

export function KPICard({ label, value, delta, trend, icon, tone = 'brand' }) {
  const Icon = Icons[icon] || Icons.Activity;
  const style = TONE_STYLES[tone];
  const trendColor =
    trend === 'up' ? 'text-success' : trend === 'down' ? 'text-danger' : 'text-text-secondary';

  return (
    <div className="surface-card group p-5 transition-all hover:border-gray-500/60">
      <div className="flex items-start justify-between">
        <div className={clsx('flex h-10 w-10 items-center justify-center rounded-lg', style.bg)}>
          <Icon size={19} className={style.text} />
        </div>
        <div className={clsx('flex items-center gap-0.5 text-xs font-medium', trendColor)}>
          <TrendIcon trend={trend} />
          {delta}
        </div>
      </div>
      <p className="mt-4 text-2xl font-semibold tracking-tight text-text">{value}</p>
      <p className="mt-1 text-sm text-text-secondary">{label}</p>
    </div>
  );
}

export default function DashboardCards({ kpis }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {kpis.map((kpi) => (
        <KPICard key={kpi.key} {...kpi} />
      ))}
    </div>
  );
}
