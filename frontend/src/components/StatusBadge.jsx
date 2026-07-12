import clsx from 'clsx';

const TONES = {
  Available: 'bg-success-bg text-success ring-1 ring-inset ring-success/30',
  Verified: 'bg-success-bg text-success ring-1 ring-inset ring-success/30',
  Active: 'bg-success-bg text-success ring-1 ring-inset ring-success/30',
  Resolved: 'bg-success-bg text-success ring-1 ring-inset ring-success/30',
  Completed: 'bg-success-bg text-success ring-1 ring-inset ring-success/30',

  Allocated: 'bg-brand/10 text-brand-light ring-1 ring-inset ring-brand/30',
  Ongoing: 'bg-brand/10 text-brand-light ring-1 ring-inset ring-brand/30',
  Upcoming: 'bg-brand/10 text-brand-light ring-1 ring-inset ring-brand/30',
  'In Progress': 'bg-brand/10 text-brand-light ring-1 ring-inset ring-brand/30',

  Maintenance: 'bg-warning-bg text-warning ring-1 ring-inset ring-warning/30',
  Pending: 'bg-warning-bg text-warning ring-1 ring-inset ring-warning/30',
  Approved: 'bg-warning-bg text-warning ring-1 ring-inset ring-warning/30',

  Lost: 'bg-danger-bg text-danger ring-1 ring-inset ring-danger/30',
  Missing: 'bg-danger-bg text-danger ring-1 ring-inset ring-danger/30',
  Damaged: 'bg-danger-bg text-danger ring-1 ring-inset ring-danger/30',
  Conflict: 'bg-danger-bg text-danger ring-1 ring-inset ring-danger/30',
  Inactive: 'bg-danger-bg text-danger ring-1 ring-inset ring-danger/30',
};

export default function StatusBadge({ status }) {
  const tone = TONES[status] || 'bg-gray-500/10 text-gray-300 ring-1 ring-inset ring-gray-500/30';
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium whitespace-nowrap',
        tone
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {status}
    </span>
  );
}
