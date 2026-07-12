import { useEffect } from 'react';
import { X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import apiClient from '../../api/client';

export default function EmployeeModal({ isOpen, onClose, onSuccess, departments }) {
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm();

  useEffect(() => {
    if (isOpen) {
      reset({ role: 'employee' });
    }
  }, [isOpen, reset]);

  const onSubmit = async (data) => {
    try {
      const payload = {
        name: data.name,
        email: data.email,
        role: data.role,
        departmentId: data.departmentId ? parseInt(data.departmentId) : null
      };
      
      await apiClient.post('/users', payload);
      toast.success('Employee created successfully! Password is AssetFlow@123');
      reset();
      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add employee');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <div>
            <h3 className="text-xl font-bold text-on-surface">Add Employee</h3>
            <p className="text-sm text-on-surface-variant mt-1">They will use the default password to login.</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-on-surface-variant">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form id="emp-form" onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-on-surface">Full Name*</label>
            <input 
              {...register('name', { required: true })}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all text-sm" 
              placeholder="e.g. John Doe" 
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-on-surface">Email Address*</label>
            <input 
              type="email"
              {...register('email', { required: true })}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all text-sm" 
              placeholder="e.g. john@assetflow.com" 
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-on-surface">Department</label>
            <select 
              {...register('departmentId')}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all text-sm bg-transparent"
            >
              <option value="">None</option>
              {departments.map(d => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-on-surface">Role</label>
            <select 
              {...register('role')}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all text-sm bg-transparent"
            >
              <option value="employee">Employee</option>
              <option value="department_head">Department Head</option>
              <option value="asset_manager">Asset Manager</option>
              <option value="admin">Administrator</option>
            </select>
          </div>
        </form>
        
        <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
          <button onClick={onClose} className="px-6 py-2 border rounded-lg text-sm font-medium hover:bg-white" type="button">Cancel</button>
          <button type="submit" form="emp-form" disabled={isSubmitting} className="px-6 py-2 bg-primary text-on-primary rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50">
            {isSubmitting ? 'Saving...' : 'Add Employee'}
          </button>
        </div>
      </div>
    </div>
  );
}
