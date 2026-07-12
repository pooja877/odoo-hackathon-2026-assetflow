import { Loader2 } from 'lucide-react';

export default function Spinner({ size = 18, label, fullPage = false }) {
  const content = (
    <div className="flex items-center justify-center gap-2 text-text-secondary">
      <Loader2 size={size} className="animate-spin text-brand" />
      {label && <span className="text-sm">{label}</span>}
    </div>
  );

  if (fullPage) {
    return <div className="flex h-full min-h-[240px] w-full items-center justify-center">{content}</div>;
  }
  return content;
}
