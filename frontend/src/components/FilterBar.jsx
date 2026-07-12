import { ChevronDown, SlidersHorizontal } from 'lucide-react';

export default function FilterBar({ filters, values, onChange }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="hidden items-center gap-1.5 text-xs font-medium text-text-secondary sm:flex">
        <SlidersHorizontal size={14} />
        Filters
      </div>
      {filters.map((filter) => (
        <div key={filter.key} className="relative">
          <select
            value={values[filter.key] || ''}
            onChange={(e) => onChange(filter.key, e.target.value)}
            className="appearance-none rounded-lg border border-border bg-bg-card py-2 pl-3 pr-8 text-sm text-text-secondary transition-colors hover:border-gray-500 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/25"
          >
            <option value="">{filter.label}</option>
            {filter.options.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
          <ChevronDown size={14} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500" />
        </div>
      ))}
    </div>
  );
}
