import { useEffect } from 'react';
import { X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import apiClient from '../../api/client';

export default function PasswordModal({ isOpen, onClose, user }) {
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm();

  useEffect(() => {
    if (isOpen) {
      reset({ password: '' });
    }
  }, [isOpen, reset]);

  const onSubmit = async (data) => {
    try {
      await apiClient.patch(`/users/${user.id}/password`, { password: data.password });
      toast.success('Password updated successfully');
      reset();
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update password');
    }
  };

  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative bg-white w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <div>
            <h3 className="text-xl font-bold text-on-surface">Reset Password</h3>
            <p className="text-sm text-on-surface-variant mt-1">For {user.name}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-on-surface-variant">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form id="pass-form" onSubmit={handleSubmit(onSubmit)} className="flex flex-col">
          <div className="p-6 space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-on-surface">New Password*</label>
              <input 
                type="password"
                {...register('password', { required: true, minLength: 6 })}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all text-sm" 
                placeholder="Min 6 characters" 
              />
            </div>
          </div>
          <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
            <button onClick={onClose} className="px-6 py-2 border rounded-lg text-sm font-medium hover:bg-white" type="button">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="px-6 py-2 bg-primary text-on-primary rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50">
              {isSubmitting ? 'Saving...' : 'Save Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
