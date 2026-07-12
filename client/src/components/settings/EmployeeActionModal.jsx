import { useEffect } from 'react';
import { X, Key } from 'lucide-react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import apiClient from '../../api/client';

export default function EmployeeActionModal({ isOpen, onClose, user, onSuccess, onOpenPasswordModal }) {
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm();

  useEffect(() => {
    if (isOpen && user) {
      reset({
        role: user.role,
        status: user.status,
      });
    }
  }, [isOpen, user, reset]);

  const onSubmit = async (data) => {
    try {
      if (data.role !== user.role) {
        await apiClient.patch(`/users/${user.id}/role`, { role: data.role });
      }
      if (data.status !== user.status) {
        await apiClient.patch(`/users/${user.id}/status`, { status: data.status });
      }
      toast.success('Employee updated successfully');
      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update employee');
    }
  };

  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative bg-white w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <div>
            <h3 className="text-xl font-bold text-on-surface">Manage Employee</h3>
            <p className="text-sm text-on-surface-variant mt-1">{user.name}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-on-surface-variant">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form id="action-form" onSubmit={handleSubmit(onSubmit)} className="flex flex-col">
          <div className="p-6 space-y-4">
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
            
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-on-surface">Account Status</label>
              <select 
                {...register('status')}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all text-sm bg-transparent"
              >
                <option value="active">Active</option>
                <option value="inactive">Deactivated</option>
              </select>
            </div>
            
            <div className="pt-2">
              <button 
                type="button" 
                onClick={() => { onClose(); onOpenPasswordModal(); }}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-slate-50 border border-slate-200 hover:bg-slate-100 rounded-lg text-sm font-medium text-on-surface transition-colors"
              >
                <Key className="w-4 h-4 text-primary" />
                Reset Password
              </button>
            </div>
          </div>
          
          <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
            <button onClick={onClose} className="px-6 py-2 border rounded-lg text-sm font-medium hover:bg-white" type="button">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="px-6 py-2 bg-primary text-on-primary rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50">
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
