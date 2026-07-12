import { Bell, CheckCircle2, CalendarClock, AlertTriangle } from 'lucide-react';
import clsx from 'clsx';

const TYPE_ICON = {
  Alerts: AlertTriangle,
  Approvals: CheckCircle2,
  Bookings: CalendarClock,
};

const TYPE_TONE = {
  Alerts: { bg: 'bg-danger-bg', text: 'text-danger' },
  Approvals: { bg: 'bg-success-bg', text: 'text-success' },
  Bookings: { bg: 'bg-brand/10', text: 'text-brand-light' },
};

export default function NotificationCard({ notification, onClick }) {
  const Icon = TYPE_ICON[notification.type] || Bell;
  const tone = TYPE_TONE[notification.type] || { bg: 'bg-white/5', text: 'text-text-secondary' };

  return (
    <button
      onClick={() => onClick && onClick(notification)}
      className={clsx(
        'flex w-full items-start gap-3 rounded-xl border px-4 py-3.5 text-left transition-colors',
        notification.unread
          ? 'border-brand/30 bg-brand/[0.04] hover:bg-brand/[0.07]'
          : 'border-border bg-bg-card hover:bg-white/[0.03]'
      )}
    >
      <div className={clsx('flex h-9 w-9 shrink-0 items-center justify-center rounded-lg', tone.bg)}>
        <Icon size={16} className={tone.text} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <p className="truncate text-sm font-medium text-text">{notification.title}</p>
          {notification.unread && <span className="h-2 w-2 shrink-0 rounded-full bg-brand" />}
        </div>
        <p className="mt-0.5 truncate text-sm text-text-secondary">{notification.text}</p>
        <p className="mt-1 text-xs text-gray-500">{notification.time}</p>
      </div>
    </button>
  );
}
