import { useEffect, useState } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import apiClient from '../../api/client';

export default function CategoryModal({ isOpen, onClose, onSuccess, editData }) {
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm();
  const [customFields, setCustomFields] = useState([]);
  const [newField, setNewField] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (editData) {
        reset({ name: editData.name });
        setCustomFields(editData.customFields || []);
      } else {
        reset({});
        setCustomFields([]);
      }
      setNewField('');
    }
  }, [isOpen, editData, reset]);

  const addField = () => {
    const val = newField.trim();
    if (val && !customFields.some(f => (typeof f === 'string' ? f : f.name) === val)) {
      setCustomFields([...customFields, { name: val, type: 'text' }]);
      setNewField('');
    }
  };

  const removeField = (fieldToRemove) => {
    const nameToRemove = typeof fieldToRemove === 'string' ? fieldToRemove : fieldToRemove.name;
    setCustomFields(customFields.filter(f => (typeof f === 'string' ? f : f.name) !== nameToRemove));
  };

  const onSubmit = async (data) => {
    try {
      const payload = {
        name: data.name,
        customFields: customFields.map(f => typeof f === 'string' ? { name: f, type: 'text' } : f)
      };
      
      if (editData) {
        await apiClient.put(`/categories/${editData.id}`, payload);
        toast.success('Category updated successfully!');
      } else {
        await apiClient.post('/categories', payload);
        toast.success('Category created successfully!');
      }
      
      reset();
      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || `Failed to ${editData ? 'update' : 'create'} category`);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <div>
            <h3 className="text-xl font-bold text-on-surface">{editData ? 'Edit Category' : 'New Asset Category'}</h3>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-on-surface-variant">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form id="category-form" onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-on-surface">Category Name*</label>
            <input 
              {...register('name', { required: true })}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all text-sm" 
              placeholder="e.g. Computing Hardware" 
            />
          </div>
          
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-on-surface">Custom Fields</label>
            <div className="flex gap-2">
              <input 
                value={newField}
                onChange={(e) => setNewField(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addField(); } }}
                className="flex-1 px-4 py-2 border border-slate-200 rounded-lg focus:ring-1 focus:ring-primary outline-none text-sm" 
                placeholder="e.g. RAM Size" 
              />
              <button type="button" onClick={addField} className="px-3 bg-slate-100 rounded-lg hover:bg-slate-200 text-on-surface">
                <Plus className="w-5 h-5" />
              </button>
            </div>
            {customFields.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {customFields.map((field, i) => {
                  const fieldName = typeof field === 'string' ? field : field.name;
                  return (
                    <span key={i} className="px-2.5 py-1 bg-surface-container rounded-md text-xs border border-outline-variant flex items-center gap-1.5">
                      {fieldName}
                      <button type="button" onClick={() => removeField(field)} className="text-error hover:opacity-70"><X className="w-3 h-3" /></button>
                    </span>
                  );
                })}
              </div>
            )}
          </div>
        </form>
        
        <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
          <button onClick={onClose} className="px-6 py-2 border rounded-lg text-sm font-medium hover:bg-white" type="button">Cancel</button>
          <button type="submit" form="category-form" disabled={isSubmitting} className="px-6 py-2 bg-primary text-on-primary rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50">
            {isSubmitting ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}
