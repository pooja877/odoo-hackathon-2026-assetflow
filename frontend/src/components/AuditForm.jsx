import { useForm } from 'react-hook-form';
import { useState, useEffect } from 'react';
import api from '../services/api';

export default function AuditForm({ onSubmit, onCancel }) {
  const [submitting, setSubmitting] = useState(false);
  const [departments, setDepartments] = useState([]);
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      start_date: new Date().toISOString().split('T')[0],
      end_date: new Date().toISOString().split('T')[0],
    }
  });

  useEffect(() => {
    const loadDepts = async () => {
      try {
        const res = await api.get('/departments');
        setDepartments(res.data);
      } catch (err) {
        console.warn('Failed to load departments');
      }
    };
    loadDepts();
  }, []);

  const submit = async (data) => {
    setSubmitting(true);
    try {
      const payload = {
        name: data.name,
        scope_type: 'Department',
        scope_id: parseInt(data.department_id),
        start_date: data.start_date,
        end_date: data.end_date,
      };
      await onSubmit(payload);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-4">
      <div>
        <label className="label-base">Audit Cycle Name</label>
        <input {...register('name', { required: 'Name is required' })} className="input-base" placeholder="Q3 Hardware Audit" />
        {errors.name && <p className="mt-1 text-xs text-danger">{errors.name.message}</p>}
      </div>

      <div>
        <label className="label-base">Department Scope</label>
        <select {...register('department_id', { required: true })} className="input-base">
          {departments.map((d) => (
            <option key={d.id} value={d.id}>{d.name}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label-base">Start Date</label>
          <input type="date" {...register('start_date', { required: true })} className="input-base" />
        </div>
        <div>
          <label className="label-base">End Date</label>
          <input type="date" {...register('end_date', { required: true })} className="input-base" />
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <button type="button" onClick={onCancel} className="btn-secondary">Cancel</button>
        <button type="submit" disabled={submitting} className="btn-primary cursor-pointer">
          {submitting ? 'Starting…' : 'Start Audit Cycle'}
        </button>
      </div>
    </form>
  );
}
