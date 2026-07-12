import { useForm } from 'react-hook-form';
import { useState } from 'react';

export function AllocationForm({ onSubmit, users = [], departments = [] }) {
  const [submitting, setSubmitting] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm();

  const submit = async (data) => {
    setSubmitting(true);
    try {
      const payload = {
        user_id: data.user_id ? parseInt(data.user_id) : null,
        department_id: data.department_id ? parseInt(data.department_id) : null,
        expected_return_date: data.expected_return_date || null,
      };
      await onSubmit(payload);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="label-base">Assign to Employee</label>
          <select {...register('user_id')} className="input-base">
            <option value="">None / Shared</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label-base">Assign to Department</label>
          <select {...register('department_id')} className="input-base">
            <option value="">None / Personal</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
        </div>
      </div>
      <div>
        <label className="label-base">Expected Return Date</label>
        <input type="date" {...register('expected_return_date')} className="input-base text-sm" />
      </div>
      <button type="submit" disabled={submitting} className="btn-primary w-fit cursor-pointer">
        {submitting ? 'Allocating…' : 'Allocate Asset'}
      </button>
    </form>
  );
}

export function TransferForm({ onSubmit, currentHolder, departments = [] }) {
  const [submitting, setSubmitting] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm();

  const submit = async (data) => {
    setSubmitting(true);
    try {
      const payload = {
        target_department_id: parseInt(data.target_department_id),
        note: data.note || ''
      };
      await onSubmit(payload);
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
          <label className="label-base">Transfer To Department</label>
          <select {...register('target_department_id', { required: 'Select a department' })} className="input-base">
            {departments.map((d) => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
          {errors.target_department_id && <p className="mt-1 text-xs text-danger">{errors.target_department_id.message}</p>}
        </div>
      </div>
      <div>
        <label className="label-base">Transfer Notes / Reason</label>
        <textarea {...register('note', { required: 'A reason is required' })} rows={3} className="input-base resize-none" placeholder="Reason for transfer request..." />
        {errors.note && <p className="mt-1 text-xs text-danger">{errors.note.message}</p>}
      </div>
      <button type="submit" disabled={submitting} className="btn-primary cursor-pointer">
        {submitting ? 'Submitting…' : 'Submit Transfer Request'}
      </button>
    </form>
  );
}
