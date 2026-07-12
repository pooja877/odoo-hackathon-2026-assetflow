import { useForm } from 'react-hook-form';
import { useState } from 'react';

export function AllocationForm({ onSubmit }) {
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
        <label className="label-base">Asset</label>
        <input {...register('asset', { required: true })} className="input-base" placeholder="AF-0114 — Dell Laptop" />
      </div>
      <div>
        <label className="label-base">Assign To</label>
        <input {...register('employee', { required: 'Select an employee' })} className="input-base" placeholder="Select employee..." />
        {errors.employee && <p className="mt-1 text-xs text-danger">{errors.employee.message}</p>}
      </div>
      <button type="submit" disabled={submitting} className="btn-primary w-full">
        {submitting ? 'Allocating…' : 'Allocate Asset'}
      </button>
    </form>
  );
}

export function TransferForm({ onSubmit, currentHolder }) {
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
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="label-base">From</label>
          <input value={currentHolder} disabled className="input-base opacity-70" />
        </div>
        <div>
          <label className="label-base">To</label>
          <input {...register('to', { required: 'Select an employee' })} className="input-base" placeholder="Select employee..." />
          {errors.to && <p className="mt-1 text-xs text-danger">{errors.to.message}</p>}
        </div>
      </div>
      <div>
        <label className="label-base">Reason</label>
        <textarea {...register('reason', { required: 'A reason is required' })} rows={3} className="input-base resize-none" placeholder="Why is this transfer needed?" />
        {errors.reason && <p className="mt-1 text-xs text-danger">{errors.reason.message}</p>}
      </div>
      <button type="submit" disabled={submitting} className="btn-primary">
        {submitting ? 'Submitting…' : 'Submit Request'}
      </button>
    </form>
  );
}
