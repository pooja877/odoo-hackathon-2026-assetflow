import { useState, useMemo } from 'react';
import { CheckCheck } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import FilterBar from '../components/FilterBar';
import NotificationCard from '../components/NotificationCard';
import EmptyState from '../components/EmptyState';
import { useToast } from '../components/Toast';
import { notifications as initialNotifications, activityLogs } from '../data/dummyData';

const TABS = [
  { key: 'notifications', label: 'Notifications' },
  { key: 'logs', label: 'Activity Logs' },
];

const filterConfig = [
  { key: 'type', label: 'Type', options: ['Alerts', 'Approvals', 'Bookings'] },
];

export default function Notifications() {
  const [tab, setTab] = useState('notifications');
  const [filters, setFilters] = useState({});
  const [items, setItems] = useState(initialNotifications);
  const { showToast } = useToast();

  const filtered = useMemo(() => {
    return items.filter((n) => !filters.type || n.type === filters.type);
  }, [items, filters]);

  const markAllRead = () => {
    setItems((prev) => prev.map((n) => ({ ...n, unread: false })));
    showToast('All notifications marked as read.', 'success');
  };

  const handleClick = (n) => {
    setItems((prev) => prev.map((i) => (i.id === n.id ? { ...i, unread: false } : i)));
  };

  return (
    <div>
      <PageHeader
        title="Notifications"
        subtitle="Stay on top of approvals, bookings, and system alerts."
        actions={
          tab === 'notifications' && (
            <button onClick={markAllRead} className="btn-secondary">
              <CheckCheck size={15} /> Mark all as read
            </button>
          )
        }
      />

      <div className="mb-5 flex items-center gap-1.5 rounded-lg border border-border bg-bg-surface p-1.5 w-fit">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`rounded-md px-3.5 py-1.5 text-sm font-medium transition-colors ${
              tab === t.key ? 'bg-brand text-white' : 'text-text-secondary hover:text-text'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'notifications' ? (
        <>
          <div className="mb-4">
            <FilterBar filters={filterConfig} values={filters} onChange={(k, v) => setFilters((p) => ({ ...p, [k]: v }))} />
          </div>
          {filtered.length === 0 ? (
            <div className="surface-card p-10">
              <EmptyState message="No notifications match this filter" />
            </div>
          ) : (
            <div className="space-y-2.5">
              {filtered.map((n) => (
                <NotificationCard key={n.id} notification={n} onClick={handleClick} />
              ))}
            </div>
          )}
        </>
      ) : (
        <div className="surface-card divide-y divide-border/60">
          {activityLogs.map((log) => (
            <div key={log.id} className="flex items-center justify-between px-5 py-4">
              <div>
                <p className="text-sm text-text">{log.text}</p>
                <p className="mt-0.5 text-xs text-text-secondary">by {log.user}</p>
              </div>
              <span className="text-xs text-gray-500">{log.time}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
