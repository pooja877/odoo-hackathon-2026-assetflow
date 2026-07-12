import { useForm } from 'react-hook-form';
import { useState } from 'react';

export default function MaintenanceForm({ onSubmit, onCancel }) {
  const [submitting, setSubmitting] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm({ defaultValues: { priority: 'Medium' } });

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
        <input {...register('asset', { required: 'Select an asset' })} className="input-base" placeholder="AF-0062 — Projector" />
        {errors.asset && <p className="mt-1 text-xs text-danger">{errors.asset.message}</p>}
      </div>
      <div>
        <label className="label-base">Issue Description</label>
        <textarea {...register('issue', { required: 'Describe the issue' })} rows={3} className="input-base resize-none" placeholder="What's wrong with this asset?" />
        {errors.issue && <p className="mt-1 text-xs text-danger">{errors.issue.message}</p>}
      </div>
      <div>
        <label className="label-base">Priority</label>
        <select {...register('priority')} className="input-base">
          <option>Low</option>
          <option>Medium</option>
          <option>High</option>
        </select>
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <button type="button" onClick={onCancel} className="btn-secondary">Cancel</button>
        <button type="submit" disabled={submitting} className="btn-primary">
          {submitting ? 'Raising…' : 'Raise Request'}
        </button>
      </div>
    </form>
  );
}
