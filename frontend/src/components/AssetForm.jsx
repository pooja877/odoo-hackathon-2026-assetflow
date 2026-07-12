import { useForm } from 'react-hook-form';
import { useState } from 'react';

const CATEGORY_OPTIONS = ['Electronics', 'Furniture', 'Vehicles', 'Tools & Equipment'];
const DEPARTMENT_OPTIONS = ['Engineering', 'Facilities', 'Field Ops', 'IT', 'Sales'];
const STATUS_OPTIONS = ['Available', 'Allocated', 'Maintenance', 'Lost'];

export default function AssetForm({ defaultValues, onSubmit, onCancel }) {
  const [submitting, setSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ defaultValues: defaultValues || { status: 'Available' } });

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
          <label className="label-base">Asset Tag</label>
          <input
            {...register('tag', { required: 'Asset tag is required' })}
            className="input-base"
            placeholder="AF-0001"
          />
          {errors.tag && <p className="mt-1 text-xs text-danger">{errors.tag.message}</p>}
        </div>
        <div>
          <label className="label-base">Asset Name</label>
          <input
            {...register('name', { required: 'Name is required' })}
            className="input-base"
            placeholder="Dell Latitude 5440"
          />
          {errors.name && <p className="mt-1 text-xs text-danger">{errors.name.message}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="label-base">Category</label>
          <select {...register('category', { required: true })} className="input-base">
            {CATEGORY_OPTIONS.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label-base">Status</label>
          <select {...register('status', { required: true })} className="input-base">
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="label-base">Department</label>
          <select {...register('department')} className="input-base">
            <option value="">Unassigned</option>
            {DEPARTMENT_OPTIONS.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label-base">Location</label>
          <input {...register('location')} className="input-base" placeholder="Bengaluru HQ" />
        </div>
      </div>

      <div>
        <label className="label-base">Notes</label>
        <textarea {...register('notes')} rows={3} className="input-base resize-none" placeholder="Optional notes about this asset" />
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <button type="button" onClick={onCancel} className="btn-secondary">
          Cancel
        </button>
        <button type="submit" disabled={submitting} className="btn-primary">
          {submitting ? 'Saving…' : 'Save Asset'}
        </button>
      </div>
    </form>
  );
}
