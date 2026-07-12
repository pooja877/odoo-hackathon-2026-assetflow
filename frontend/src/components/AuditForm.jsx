import { useForm } from 'react-hook-form';
import { useState } from 'react';

export default function AuditForm({ onSubmit, onCancel }) {
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
        <label className="label-base">Department</label>
        <input {...register('department', { required: true })} className="input-base" placeholder="Engineering" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label-base">Start Date</label>
          <input type="date" {...register('start', { required: true })} className="input-base" />
        </div>
        <div>
          <label className="label-base">End Date</label>
          <input type="date" {...register('end', { required: true })} className="input-base" />
        </div>
      </div>
      <div>
        <label className="label-base">Auditors</label>
        <input {...register('auditors', { required: 'Add at least one auditor' })} className="input-base" placeholder="A. Rao, S. Iqbal" />
        {errors.auditors && <p className="mt-1 text-xs text-danger">{errors.auditors.message}</p>}
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <button type="button" onClick={onCancel} className="btn-secondary">Cancel</button>
        <button type="submit" disabled={submitting} className="btn-primary">
          {submitting ? 'Starting…' : 'Start Audit Cycle'}
        </button>
      </div>
    </form>
  );
}
