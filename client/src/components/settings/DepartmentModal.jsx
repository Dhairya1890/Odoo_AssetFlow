import { useEffect } from 'react';
import { X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import apiClient from '../../api/client';

export default function DepartmentModal({ isOpen, onClose, onSuccess, editData, departments, users }) {
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm();

  useEffect(() => {
    if (isOpen) {
      if (editData) {
        reset({
          name: editData.name,
          parentId: editData.parentId || '',
          headId: editData.headId || ''
        });
      } else {
        reset({});
      }
    }
  }, [isOpen, editData, reset]);

  const onSubmit = async (data) => {
    try {
      const payload = {
        name: data.name,
        parentId: data.parentId ? parseInt(data.parentId) : null,
        headId: data.headId ? parseInt(data.headId) : null
      };
      
      if (editData) {
        await apiClient.put(`/departments/${editData.id}`, payload);
        toast.success('Department updated successfully!');
      } else {
        await apiClient.post('/departments', payload);
        toast.success('Department created successfully!');
      }
      
      reset();
      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || `Failed to ${editData ? 'update' : 'create'} department`);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <div>
            <h3 className="text-xl font-bold text-on-surface">{editData ? 'Edit Department' : 'New Department'}</h3>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-on-surface-variant">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form id="dept-form" onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-on-surface">Department Name*</label>
            <input 
              {...register('name', { required: true })}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all text-sm" 
              placeholder="e.g. Engineering" 
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-on-surface">Parent Department</label>
            <select 
              {...register('parentId')}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all text-sm bg-transparent"
            >
              <option value="">None</option>
              {departments.filter(d => d.id !== editData?.id).map(d => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-on-surface">Department Head</label>
            <select 
              {...register('headId')}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all text-sm bg-transparent"
            >
              <option value="">None</option>
              {users.map(u => (
                <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
              ))}
            </select>
          </div>
        </form>
        
        <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
          <button onClick={onClose} className="px-6 py-2 border rounded-lg text-sm font-medium hover:bg-white" type="button">Cancel</button>
          <button type="submit" form="dept-form" disabled={isSubmitting} className="px-6 py-2 bg-primary text-on-primary rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50">
            {isSubmitting ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}
