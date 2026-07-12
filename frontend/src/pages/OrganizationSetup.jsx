import { useState, useEffect, useMemo } from 'react';
import { Plus, Check, X, ShieldAlert, Building2 } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import SearchBar from '../components/SearchBar';
import DataTable from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';
import { useToast } from '../components/Toast';
import authService from '../services/authService';
import api from '../services/api';

const TABS = [
  { key: 'departments', label: 'Departments' },
  { key: 'employees', label: 'Employees / Users' },
];

export default function OrganizationSetup() {
  const [tab, setTab] = useState('departments');
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [deptModalOpen, setDeptModalOpen] = useState(false);
  
  // Data States
  const [departments, setDepartments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Editing state
  const [editingDept, setEditingDept] = useState(null);
  const [deptName, setDeptName] = useState('');
  const [myDeptInfo, setMyDeptInfo] = useState(null);
  
  const { showToast } = useToast();
  
  const currentUser = authService.getCurrentUser();
  const isAdmin = currentUser?.role === 'Admin';

  // Load backend data
  const loadData = async () => {
    setLoading(true);
    try {
      if (isAdmin) {
        const [resDepts, resUsers] = await Promise.all([
          api.get('/departments'),
          api.get('/users'),
        ]);
        setDepartments(resDepts.data);
        setEmployees(resUsers.data);
      } else {
        // Employee: load their own department details
        if (currentUser?.department_id) {
          const res = await api.get(`/departments/${currentUser.department_id}`);
          setMyDeptInfo(res.data);
        }
      }
    } catch (err) {
      console.error('Failed to load organization data', err);
      showToast(err.message || 'Error loading records.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [isAdmin, currentUser?.department_id, tab]);

  // Handle department create / update
  const handleSaveDepartment = async (e) => {
    e.preventDefault();
    if (!deptName.trim()) return;

    try {
      if (editingDept) {
        // Edit Department
        await api.put(`/departments/${editingDept.id}`, { name: deptName.trim() });
        showToast(`Department renamed to "${deptName}" successfully.`, 'success');
      } else {
        // Create Department
        await api.post('/departments/', { name: deptName.trim() });
        showToast(`Department "${deptName}" created successfully.`, 'success');
      }
      setDeptName('');
      setEditingDept(null);
      setDeptModalOpen(false);
      loadData();
    } catch (err) {
      showToast(err.message || 'Failed to save department.', 'error');
    }
  };

  const handleDeleteDepartment = async (id) => {
    if (!window.confirm('Delete this department? Any employees assigned to it will be unassigned.')) return;
    try {
      await api.delete(`/departments/${id}`);
      showToast('Department deleted successfully.', 'success');
      loadData();
    } catch (err) {
      showToast(err.message || 'Failed to delete department.', 'error');
    }
  };

  // User Management Actions (Admin)
  const handleApproveUser = async (userId) => {
    try {
      await api.put(`/users/${userId}`, { is_active: true });
      showToast('User approved and activated successfully.', 'success');
      loadData();
    } catch (err) {
      showToast(err.message || 'Failed to approve user.', 'error');
    }
  };

  const handleDeactivateUser = async (userId, currentActive) => {
    try {
      await api.put(`/users/${userId}`, { is_active: !currentActive });
      showToast(currentActive ? 'User profile deactivated.' : 'User profile activated.', 'success');
      loadData();
    } catch (err) {
      showToast(err.message || 'Failed to change status.', 'error');
    }
  };

  const handleChangeRole = async (userId, newRole) => {
    try {
      await api.put(`/users/${userId}`, { role: newRole });
      showToast('User role updated successfully.', 'success');
      loadData();
    } catch (err) {
      showToast(err.message || 'Failed to change role.', 'error');
    }
  };

  const handleAssignDepartment = async (userId, deptId) => {
    try {
      await api.put(`/users/${userId}`, { department_id: deptId ? parseInt(deptId) : null });
      showToast('Employee department updated.', 'success');
      loadData();
    } catch (err) {
      showToast(err.message || 'Failed to assign department.', 'error');
    }
  };

  // Filter lists based on search string
  const filteredDepartments = useMemo(() => {
    if (!search) return departments;
    return departments.filter(d => d.name.toLowerCase().includes(search.toLowerCase()));
  }, [departments, search]);

  const filteredEmployees = useMemo(() => {
    if (!search) return employees;
    return employees.filter(emp =>
      emp.name.toLowerCase().includes(search.toLowerCase()) ||
      emp.email.toLowerCase().includes(search.toLowerCase()) ||
      (emp.employee_id && emp.employee_id.toLowerCase().includes(search.toLowerCase())) ||
      (emp.designation && emp.designation.toLowerCase().includes(search.toLowerCase()))
    );
  }, [employees, search]);

  // Define Columns for DataTable
  const departmentColumns = [
    { key: 'id', label: 'ID' },
    { key: 'name', label: 'Department Name' },
    {
      key: 'employees',
      label: 'Employees Count',
      render: (dept) => {
        const count = employees.filter(e => e.department_id === dept.id).length;
        return <span className="font-semibold">{count} member{count !== 1 ? 's' : ''}</span>;
      }
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (dept) => (
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setEditingDept(dept);
              setDeptName(dept.name);
              setDeptModalOpen(true);
            }}
            className="text-xs font-semibold text-brand-light hover:text-brand cursor-pointer"
          >
            Rename
          </button>
          <button
            onClick={() => handleDeleteDepartment(dept.id)}
            className="text-xs font-semibold text-danger hover:text-red-500 cursor-pointer"
          >
            Delete
          </button>
        </div>
      )
    }
  ];

  const employeeColumns = [
    {
      key: 'employee_id',
      label: 'Emp ID',
      render: (emp) => <span className="font-mono text-xs font-bold text-gray-400">{emp.employee_id || 'N/A'}</span>
    },
    {
      key: 'name',
      label: 'Details',
      render: (emp) => (
        <div>
          <p className="font-bold text-text">{emp.name}</p>
          <p className="text-xs text-text-secondary mt-0.5">{emp.email}</p>
          {emp.designation && <p className="text-[10px] text-purple-400 mt-0.5">{emp.designation}</p>}
        </div>
      )
    },
    {
      key: 'role',
      label: 'Role Assignment',
      render: (emp) => (
        <select
          value={emp.role}
          onChange={(e) => handleChangeRole(emp.id, e.target.value)}
          className="bg-bg-card border border-border/80 text-xs text-text rounded-md px-2 py-1 outline-none cursor-pointer focus:border-brand"
        >
          <option value="Employee">Employee</option>
          <option value="Admin">Admin</option>
        </select>
      )
    },
    {
      key: 'department',
      label: 'Department',
      render: (emp) => (
        <select
          value={emp.department_id || ''}
          onChange={(e) => handleAssignDepartment(emp.id, e.target.value)}
          className="bg-bg-card border border-border/80 text-xs text-text rounded-md px-2 py-1 outline-none cursor-pointer focus:border-brand"
        >
          <option value="">Unassigned</option>
          {departments.map((d) => (
            <option key={d.id} value={d.id}>{d.name}</option>
          ))}
        </select>
      )
    },
    {
      key: 'status',
      label: 'Status',
      render: (emp) => (
        <span className={`inline-flex items-center text-xs font-bold px-2 py-0.5 rounded-full ${
          emp.is_active 
            ? 'bg-emerald-500/10 text-emerald-400' 
            : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
        }`}>
          {emp.is_active ? 'Active' : 'Pending Approval'}
        </span>
      )
    },
    {
      key: 'actions',
      label: 'Quick Admin Actions',
      render: (emp) => (
        <div className="flex gap-2">
          {!emp.is_active ? (
            <button
              onClick={() => handleApproveUser(emp.id)}
              className="inline-flex items-center gap-1 text-xs font-bold text-emerald-400 hover:text-emerald-300 border border-emerald-500/30 rounded px-2.5 py-1 bg-emerald-500/5 hover:bg-emerald-500/10 cursor-pointer"
            >
              <Check size={12} /> Approve Registration
            </button>
          ) : (
            <button
              onClick={() => handleDeactivateUser(emp.id, emp.is_active)}
              className="text-xs font-bold text-rose-400 hover:text-rose-300 border border-rose-500/20 rounded px-2 py-1 bg-rose-500/5 hover:bg-rose-500/10 cursor-pointer"
            >
              Deactivate
            </button>
          )}
        </div>
      )
    }
  ];

  // 1. ADMIN USER INTERFACE
  if (isAdmin) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Organization Setup"
          subtitle="Manage department records and approve/assign company employees."
          actions={
            tab === 'departments' && (
              <button
                onClick={() => {
                  setEditingDept(null);
                  setDeptName('');
                  setDeptModalOpen(true);
                }}
                className="btn-primary cursor-pointer"
              >
                <Plus size={16} /> Create Department
              </button>
            )
          }
        />

        <div className="mb-5 flex items-center gap-1.5 rounded-lg border border-border bg-bg-surface p-1.5 w-fit">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => { setTab(t.key); setSearch(''); }}
              className={`rounded-md px-3.5 py-1.5 text-sm font-medium transition-colors cursor-pointer ${
                tab === t.key ? 'bg-brand text-white' : 'text-text-secondary hover:text-text'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Pending approvals helper alert */}
        {tab === 'employees' && employees.some(e => !e.is_active) && (
          <div className="border border-amber-500/25 bg-amber-500/5 p-4 rounded-xl flex items-center gap-3 text-amber-800 dark:text-amber-300">
            <ShieldAlert className="w-5 h-5 text-amber-500" />
            <span className="text-xs font-semibold">
              There are employee accounts awaiting registration approvals. Click "Approve Registration" in the actions column.
            </span>
          </div>
        )}

        <div className="mb-4">
          <SearchBar value={search} onChange={setSearch} placeholder={`Search ${tab === 'departments' ? 'departments' : 'employees'}...`} />
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center p-12">
            <span className="w-10 h-10 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></span>
            <p className="mt-4 text-slate-500 text-xs font-semibold">Fetching active records...</p>
          </div>
        ) : tab === 'departments' ? (
          <DataTable columns={departmentColumns} data={filteredDepartments} emptyMessage="No departments found" />
        ) : (
          <DataTable columns={employeeColumns} data={filteredEmployees} emptyMessage="No employee directory found" />
        )}

        {/* DEPARTMENT SAVE/EDIT MODAL */}
        <Modal
          open={deptModalOpen}
          onClose={() => { setDeptModalOpen(false); setEditingDept(null); }}
          title={editingDept ? "Rename Department" : "Create New Department"}
          footer={
            <>
              <button onClick={() => { setDeptModalOpen(false); setEditingDept(null); }} className="btn-secondary cursor-pointer">Cancel</button>
              <button onClick={handleSaveDepartment} className="btn-primary cursor-pointer">Save</button>
            </>
          }
        >
          <form className="space-y-4" onSubmit={handleSaveDepartment}>
            <div>
              <label className="label-base">Department Name</label>
              <input
                className="input-base"
                value={deptName}
                onChange={(e) => setDeptName(e.target.value)}
                placeholder="e.g. Engineering, Sales, Human Resources"
                required
                autoFocus
              />
            </div>
          </form>
        </Modal>
      </div>
    );
  }

  // 2. EMPLOYEE USER INTERFACE ("My Department")
  return (
    <div className="space-y-6 max-w-3xl">
      <PageHeader
        title="My Department"
        subtitle="View details of your assigned department in the organization."
      />

      {loading ? (
        <div className="flex flex-col items-center justify-center p-12">
          <span className="w-10 h-10 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></span>
          <p className="mt-4 text-slate-500 text-xs font-semibold">Loading department details...</p>
        </div>
      ) : !currentUser?.department_id ? (
        <div className="surface-card p-8 text-center space-y-4">
          <Building2 className="w-12 h-12 text-gray-500 mx-auto" />
          <h3 className="text-lg font-bold text-text">Department Unassigned</h3>
          <p className="text-text-secondary text-sm leading-relaxed max-w-md mx-auto">
            You are not currently assigned to a department. Please contact a system administrator to allocate your profile.
          </p>
        </div>
      ) : (
        <div className="surface-card p-6 space-y-6">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-600/10 text-purple-400 font-bold text-2xl">
              D
            </div>
            <div>
              <span className="text-xs uppercase font-bold tracking-widest text-text-secondary">Assigned Unit</span>
              <h3 className="text-2xl font-extrabold text-text mt-0.5">
                {myDeptInfo?.name || 'Department'}
              </h3>
            </div>
          </div>

          <div className="pt-6 border-t border-border/60">
            <h4 className="font-bold text-sm text-text mb-2">Department Policy</h4>
            <p className="text-xs text-text-secondary leading-relaxed">
              All physical hardware and software allocations booked under <strong>{myDeptInfo?.name}</strong> are audited quarterly. Ensure that any computer devices, monitors, or office equipment assigned to you are registered, and raise maintenance tickets for repairs immediately.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
