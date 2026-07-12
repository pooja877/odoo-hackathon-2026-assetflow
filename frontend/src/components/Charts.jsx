import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

const TOOLTIP_STYLE = {
  backgroundColor: '#1F2937',
  border: '1px solid #374151',
  borderRadius: '10px',
  fontSize: '13px',
  color: '#F9FAFB',
  boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
};

const PIE_COLORS = ['#3B82F6', '#22C55E', '#F59E0B', '#EF4444', '#8B5CF6'];

export function UtilizationChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} barSize={28}>
        <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
        <XAxis dataKey="name" stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={{ stroke: '#374151' }} />
        <YAxis stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false} unit="%" />
        <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ fill: 'rgba(59,130,246,0.06)' }} />
        <Bar dataKey="utilization" fill="#3B82F6" radius={[6, 6, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function MaintenanceFrequencyChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
        <XAxis dataKey="month" stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={{ stroke: '#374151' }} />
        <YAxis stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false} />
        <Tooltip contentStyle={TOOLTIP_STYLE} />
        <Line
          type="monotone"
          dataKey="tickets"
          stroke="#F59E0B"
          strokeWidth={2.5}
          dot={{ fill: '#F59E0B', r: 3.5 }}
          activeDot={{ r: 5 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function DepartmentAllocationChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          innerRadius={60}
          outerRadius={95}
          paddingAngle={3}
        >
          {data.map((_, i) => (
            <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} stroke="none" />
          ))}
        </Pie>
        <Tooltip contentStyle={TOOLTIP_STYLE} />
        <Legend
          verticalAlign="bottom"
          iconType="circle"
          wrapperStyle={{ fontSize: 12, color: '#9CA3AF' }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}

export function BookingHeatmap({ data }) {
  const slots = ['9am', '11am', '1pm', '3pm', '5pm'];
  const max = Math.max(...data.flatMap((row) => slots.map((s) => row[s])));

  const intensity = (val) => {
    const ratio = val / max;
    if (ratio > 0.8) return 'bg-brand';
    if (ratio > 0.55) return 'bg-brand/70';
    if (ratio > 0.3) return 'bg-brand/40';
    if (ratio > 0) return 'bg-brand/20';
    return 'bg-white/5';
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[420px] border-separate border-spacing-1.5 text-xs">
        <thead>
          <tr>
            <th className="w-14"></th>
            {slots.map((s) => (
              <th key={s} className="pb-1 text-center font-medium text-text-secondary">
                {s}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr key={row.day}>
              <td className="pr-2 text-right font-medium text-text-secondary">{row.day}</td>
              {slots.map((s) => (
                <td key={s} className="p-0">
                  <div
                    className={`flex h-9 w-full items-center justify-center rounded-md text-[11px] font-medium text-white transition-colors ${intensity(row[s])}`}
                    title={`${row[s]} bookings`}
                  >
                    {row[s]}
                  </div>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
