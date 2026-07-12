import { Search, X } from 'lucide-react';

export default function SearchBar({ value, onChange, placeholder = 'Search...' }) {
  return (
    <div className="relative flex-1 min-w-[200px]">
      <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="input-base pl-9 pr-8"
      />
      {value && (
        <button
          onClick={() => onChange('')}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-text"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}
