import { Inbox } from 'lucide-react';

export default function EmptyState({ message = 'Nothing here yet', hint, icon: Icon = Inbox, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-center">
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-white/5">
        <Icon size={22} className="text-text-secondary" />
      </div>
      <p className="text-sm font-medium text-text">{message}</p>
      {hint && <p className="mt-1 max-w-xs text-xs text-text-secondary">{hint}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
