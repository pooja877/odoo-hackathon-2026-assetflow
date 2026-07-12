import { useState } from 'react';
import { AlertTriangle, MapPin } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';
import BookingForm from '../components/BookingForm';
import { useToast } from '../components/Toast';
import { resources, bookingsList } from '../data/dummyData';

const TIME_SLOTS = ['8:00', '9:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00'];

export default function ResourceBooking() {
  const [selectedResource, setSelectedResource] = useState(resources[0]);
  const [modalOpen, setModalOpen] = useState(false);
  const { showToast } = useToast();

  const resourceBookings = bookingsList.filter((b) => b.resource === selectedResource.name);
  const hasConflict = resourceBookings.some((b) => b.status === 'Conflict');

  const handleBook = async () => {
    await new Promise((r) => setTimeout(r, 600));
    showToast('Resource booked successfully.', 'success');
    setModalOpen(false);
  };

  const timeToRow = (t) => {
    const [h, m] = t.split(':').map(Number);
    return (h - 8) * 2 + (m >= 30 ? 1 : 0) + 1;
  };

  return (
    <div>
      <PageHeader
        title="Resource Booking"
        subtitle="Reserve rooms, vehicles, and equipment without double-booking."
        actions={
          <button onClick={() => setModalOpen(true)} className="btn-primary">Book a Slot</button>
        }
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
        {/* Left: Resource list */}
        <div className="surface-card p-4 lg:col-span-1">
          <h3 className="mb-3 px-1 text-sm font-semibold text-text">Resources</h3>
          <div className="space-y-1.5">
            {resources.map((r) => (
              <button
                key={r.id}
                onClick={() => setSelectedResource(r)}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors ${
                  selectedResource.id === r.id ? 'bg-brand/10 text-brand-light' : 'text-text-secondary hover:bg-white/5 hover:text-text'
                }`}
              >
                <MapPin size={15} className="shrink-0" />
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{r.name}</p>
                  <p className="truncate text-xs opacity-70">{r.type} · {r.location}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Right: Calendar / timeline */}
        <div className="surface-card p-5 lg:col-span-3">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-text">{selectedResource.name} — Today's Schedule</h3>
            {hasConflict && (
              <span className="flex items-center gap-1.5 text-xs font-medium text-danger">
                <AlertTriangle size={13} /> Overlap detected
              </span>
            )}
          </div>

          {hasConflict && (
            <div className="mb-4 flex items-start gap-3 rounded-xl border border-danger/30 bg-danger-bg px-4 py-3">
              <AlertTriangle size={17} className="mt-0.5 shrink-0 text-danger" />
              <p className="text-sm text-danger">
                A requested booking (9:30–10:30) conflicts with an existing reservation. This slot is unavailable — choose a different time.
              </p>
            </div>
          )}

          <div className="relative grid grid-cols-[56px_1fr] gap-2">
            <div className="space-y-0">
              {TIME_SLOTS.map((t) => (
                <div key={t} className="flex h-14 items-start text-xs text-text-secondary">{t}</div>
              ))}
            </div>
            <div className="relative rounded-lg border border-border bg-bg-surface">
              {TIME_SLOTS.map((t, i) => (
                <div key={t} className={`h-14 ${i !== 0 ? 'border-t border-border/60' : ''}`} />
              ))}
              {resourceBookings.map((b) => {
                const start = timeToRow(b.start);
                const end = timeToRow(b.end);
                const height = (end - start) * 28 || 28;
                const isConflict = b.status === 'Conflict';
                return (
                  <div
                    key={b.id}
                    style={{ top: `${(start - 1) * 28}px`, height: `${height}px` }}
                    className={`absolute left-2 right-2 rounded-lg px-3 py-1.5 text-xs font-medium ${
                      isConflict
                        ? 'border border-dashed border-danger bg-danger-bg text-danger'
                        : 'bg-brand/90 text-white'
                    }`}
                  >
                    {isConflict ? 'Requested — ' : 'Booked — '}
                    {b.bookedBy} · {b.start}–{b.end}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Booking status lists */}
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {['Upcoming', 'Ongoing', 'Completed'].map((status) => (
          <div key={status} className="surface-card p-5">
            <h4 className="mb-3 text-sm font-semibold text-text">{status}</h4>
            <div className="space-y-2.5">
              {bookingsList.filter((b) => b.status === status).map((b) => (
                <div key={b.id} className="flex items-center justify-between rounded-lg border border-border bg-bg-surface px-3 py-2.5">
                  <div className="min-w-0">
                    <p className="truncate text-sm text-text">{b.resource}</p>
                    <p className="text-xs text-text-secondary">{b.bookedBy} · {b.start}–{b.end}</p>
                  </div>
                  <StatusBadge status={b.status} />
                </div>
              ))}
              {bookingsList.filter((b) => b.status === status).length === 0 && (
                <p className="text-xs text-gray-500">No {status.toLowerCase()} bookings.</p>
              )}
            </div>
          </div>
        ))}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Book a Resource">
        <BookingForm resource={selectedResource.name} onSubmit={handleBook} onCancel={() => setModalOpen(false)} />
      </Modal>
    </div>
  );
}
