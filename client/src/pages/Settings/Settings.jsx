import { useState, useEffect } from 'react';
import { Plus, Settings as SettingsIcon, Users, Check, X, ShieldAlert } from 'lucide-react';
import apiClient from '../../api/client';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';

export default function Settings() {
  const user = useAuthStore(state => state.user);
  const [activeTab, setActiveTab] = useState('departments');
  const [loading, setLoading] = useState(true);
  
  const [departments, setDepartments] = useState([]);
  const [categories, setCategories] = useState([]);
  const [employees, setEmployees] = useState([]);

  // Modals state
  const [showDeptModal, setShowDeptModal] = useState(false);
  const [showCatModal, setShowCatModal] = useState(false);
  const [formData, setFormData] = useState({});

  const fetchData = async () => {
    try {
      setLoading(true);
      const [deptRes, catRes, userRes] = await Promise.all([
        apiClient.get('/departments'),
        apiClient.get('/categories'),
        apiClient.get('/users')
      ]);
      setDepartments(deptRes.data?.data?.departments || []);
      setCategories(catRes.data?.data?.categories || []);
      setEmployees(userRes.data?.data?.users || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load organization data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchData();
    }
  }, [user]);

  if (user?.role !== 'admin') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <ShieldAlert className="w-16 h-16 text-error mb-4" />
        <h1 className="text-2xl font-bold text-primary">Access Denied</h1>
        <p className="text-on-surface-variant mt-2">Organization Setup is restricted to Administrators.</p>
      </div>
    );
  }

  // Handle Form Submits
  const handleCreateDept = async (e) => {
    e.preventDefault();
    try {
      await apiClient.post('/departments', {
        name: formData.name,
        headId: formData.headId || null,
        parentDepartmentId: formData.parentId || null
      });
      toast.success('Department created');
      setShowDeptModal(false);
      setFormData({});
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create department');
    }
  };

  const handleCreateCat = async (e) => {
    e.preventDefault();
    try {
      const customFields = formData.customFields ? formData.customFields.split(',').map(f => ({ name: f.trim(), type: 'text' })) : [];
      await apiClient.post('/categories', {
        name: formData.name,
        customFields: JSON.stringify(customFields)
      });
      toast.success('Category created');
      setShowCatModal(false);
      setFormData({});
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create category');
    }
  };

  const handlePromote = async (userId, role) => {
    try {
      await apiClient.patch(`/users/${userId}/role`, { role });
      toast.success('Role updated');
      fetchData();
    } catch (err) {
      toast.error('Failed to update role');
    }
  };

  const handleToggleStatus = async (userId, currentStatus) => {
    try {
      const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
      await apiClient.patch(`/users/${userId}/status`, { status: newStatus });
      toast.success(`User marked as ${newStatus}`);
      fetchData();
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  return (
    <div className="p-container-padding space-y-stack-lg min-h-screen">
      {/* Page Header & Tab Controls */}
      <div className="mb-stack-lg">
        <div className="flex justify-between items-end border-b border-outline-variant">
          <nav className="flex gap-8">
            <button onClick={() => setActiveTab('departments')} className={`py-4 font-bold text-sm transition-all duration-200 border-b-2 ${activeTab === 'departments' ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant hover:text-primary'}`}>
              Departments
            </button>
            <button onClick={() => setActiveTab('categories')} className={`py-4 font-bold text-sm transition-all duration-200 border-b-2 ${activeTab === 'categories' ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant hover:text-primary'}`}>
              Asset Categories
            </button>
            <button onClick={() => setActiveTab('directory')} className={`py-4 font-bold text-sm transition-all duration-200 border-b-2 ${activeTab === 'directory' ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant hover:text-primary'}`}>
              Employee Directory
            </button>
          </nav>
          <div className="pb-3">
            {activeTab === 'departments' && (
              <button onClick={() => setShowDeptModal(true)} className="bg-primary text-on-primary px-4 py-2 rounded-lg text-sm font-bold hover:bg-opacity-90 flex items-center gap-2">
                <Plus className="w-5 h-5" /> New Department
              </button>
            )}
            {activeTab === 'categories' && (
              <button onClick={() => setShowCatModal(true)} className="bg-primary text-on-primary px-4 py-2 rounded-lg text-sm font-bold hover:bg-opacity-90 flex items-center gap-2">
                <Plus className="w-5 h-5" /> New Category
              </button>
            )}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center p-12"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>
      ) : (
        <div className="grid grid-cols-1 gap-gutter">
          
          {/* DEPARTMENTS TAB */}
          {activeTab === 'departments' && (
            <section className="animate-in fade-in duration-300">
              <div className="bg-surface border border-outline-variant rounded-xl overflow-hidden shadow-sm">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-surface-container-low text-on-surface-variant text-xs uppercase font-bold">
                      <th className="px-6 py-4 border-b border-outline-variant">Department Name</th>
                      <th className="px-6 py-4 border-b border-outline-variant">Parent Entity</th>
                      <th className="px-6 py-4 border-b border-outline-variant">Department Head</th>
                      <th className="px-6 py-4 border-b border-outline-variant">Status</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    {departments.map(dept => (
                      <tr key={dept.id} className="hover:bg-surface-container-low transition-colors duration-150">
                        <td className="px-6 py-4 border-b border-outline-variant font-bold text-primary">{dept.name}</td>
                        <td className="px-6 py-4 border-b border-outline-variant text-on-surface-variant">{dept.parentDepartment?.name || '—'}</td>
                        <td className="px-6 py-4 border-b border-outline-variant text-on-surface">{dept.head?.name || 'Unassigned'}</td>
                        <td className="px-6 py-4 border-b border-outline-variant">
                          <span className={`px-2 py-1 rounded text-xs font-bold ${dept.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {dept.status.toUpperCase()}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* ASSET CATEGORIES TAB */}
          {activeTab === 'categories' && (
            <section className="animate-in fade-in duration-300">
              <div className="bg-surface border border-outline-variant rounded-xl overflow-hidden shadow-sm">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-surface-container-low text-on-surface-variant text-xs uppercase font-bold">
                      <th className="px-6 py-4 border-b border-outline-variant">Category Name</th>
                      <th className="px-6 py-4 border-b border-outline-variant">Custom Fields</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    {categories.map(cat => {
                      let fields = [];
                      try { fields = JSON.parse(cat.customFields || '[]'); } catch(e){}
                      return (
                        <tr key={cat.id} className="hover:bg-surface-container-low transition-colors duration-150">
                          <td className="px-6 py-4 border-b border-outline-variant font-bold text-primary">{cat.name}</td>
                          <td className="px-6 py-4 border-b border-outline-variant">
                            <div className="flex flex-wrap gap-1">
                              {fields.map(f => (
                                <span key={f.name} className="bg-surface-container px-2 py-0.5 rounded text-[11px] font-medium border border-outline-variant">{f.name}</span>
                              ))}
                              {fields.length === 0 && <span className="text-on-surface-variant italic text-xs">None</span>}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* EMPLOYEE DIRECTORY TAB */}
          {activeTab === 'directory' && (
            <section className="animate-in fade-in duration-300">
              <div className="bg-surface border border-outline-variant rounded-xl overflow-hidden shadow-sm">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-surface-container-low text-on-surface-variant text-xs uppercase font-bold">
                      <th className="px-6 py-4 border-b border-outline-variant">Employee Name</th>
                      <th className="px-6 py-4 border-b border-outline-variant">Email</th>
                      <th className="px-6 py-4 border-b border-outline-variant">Department</th>
                      <th className="px-6 py-4 border-b border-outline-variant">System Role</th>
                      <th className="px-6 py-4 border-b border-outline-variant">Status</th>
                      <th className="px-6 py-4 border-b border-outline-variant text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    {employees.map((emp) => (
                      <tr key={emp.id} className="hover:bg-surface-container-low transition-colors duration-150">
                        <td className="px-6 py-4 border-b border-outline-variant font-bold text-primary">{emp.name}</td>
                        <td className="px-6 py-4 border-b border-outline-variant text-on-surface-variant">{emp.email}</td>
                        <td className="px-6 py-4 border-b border-outline-variant text-on-surface">{emp.department?.name || '—'}</td>
                        <td className="px-6 py-4 border-b border-outline-variant">
                          <select 
                            value={emp.role} 
                            onChange={(e) => handlePromote(emp.id, e.target.value)}
                            className="bg-surface border border-outline-variant rounded p-1 text-xs font-bold text-primary focus:outline-none"
                          >
                            <option value="employee">Employee</option>
                            <option value="department_head">Dept Head</option>
                            <option value="asset_manager">Asset Manager</option>
                            <option value="admin">Admin</option>
                          </select>
                        </td>
                        <td className="px-6 py-4 border-b border-outline-variant">
                          <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${emp.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {emp.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 border-b border-outline-variant text-right">
                          <button 
                            onClick={() => handleToggleStatus(emp.id, emp.status)}
                            className={`text-xs font-bold underline ${emp.status === 'active' ? 'text-error hover:text-red-800' : 'text-green-600 hover:text-green-800'}`}
                          >
                            {emp.status === 'active' ? 'Deactivate' : 'Activate'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}
        </div>
      )}

      {/* Modals */}
      {showDeptModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-surface rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-outline-variant flex justify-between items-center">
              <h2 className="text-lg font-bold text-primary">Create Department</h2>
              <button onClick={() => setShowDeptModal(false)}><X className="w-5 h-5 text-on-surface-variant hover:text-error" /></button>
            </div>
            <form onSubmit={handleCreateDept} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-on-surface mb-1">Department Name *</label>
                <input required type="text" onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-surface border border-outline-variant rounded-lg px-3 py-2 text-sm text-primary focus:border-primary focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm font-bold text-on-surface mb-1">Parent Department</label>
                <select onChange={e => setFormData({...formData, parentId: e.target.value})} className="w-full bg-surface border border-outline-variant rounded-lg px-3 py-2 text-sm text-primary focus:border-primary focus:outline-none">
                  <option value="">None (Top Level)</option>
                  {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-on-surface mb-1">Department Head</label>
                <select onChange={e => setFormData({...formData, headId: e.target.value})} className="w-full bg-surface border border-outline-variant rounded-lg px-3 py-2 text-sm text-primary focus:border-primary focus:outline-none">
                  <option value="">None</option>
                  {employees.filter(e => e.role === 'department_head' || e.role === 'admin').map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                </select>
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setShowDeptModal(false)} className="px-4 py-2 text-sm font-bold text-on-surface-variant hover:text-primary">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-primary text-on-primary rounded-lg text-sm font-bold hover:bg-opacity-90">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showCatModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-surface rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-outline-variant flex justify-between items-center">
              <h2 className="text-lg font-bold text-primary">Create Asset Category</h2>
              <button onClick={() => setShowCatModal(false)}><X className="w-5 h-5 text-on-surface-variant hover:text-error" /></button>
            </div>
            <form onSubmit={handleCreateCat} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-on-surface mb-1">Category Name *</label>
                <input required type="text" onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g. Laptops" className="w-full bg-surface border border-outline-variant rounded-lg px-3 py-2 text-sm text-primary focus:border-primary focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm font-bold text-on-surface mb-1">Custom Fields (comma-separated)</label>
                <input type="text" onChange={e => setFormData({...formData, customFields: e.target.value})} placeholder="e.g. RAM, Storage, Serial Number" className="w-full bg-surface border border-outline-variant rounded-lg px-3 py-2 text-sm text-primary focus:border-primary focus:outline-none" />
                <p className="text-xs text-on-surface-variant mt-1">These fields will be requested when registering a new asset in this category.</p>
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setShowCatModal(false)} className="px-4 py-2 text-sm font-bold text-on-surface-variant hover:text-primary">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-primary text-on-primary rounded-lg text-sm font-bold hover:bg-opacity-90">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
