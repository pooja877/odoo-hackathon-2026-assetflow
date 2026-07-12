import { useForm } from 'react-hook-form';
import { useState } from 'react';

const STATUS_OPTIONS = ['Available', 'Allocated', 'Maintenance', 'Lost'];

export default function AssetForm({ defaultValues, onSubmit, onCancel, categories = [], departments = [] }) {
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
            {...register('tag')}
            className="input-base opacity-75"
            placeholder="Auto-generated AST-XXXX"
            disabled
          />
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
            {categories.map((c) => (
              <option key={c.id} value={c.name}>{c.name}</option>
            ))}
            {categories.length === 0 && (
              ['Electronics', 'Furniture', 'Vehicles'].map(c => <option key={c} value={c}>{c}</option>)
            )}
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
            {departments.map((d) => (
              <option key={d.id} value={d.name}>{d.name}</option>
            ))}
            {departments.length === 0 && (
              ['Engineering', 'Facilities', 'Field Ops', 'IT', 'Sales'].map(d => <option key={d} value={d}>{d}</option>)
            )}
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
