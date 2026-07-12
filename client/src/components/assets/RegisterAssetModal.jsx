import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import apiClient from '../../api/client';

export default function RegisterAssetModal({ isOpen, onClose, onSuccess, editData }) {
  const [categories, setCategories] = useState([]);
  const [departments, setDepartments] = useState([]);
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm();

  useEffect(() => {
    if (isOpen) {
      const fetchData = async () => {
        try {
          const [catsRes, depsRes] = await Promise.all([
            apiClient.get('/categories'),
            apiClient.get('/departments')
          ]);
          setCategories(catsRes.data?.data?.categories || []);
          setDepartments(depsRes.data?.data?.departments || []);
        } catch (error) {
          console.error('Failed to fetch modal data:', error);
          toast.error('Failed to load categories/departments');
        }
      };
      fetchData();
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      if (editData) {
        // Pre-fill form
        reset({
          name: editData.name,
          categoryId: editData.categoryId,
          serialNumber: editData.serialNumber,
          acquisitionDate: editData.acquisitionDate ? new Date(editData.acquisitionDate).toISOString().split('T')[0] : '',
          acquisitionCost: editData.acquisitionCost,
          condition: editData.condition.toLowerCase(),
          location: editData.location,
          status: editData.status || 'available',
          departmentId: editData.departmentId || '',
          isBookable: editData.isBookable
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
        categoryId: parseInt(data.categoryId),
        serialNumber: data.serialNumber || undefined,
        acquisitionDate: data.acquisitionDate || undefined,
        acquisitionCost: data.acquisitionCost ? parseFloat(data.acquisitionCost) : undefined,
        condition: data.condition.toLowerCase(),
        location: data.location || undefined,
        status: editData ? data.status : 'available',
        departmentId: data.departmentId ? parseInt(data.departmentId) : undefined,
        isBookable: data.isBookable
      };
      
      if (editData) {
        await apiClient.patch(`/assets/${editData.id}`, payload);
        toast.success('Asset updated successfully!');
      } else {
        await apiClient.post('/assets', payload);
        toast.success('Asset registered successfully!');
      }
      
      reset();
      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      console.error('Registration error:', error);
      toast.error(error.response?.data?.message || `Failed to ${editData ? 'update' : 'register'} asset`);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <div>
            <h3 className="text-xl font-bold text-on-surface">{editData ? 'Edit Asset' : 'Register New Asset'}</h3>
            <p className="text-sm text-on-surface-variant mt-1">{editData ? 'Update the details for this asset.' : 'Enter asset details to add it to the system.'}</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-full transition-colors text-on-surface-variant"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form id="register-asset-form" onSubmit={handleSubmit(onSubmit, (err) => console.log('Validation errors:', err))} className="p-6 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-on-surface">Asset Name*</label>
              <input 
                {...register('name', { required: true })}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all text-sm" 
                placeholder="e.g. Sony A7IV Camera" 
                type="text" 
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-on-surface">Category*</label>
              <select 
                {...register('categoryId', { required: true })}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all text-sm appearance-none bg-transparent"
              >
                <option value="">Select category</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-on-surface">Serial Number</label>
              <input 
                {...register('serialNumber')}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all text-sm font-mono" 
                placeholder="SN-XXXX-XXXX" 
                type="text" 
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-on-surface">Acquisition Date</label>
              <input 
                {...register('acquisitionDate')}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all text-sm" 
                type="date" 
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-on-surface">Cost (USD)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">$</span>
                <input 
                  {...register('acquisitionCost')}
                  className="w-full pl-7 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all text-sm" 
                  placeholder="0.00" 
                  type="number"
                  step="0.01"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-on-surface">Condition</label>
              <select 
                {...register('condition')}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all text-sm appearance-none bg-transparent"
              >
                <option value="new">New</option>
                <option value="good">Good</option>
                <option value="fair">Fair</option>
                <option value="poor">Poor</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-on-surface">Location</label>
              <input 
                {...register('location')}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all text-sm" 
                placeholder="e.g. Warehouse A, Bay 4" 
                type="text" 
              />
            </div>
            {editData && (
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-on-surface">Status</label>
                <select 
                  {...register('status')}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all text-sm appearance-none bg-transparent"
                >
                  <option value="available">Available</option>
                  <option value="allocated">Allocated</option>
                  <option value="missing">Missing</option>
                  <option value="damaged">Damaged</option>
                  <option value="under_maintenance">Under Maintenance</option>
                </select>
              </div>
            )}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-on-surface">Department</label>
              <select 
                {...register('departmentId')}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all text-sm appearance-none bg-transparent"
              >
                <option value="">Select department (Optional)</option>
                {departments.map(d => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
            <div>
              <p className="text-sm font-medium text-on-surface">Bookable Asset</p>
              <p className="text-xs text-on-surface-variant mt-0.5">Allow employees to reserve this asset via the app.</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" {...register('isBookable')} className="sr-only peer" />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>
        </form>
        
        <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-6 py-2 border border-slate-200 rounded-lg text-sm font-medium hover:bg-white transition-colors"
            type="button"
          >
            Cancel
          </button>
          <button 
            type="submit"
            form="register-asset-form"
            disabled={isSubmitting}
            className="px-6 py-2 bg-primary text-on-primary rounded-lg text-sm font-medium transition-colors hover:opacity-90 disabled:opacity-50"
          >
            {isSubmitting ? (editData ? 'Updating...' : 'Registering...') : (editData ? 'Update Asset' : 'Confirm Registration')}
          </button>
        </div>
      </div>
    </div>
  );
}
