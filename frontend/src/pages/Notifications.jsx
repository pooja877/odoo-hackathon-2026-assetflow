import { useState, useMemo, useEffect } from 'react';
import { CheckCheck } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import FilterBar from '../components/FilterBar';
import NotificationCard from '../components/NotificationCard';
import EmptyState from '../components/EmptyState';
import { useToast } from '../components/Toast';
import notificationService from '../services/notificationService';

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
  const [items, setItems] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const data = await notificationService.getNotifications();
      setItems(data);
    } catch (err) {
      showToast('Failed to load notifications.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadLogs = async () => {
    try {
      const data = await notificationService.getActivityLogs();
      setLogs(data);
    } catch (err) {
      showToast('Failed to load activity logs.', 'error');
    }
  };

  useEffect(() => {
    if (tab === 'notifications') {
      loadNotifications();
    } else {
      loadLogs();
    }
  }, [tab]);

  const filtered = useMemo(() => {
    return items.filter((n) => !filters.type || n.type === filters.type);
  }, [items, filters]);

  const markAllRead = async () => {
    // Optimistic UI update
    setItems((prev) => prev.map((n) => ({ ...n, unread: false })));
    try {
      await notificationService.markAllAsRead();
      showToast('All notifications marked as read.', 'success');
    } catch (err) {
      showToast('Failed to mark all read on server.', 'error');
      loadNotifications();
    }
  };

  const handleClick = async (n) => {
    setItems((prev) => prev.map((i) => (i.id === n.id ? { ...i, unread: false } : i)));
    try {
      await notificationService.markAsRead(n.id);
    } catch (err) {
      console.warn('Failed to mark read on server', err);
    }
  };

  return (
    <div>
      <PageHeader
        title="Notifications"
        subtitle="Stay on top of approvals, bookings, and system alerts."
        actions={
          tab === 'notifications' && (
            <button onClick={markAllRead} className="btn-secondary cursor-pointer">
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
            className={`rounded-md px-3.5 py-1.5 text-sm font-medium transition-colors cursor-pointer ${
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

          {loading ? (
            <div className="flex justify-center p-12">
              <span className="w-8 h-8 border-2 border-purple-200 border-t-purple-600 rounded-full animate-spin"></span>
            </div>
          ) : filtered.length > 0 ? (
            <div className="space-y-3">
              {filtered.map((n) => (
                <NotificationCard key={n.id} notification={n} onClick={() => handleClick(n)} />
              ))}
            </div>
          ) : (
            <EmptyState title="All caught up!" message="You have no notifications in this category." />
          )}
        </>
      ) : (
        <div className="surface-card p-5">
          <h3 className="mb-4 text-sm font-semibold text-text">Activity Logs</h3>
          <div className="space-y-4">
            {logs.map((log) => (
              <div key={log.id} className="flex items-start justify-between border-b border-border/60 pb-3 last:border-0 last:pb-0">
                <div>
                  <p className="text-sm text-text font-medium">{log.text}</p>
                  <p className="mt-0.5 text-xs text-text-secondary">
                    Performed by: <span className="font-semibold text-text">{log.user || 'System'}</span>
                  </p>
                </div>
                <span className="text-xs text-text-secondary">{log.created_at || log.time}</span>
              </div>
            ))}
            {logs.length === 0 && (
              <p className="text-xs text-gray-500 py-4 text-center">No logs generated yet.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
