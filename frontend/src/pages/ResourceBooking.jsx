import { useState, useEffect } from 'react';
import { AlertTriangle, MapPin, Calendar, Trash2, Clock, User } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';
import BookingForm from '../components/BookingForm';
import { useToast } from '../components/Toast';
import bookingService from '../services/bookingService';
import authService from '../services/authService';

const TIME_SLOTS = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00'];

export default function ResourceBooking() {
  const [resources, setResources] = useState([]);
  const [selectedResource, setSelectedResource] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const { showToast } = useToast();

  const currentUser = authService.getCurrentUser();

  // Load resources on mount
  useEffect(() => {
    const loadResources = async () => {
      try {
        const data = await bookingService.getResources();
        setResources(data);
        if (data.length > 0) {
          setSelectedResource(data[0]);
        }
      } catch (err) {
        showToast('Failed to load resources', 'error');
      }
    };
    loadResources();
  }, []);

  // Load bookings when selected resource changes
  const loadBookings = async () => {
    if (!selectedResource) return;
    setLoading(true);
    try {
      const data = await bookingService.getBookings({ resource_id: selectedResource.id });
      setBookings(data);
    } catch (err) {
      showToast('Failed to load schedule', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, [selectedResource]);

  const handleBook = async (formData) => {
    if (!selectedResource) return;
    try {
      // Create local ISO datetime strings for today
      const todayStr = new Date().toISOString().split('T')[0];
      const startDateTime = `${todayStr}T${formData.start}:00`;
      const endDateTime = `${todayStr}T${formData.end}:00`;

      await bookingService.createBooking({
        resource_id: selectedResource.id,
        start_time: startDateTime,
        end_time: endDateTime,
      });

      showToast('Resource slot booked successfully.', 'success');
      setModalOpen(false);
      loadBookings();
    } catch (err) {
      showToast(err.message || 'Overlap conflict detected. Booking rejected.', 'error');
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
    try {
      await bookingService.cancelBooking(bookingId);
      showToast('Booking cancelled.', 'success');
      loadBookings();
    } catch (err) {
      showToast(err.message || 'Failed to cancel booking', 'error');
    }
  };

  const formatTime = (isoString) => {
    try {
      const date = new Date(isoString);
      const h = String(date.getHours()).padStart(2, '0');
      const m = String(date.getMinutes()).padStart(2, '0');
      return `${h}:${m}`;
    } catch (e) {
      return '00:00';
    }
  };

  const timeToRow = (timeStr) => {
    try {
      const [h, m] = timeStr.split(':').map(Number);
      // Timeline starts at 8:00 AM (row 1 is 8:00)
      return (h - 8) * 2 + (m >= 30 ? 1 : 0) + 1;
    } catch (e) {
      return 1;
    }
  };

  // Filter bookings for the timeline (not cancelled)
  const resourceBookings = selectedResource
    ? bookings.filter((b) => b.resource_id === selectedResource.id && b.status !== 'Cancelled')
    : [];

  return (
    <div>
      <PageHeader
        title="Resource Booking"
        subtitle="Reserve rooms, vehicles, and equipment without double-booking."
        actions={
          selectedResource && (
            <button onClick={() => setModalOpen(true)} className="btn-primary cursor-pointer">
              Book a Slot
            </button>
          )
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
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors cursor-pointer ${
                  selectedResource?.id === r.id
                    ? 'bg-brand/10 text-brand-light'
                    : 'text-text-secondary hover:bg-white/5 hover:text-text'
                }`}
              >
                <MapPin size={15} className="shrink-0 text-brand-light" />
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{r.name}</p>
                  <p className="truncate text-xs opacity-70">
                    {r.type} · {r.location || 'HQ'}
                  </p>
                </div>
              </button>
            ))}

            {resources.length === 0 && (
              <p className="text-xs text-gray-500 p-2">No shared resources configured.</p>
            )}
          </div>
        </div>

        {/* Right: Calendar / timeline */}
        <div className="surface-card p-5 lg:col-span-3">
          {selectedResource ? (
            <>
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-text">
                  {selectedResource.name} — Today's Schedule
                </h3>
              </div>

              {loading ? (
                <div className="flex justify-center p-12">
                  <span className="w-8 h-8 border-2 border-purple-200 border-t-purple-600 rounded-full animate-spin"></span>
                </div>
              ) : (
                <div className="relative grid grid-cols-[56px_1fr] gap-2">
                  <div className="space-y-0">
                    {TIME_SLOTS.map((t) => (
                      <div key={t} className="flex h-14 items-start text-xs text-text-secondary">
                        {t}
                      </div>
                    ))}
                  </div>
                  <div className="relative rounded-lg border border-border bg-bg-surface">
                    {TIME_SLOTS.map((t, i) => (
                      <div key={t} className={`h-14 ${i !== 0 ? 'border-t border-border/60' : ''}`} />
                    ))}
                    {resourceBookings.map((b) => {
                      const startTimeStr = formatTime(b.start_time);
                      const endTimeStr = formatTime(b.end_time);
                      const start = timeToRow(startTimeStr);
                      const end = timeToRow(endTimeStr);
                      const height = (end - start) * 28 || 28;

                      return (
                        <div
                          key={b.id}
                          style={{ top: `${(start - 1) * 28}px`, height: `${height}px` }}
                          className="absolute left-2 right-2 rounded-lg px-3 py-1 bg-brand/90 text-white font-semibold text-xs flex flex-col justify-center overflow-hidden hover:scale-[1.01] transition-transform"
                        >
                          <div className="flex items-center justify-between">
                            <span>
                              {b.booked_by} • {startTimeStr} – {endTimeStr}
                            </span>
                            {(b.user_id === currentUser?.id || currentUser?.role === 'Admin') && (
                              <button
                                onClick={() => handleCancelBooking(b.id)}
                                className="hover:text-red-300 text-white cursor-pointer"
                                title="Cancel booking"
                              >
                                <Trash2 size={12} />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12 text-slate-500 font-semibold text-sm">
              Please select a resource to view its timeline.
            </div>
          )}
        </div>
      </div>

      {/* Booking list overview */}
      <div className="mt-6 surface-card p-5">
        <h4 className="mb-4 text-sm font-semibold text-text">Active Resource Bookings</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {bookings
            .filter((b) => b.status !== 'Cancelled')
            .map((b) => (
              <div
                key={b.id}
                className="flex flex-col justify-between p-4 rounded-xl border border-border bg-bg-surface hover:border-brand/40 transition-colors"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <h5 className="font-bold text-sm text-text truncate">{b.resource.name}</h5>
                    <span className="text-[10px] font-bold text-brand-light bg-brand/10 px-2 py-0.5 rounded-full capitalize shrink-0">
                      {b.status}
                    </span>
                  </div>
                  <div className="space-y-1.5 text-xs text-text-secondary mt-3">
                    <p className="flex items-center gap-1.5">
                      <Clock size={13} className="text-purple-400" />
                      {formatTime(b.start_time)} – {formatTime(b.end_time)}
                    </p>
                    <p className="flex items-center gap-1.5">
                      <User size={13} className="text-purple-400" />
                      Booked by: <span className="font-semibold text-text">{b.booked_by}</span>
                    </p>
                  </div>
                </div>

                {(b.user_id === currentUser?.id || currentUser?.role === 'Admin') && (
                  <div className="mt-4 pt-3 border-t border-border/60 text-right">
                    <button
                      onClick={() => handleCancelBooking(b.id)}
                      className="text-xs font-bold text-danger hover:text-red-400 hover:underline cursor-pointer"
                    >
                      Cancel Booking
                    </button>
                  </div>
                )}
              </div>
            ))}

          {bookings.filter((b) => b.status !== 'Cancelled').length === 0 && (
            <p className="text-xs text-gray-500 col-span-full py-4 text-center">
              No active slot reservations.
            </p>
          )}
        </div>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Book a Resource">
        {selectedResource && (
          <BookingForm
            resource={selectedResource.name}
            onSubmit={handleBook}
            onCancel={() => setModalOpen(false)}
          />
        )}
      </Modal>
    </div>
  );
}
