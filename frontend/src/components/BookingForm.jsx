import { useForm } from 'react-hook-form';
import { useState } from 'react';

export default function BookingForm({ resource, onSubmit, onCancel }) {
  const [submitting, setSubmitting] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm();

  const submit = async (data) => {
    setSubmitting(true);
    try {
      await onSubmit(data);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-4">
      <div>
        <label className="label-base">Resource</label>
        <input value={resource} disabled className="input-base opacity-70" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label-base">Start Time</label>
          <input type="time" {...register('start', { required: true })} className="input-base" />
        </div>
        <div>
          <label className="label-base">End Time</label>
          <input type="time" {...register('end', { required: true })} className="input-base" />
        </div>
      </div>
      <div>
        <label className="label-base">Booked For</label>
        <input {...register('bookedBy', { required: 'This field is required' })} className="input-base" placeholder="Your name or team" />
        {errors.bookedBy && <p className="mt-1 text-xs text-danger">{errors.bookedBy.message}</p>}
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <button type="button" onClick={onCancel} className="btn-secondary">Cancel</button>
        <button type="submit" disabled={submitting} className="btn-primary">
          {submitting ? 'Booking…' : 'Book Slot'}
        </button>
      </div>
    </form>
  );
}
