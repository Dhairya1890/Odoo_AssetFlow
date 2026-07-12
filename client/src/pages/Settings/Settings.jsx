import { useState } from 'react';
import { Plus, Search, HelpCircle, Bell, Settings as SettingsIcon, Users, Network, BoxSelect } from 'lucide-react';
import apiClient from '../../api/client';

export default function Settings() {
  const [activeTab, setActiveTab] = useState('departments');

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
            <button className="bg-primary text-on-primary px-4 py-2 rounded-lg text-sm font-medium hover:bg-opacity-90 transition-all flex items-center gap-2">
              <Plus className="w-5 h-5" />
              <span>
                {activeTab === 'departments' ? 'New Department' : 
                 activeTab === 'categories' ? 'New Category' : 'Invite Employee'}
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
                    <th className="px-6 py-4 border-b border-outline-variant text-right">Members</th>
                    <th className="px-6 py-4 border-b border-outline-variant text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {[
                    { name: 'Executive Office', parent: '—', head: 'Helena Smith', initials: 'HS', count: 12 },
                    { name: 'Engineering', parent: 'Operations', head: 'Marcus Jensen', initials: 'MJ', count: 145 },
                    { name: 'Product Design', parent: 'Engineering', head: 'Aria Lo', initials: 'AL', count: 24 },
                    { name: 'Marketing', parent: 'Growth', head: 'David Ray', initials: 'DR', count: 38 },
                  ].map(dept => (
                    <tr key={dept.name} className="hover:bg-surface-container-low transition-colors duration-150">
                      <td className="px-6 py-4 border-b border-outline-variant font-bold text-primary">{dept.name}</td>
                      <td className="px-6 py-4 border-b border-outline-variant text-on-surface-variant">{dept.parent}</td>
                      <td className="px-6 py-4 border-b border-outline-variant">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-secondary-container flex items-center justify-center text-[10px] font-bold text-on-secondary-container">{dept.initials}</div>
                          <span>{dept.head}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 border-b border-outline-variant text-right text-on-surface-variant">{dept.count}</td>
                      <td className="px-6 py-4 border-b border-outline-variant text-right">
                        <button className="text-on-surface-variant hover:text-primary transition-colors"><SettingsIcon className="w-4 h-4 inline" /></button>
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
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-gutter">
              <div className="lg:col-span-2 bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm h-fit">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-surface-container-low text-on-surface-variant text-xs uppercase font-medium">
                      <th className="px-6 py-4 border-b border-outline-variant">Category Name</th>
                      <th className="px-6 py-4 border-b border-outline-variant">Custom Fields</th>
                      <th className="px-6 py-4 border-b border-outline-variant text-right">Asset Count</th>
                      <th className="px-6 py-4 border-b border-outline-variant text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    {[
                      { name: 'Computing Hardware', fields: ['Serial Number', 'Processor', 'RAM'], count: '1,204' },
                      { name: 'Fleet Vehicles', fields: ['License Plate', 'VIN', 'Last Service'], count: '85' },
                      { name: 'Office Furniture', fields: ['Location', 'Material'], count: '450' },
                    ].map(cat => (
                      <tr key={cat.name} className="hover:bg-surface-container-low transition-colors duration-150">
                        <td className="px-6 py-4 border-b border-outline-variant font-bold text-primary">{cat.name}</td>
                        <td className="px-6 py-4 border-b border-outline-variant">
                          <div className="flex flex-wrap gap-1">
                            {cat.fields.map(f => (
                              <span key={f} className="bg-surface-container px-2 py-0.5 rounded text-[11px] border border-outline-variant">{f}</span>
                            ))}
                          </div>
                        </td>
                        <td className="px-6 py-4 border-b border-outline-variant text-right text-on-surface-variant">{cat.count}</td>
                        <td className="px-6 py-4 border-b border-outline-variant text-right">
                          <button className="text-on-surface-variant hover:text-primary"><SettingsIcon className="w-4 h-4 inline" /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Quick Add Category Card */}
              <div className="bg-surface-container-low border border-outline-variant rounded-xl p-6">
                <h3 className="text-lg font-bold mb-4 text-primary">Schema Definition</h3>
                <p className="text-sm text-on-surface-variant mb-6">Select a category to modify its metadata schema or add global custom fields to the system asset log.</p>
                <div className="space-y-4">
                  <div className="p-4 bg-surface-container-lowest rounded-lg border border-outline-variant shadow-sm">
                    <span className="text-sm font-bold block mb-1">Global Fields</span>
                    <p className="text-xs text-on-surface-variant">Asset ID, Purchase Date, Warranty Expiry, Tag Status.</p>
                  </div>
                  <button className="w-full py-2 border border-primary text-primary text-sm font-medium rounded-lg hover:bg-primary hover:text-on-primary transition-all">Configure Fields</button>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* EMPLOYEE DIRECTORY TAB */}
        {activeTab === 'directory' && (
          <section className="animate-in fade-in duration-300">
            <div className="flex justify-between items-center mb-6">
              <div className="flex gap-4">
                <select className="bg-surface border border-outline-variant rounded-lg px-4 py-1.5 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary appearance-none cursor-pointer">
                  <option>All Departments</option>
                  <option>Engineering</option>
                  <option>Product Design</option>
                </select>
                <select className="bg-surface border border-outline-variant rounded-lg px-4 py-1.5 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary appearance-none cursor-pointer">
                  <option>All Roles</option>
                  <option>Admin</option>
                  <option>Manager</option>
                  <option>Staff</option>
                </select>
              </div>
            </div>

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
                  {[
                    { name: 'Sarah Connor', email: 's.connor@assetflow.com', dept: 'Operations', role: 'Admin', status: 'Active' },
                    { name: 'Robert Draper', email: 'r.draper@assetflow.com', dept: 'Engineering', role: 'Staff', status: 'Active' },
                    { name: 'Alex Kamal', email: 'a.kamal@assetflow.com', dept: 'Logistics', role: 'Manager', status: 'Inactive' },
                  ].map((emp, idx) => (
                    <tr key={idx} className="hover:bg-surface-container-low transition-colors duration-150">
                      <td className="px-6 py-4 border-b border-outline-variant">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center font-bold text-xs">{emp.name.split(' ').map(n=>n[0]).join('')}</div>
                          <span className="font-bold text-primary">{emp.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 border-b border-outline-variant text-on-surface-variant">{emp.email}</td>
                      <td className="px-6 py-4 border-b border-outline-variant">{emp.dept}</td>
                      <td className="px-6 py-4 border-b border-outline-variant">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          emp.role === 'Admin' ? 'bg-on-primary-fixed-variant text-white' : 
                          'bg-surface-container text-on-surface-variant'
                        }`}>
                          {emp.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 border-b border-outline-variant">
                        <span className={`flex items-center gap-1.5 text-xs font-bold ${
                          emp.status === 'Active' ? 'text-emerald-600' : 'text-on-surface-variant opacity-60'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            emp.status === 'Active' ? 'bg-emerald-600' : 'bg-on-surface-variant'
                          }`}></span> 
                          {emp.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 border-b border-outline-variant text-right space-x-3">
                        <button className="text-xs font-bold text-on-surface-variant hover:text-primary underline">Promote Role</button>
                        <button className={`text-xs font-bold ${emp.status === 'Active' ? 'text-error hover:text-error-container' : 'text-primary hover:text-secondary'}`}>
                          {emp.status === 'Active' ? 'Deactivate' : 'Activate'}
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
    </div>
  );
}
