import EmptyState from './EmptyState';

export default function DataTable({ columns, data, onRowClick, emptyMessage = 'No records found' }) {
  if (!data || data.length === 0) {
    return (
      <div className="surface-card p-10">
        <EmptyState message={emptyMessage} />
      </div>
    );
  }

  return (
    <div className="surface-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-white/[0.02]">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-secondary"
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, idx) => (
              <tr
                key={row.id || idx}
                onClick={() => onRowClick && onRowClick(row)}
                className={`border-b border-border/60 last:border-0 transition-colors ${
                  onRowClick ? 'cursor-pointer hover:bg-white/[0.03]' : ''
                }`}
              >
                {columns.map((col) => (
                  <td key={col.key} className="whitespace-nowrap px-4 py-3.5 text-text">
                    {col.render ? col.render(row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
