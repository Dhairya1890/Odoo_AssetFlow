import { useState, useEffect } from 'react';
import { Plus, Settings as SettingsIcon, Edit2, Trash2, MoreHorizontal } from 'lucide-react';
import apiClient from '../../api/client';
import toast from 'react-hot-toast';
import DepartmentModal from '../../components/settings/DepartmentModal';
import CategoryModal from '../../components/settings/CategoryModal';
import EmployeeModal from '../../components/settings/EmployeeModal';
import PasswordModal from '../../components/settings/PasswordModal';
import EmployeeActionModal from '../../components/settings/EmployeeActionModal';

export default function Settings() {
  const [activeTab, setActiveTab] = useState('departments');
  const [departments, setDepartments] = useState([]);
  const [categories, setCategories] = useState([]);
  const [users, setUsers] = useState([]);

  // Modals state
  const [isDeptModalOpen, setIsDeptModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isEmpModalOpen, setIsEmpModalOpen] = useState(false);
  const [isPassModalOpen, setIsPassModalOpen] = useState(false);
  const [isEmpActionModalOpen, setIsEmpActionModalOpen] = useState(false);
  const [editData, setEditData] = useState(null);

  const fetchDepartments = async () => {
    try {
      const res = await apiClient.get('/departments');
      setDepartments(res.data.data.departments || []);
    } catch (err) { toast.error('Failed to load departments'); }
  };

  const fetchCategories = async () => {
    try {
      const res = await apiClient.get('/categories');
      setCategories(res.data.data.categories || []);
    } catch (err) { toast.error('Failed to load categories'); }
  };

  const fetchUsers = async () => {
    try {
      const res = await apiClient.get('/users');
      setUsers(res.data.data.users || []);
    } catch (err) { toast.error('Failed to load employees'); }
  };

  useEffect(() => {
    if (activeTab === 'departments') { fetchDepartments(); fetchUsers(); }
    if (activeTab === 'categories') fetchCategories();
    if (activeTab === 'directory') { fetchUsers(); fetchDepartments(); }
  }, [activeTab]);

  const handleDeleteDept = async (id) => {
    if (window.confirm('Delete this department?')) {
      try {
        await apiClient.delete(`/departments/${id}`);
        toast.success('Department deleted');
        fetchDepartments();
      } catch (err) { toast.error(err.response?.data?.message || 'Failed to delete'); }
    }
  };

  const handleDeleteCat = async (id) => {
    if (window.confirm('Delete this category?')) {
      try {
        await apiClient.delete(`/categories/${id}`);
        toast.success('Category deleted');
        fetchCategories();
      } catch (err) { toast.error(err.response?.data?.message || 'Failed to delete'); }
    }
  };

  return (
    <div className="p-container-padding space-y-stack-lg min-h-screen">
      {/* Page Header & Tab Controls */}
      <div className="mb-stack-lg">
        <div className="flex justify-between items-end border-b border-outline-variant">
          <nav className="flex gap-8">
            <button 
              onClick={() => setActiveTab('departments')}
              className={`py-4 font-medium text-sm transition-all duration-200 border-b-2 ${activeTab === 'departments' ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant hover:text-primary'}`}
            >
              Departments
            </button>
            <button 
              onClick={() => setActiveTab('categories')}
              className={`py-4 font-medium text-sm transition-all duration-200 border-b-2 ${activeTab === 'categories' ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant hover:text-primary'}`}
            >
              Asset Categories
            </button>
            <button 
              onClick={() => setActiveTab('directory')}
              className={`py-4 font-medium text-sm transition-all duration-200 border-b-2 ${activeTab === 'directory' ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant hover:text-primary'}`}
            >
              Employee Directory
            </button>
          </nav>
          <div className="pb-3">
            <button 
              onClick={() => {
                setEditData(null);
                if (activeTab === 'departments') setIsDeptModalOpen(true);
                else if (activeTab === 'categories') setIsCategoryModalOpen(true);
                else setIsEmpModalOpen(true);
              }}
              className="bg-primary text-on-primary px-4 py-2 rounded-lg text-sm font-medium hover:bg-opacity-90 transition-all flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              <span>
                {activeTab === 'departments' ? 'New Department' : 
                 activeTab === 'categories' ? 'New Category' : 'Add Employee'}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="grid grid-cols-1 gap-gutter">
        
        {/* DEPARTMENTS TAB */}
        {activeTab === 'departments' && (
          <section className="animate-in fade-in duration-300">
            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-container-low text-on-surface-variant text-xs uppercase font-medium">
                    <th className="px-6 py-4 border-b border-outline-variant">Department Name</th>
                    <th className="px-6 py-4 border-b border-outline-variant">Parent Entity</th>
                    <th className="px-6 py-4 border-b border-outline-variant">Department Head</th>
                    <th className="px-6 py-4 border-b border-outline-variant text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {departments.length === 0 ? (
                    <tr><td colSpan="4" className="text-center p-6 text-on-surface-variant">No departments found</td></tr>
                  ) : departments.map(dept => (
                    <tr key={dept.id} className="hover:bg-surface-container-low transition-colors duration-150">
                      <td className="px-6 py-4 border-b border-outline-variant font-bold text-primary">{dept.name}</td>
                      <td className="px-6 py-4 border-b border-outline-variant text-on-surface-variant">{dept.parent?.name || '—'}</td>
                      <td className="px-6 py-4 border-b border-outline-variant">
                        {dept.head ? (
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-secondary-container flex items-center justify-center text-[10px] font-bold text-on-secondary-container">
                              {dept.head.name.split(' ').map(n=>n[0]).join('')}
                            </div>
                            <span>{dept.head.name}</span>
                          </div>
                        ) : '—'}
                      </td>
                      <td className="px-6 py-4 border-b border-outline-variant text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => { setEditData(dept); setIsDeptModalOpen(true); }} className="p-1.5 text-on-surface-variant hover:text-primary"><Edit2 className="w-4 h-4" /></button>
                          <button onClick={() => handleDeleteDept(dept.id)} className="p-1.5 text-on-surface-variant hover:text-error"><Trash2 className="w-4 h-4" /></button>
                        </div>
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
            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-container-low text-on-surface-variant text-xs uppercase font-medium">
                    <th className="px-6 py-4 border-b border-outline-variant">Category Name</th>
                    <th className="px-6 py-4 border-b border-outline-variant">Custom Fields</th>
                    <th className="px-6 py-4 border-b border-outline-variant text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {categories.length === 0 ? (
                    <tr><td colSpan="3" className="text-center p-6 text-on-surface-variant">No categories found</td></tr>
                  ) : categories.map(cat => (
                    <tr key={cat.id} className="hover:bg-surface-container-low transition-colors duration-150">
                      <td className="px-6 py-4 border-b border-outline-variant font-bold text-primary">{cat.name}</td>
                      <td className="px-6 py-4 border-b border-outline-variant">
                        <div className="flex flex-wrap gap-1">
                          {(cat.customFields || []).map((f, i) => {
                            const fieldName = typeof f === 'string' ? f : (f.name || JSON.stringify(f));
                            return (
                              <span key={i} className="bg-surface-container px-2 py-0.5 rounded text-[11px] border border-outline-variant">{fieldName}</span>
                            );
                          })}
                        </div>
                      </td>
                      <td className="px-6 py-4 border-b border-outline-variant text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => { setEditData(cat); setIsCategoryModalOpen(true); }} className="p-1.5 text-on-surface-variant hover:text-primary"><Edit2 className="w-4 h-4" /></button>
                          <button onClick={() => handleDeleteCat(cat.id)} className="p-1.5 text-on-surface-variant hover:text-error"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* EMPLOYEE DIRECTORY TAB */}
        {activeTab === 'directory' && (
          <section className="animate-in fade-in duration-300">
            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-container-low text-on-surface-variant text-xs uppercase font-medium">
                    <th className="px-6 py-4 border-b border-outline-variant">Employee Name</th>
                    <th className="px-6 py-4 border-b border-outline-variant">Email Address</th>
                    <th className="px-6 py-4 border-b border-outline-variant">Department</th>
                    <th className="px-6 py-4 border-b border-outline-variant">System Role</th>
                    <th className="px-6 py-4 border-b border-outline-variant">Status</th>
                    <th className="px-6 py-4 border-b border-outline-variant text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {users.length === 0 ? (
                    <tr><td colSpan="6" className="text-center p-6 text-on-surface-variant">No employees found</td></tr>
                  ) : users.map(emp => (
                    <tr key={emp.id} className="hover:bg-surface-container-low transition-colors duration-150">
                      <td className="px-6 py-4 border-b border-outline-variant">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center font-bold text-xs">
                            {emp.name.split(' ').map(n=>n[0]).join('')}
                          </div>
                          <span className="font-bold text-primary">{emp.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 border-b border-outline-variant text-on-surface-variant">{emp.email}</td>
                      <td className="px-6 py-4 border-b border-outline-variant">{emp.department?.name || '—'}</td>
                      <td className="px-6 py-4 border-b border-outline-variant">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          emp.role === 'admin' ? 'bg-on-primary-fixed-variant text-white' : 
                          'bg-surface-container text-on-surface-variant'
                        }`}>
                          {emp.role.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 border-b border-outline-variant">
                        <span className={`flex items-center gap-1.5 text-xs font-bold ${
                          emp.status === 'active' ? 'text-emerald-600' : 'text-on-surface-variant opacity-60'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            emp.status === 'active' ? 'bg-emerald-600' : 'bg-on-surface-variant'
                          }`}></span> 
                          {emp.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 border-b border-outline-variant text-right">
                        <button onClick={() => { setEditData(emp); setIsEmpActionModalOpen(true); }} className="p-2 hover:bg-slate-100 rounded-full text-on-surface-variant transition-colors">
                          <MoreHorizontal className="w-5 h-5" />
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

      <DepartmentModal isOpen={isDeptModalOpen} onClose={() => setIsDeptModalOpen(false)} onSuccess={fetchDepartments} editData={editData} departments={departments} users={users} />
      <CategoryModal isOpen={isCategoryModalOpen} onClose={() => setIsCategoryModalOpen(false)} onSuccess={fetchCategories} editData={editData} />
      <EmployeeModal isOpen={isEmpModalOpen} onClose={() => setIsEmpModalOpen(false)} onSuccess={fetchUsers} departments={departments} />
      <EmployeeActionModal isOpen={isEmpActionModalOpen} onClose={() => setIsEmpActionModalOpen(false)} user={editData} onSuccess={fetchUsers} onOpenPasswordModal={() => setIsPassModalOpen(true)} />
      <PasswordModal isOpen={isPassModalOpen} onClose={() => setIsPassModalOpen(false)} user={editData} />
    </div>
  );
}
