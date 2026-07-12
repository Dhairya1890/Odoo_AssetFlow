import { useState, useEffect } from 'react';
import { Plus, Filter, MoreVertical, X, Search, SlidersHorizontal } from 'lucide-react';
import apiClient from '../../api/client';

export default function Assets() {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchAssets = async () => {
      try {
        const response = await apiClient.get('/assets');
        setAssets(response.data?.data?.assets || []);
      } catch (error) {
        console.error('Failed to fetch assets:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAssets();
  }, []);

  return (
    <div className="p-container-padding">
      {/* Page Header */}
      <div className="flex justify-between items-center mb-stack-lg">
        <div>
          <h1 className="text-2xl font-bold text-on-surface">Assets</h1>
          <p className="text-sm text-on-surface-variant mt-1">Manage and track your organization's hardware and infrastructure.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-primary text-on-primary px-6 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2 transition-all hover:opacity-90 active:scale-95"
        >
          <Plus className="w-5 h-5" />
          Register Asset
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4 mb-stack-lg flex flex-wrap items-center gap-4">
        <div className="flex-1 min-w-[200px]">
          <label className="text-xs font-medium text-on-surface-variant mb-1 block px-1">Quick Search</label>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant w-4 h-4" />
            <input 
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-primary transition-all bg-transparent" 
              placeholder="Tag, name, serial..." 
              type="text" 
            />
          </div>
        </div>
        <div className="w-48">
          <label className="text-xs font-medium text-on-surface-variant mb-1 block px-1">Status</label>
          <select className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-primary transition-all bg-transparent cursor-pointer appearance-none">
            <option>All Statuses</option>
            <option>Available</option>
            <option>In Use</option>
            <option>Maintenance</option>
            <option>Retired</option>
          </select>
        </div>
        <div className="w-48">
          <label className="text-xs font-medium text-on-surface-variant mb-1 block px-1">Category</label>
          <select className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-primary transition-all bg-transparent cursor-pointer appearance-none">
            <option>All Categories</option>
            <option>Hardware</option>
            <option>Vehicles</option>
            <option>Office Furniture</option>
            <option>Infrastructure</option>
          </select>
        </div>
        <div className="w-48">
          <label className="text-xs font-medium text-on-surface-variant mb-1 block px-1">Department</label>
          <select className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-primary transition-all bg-transparent cursor-pointer appearance-none">
            <option>All Departments</option>
            <option>Engineering</option>
            <option>Operations</option>
            <option>Marketing</option>
            <option>Human Resources</option>
          </select>
        </div>
        <div className="pt-5">
          <button className="p-2.5 border border-slate-200 rounded-lg text-on-surface-variant hover:bg-slate-50 transition-all flex items-center justify-center">
            <SlidersHorizontal className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white border border-outline-variant rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <th className="p-4 text-sm font-medium text-on-surface-variant whitespace-nowrap">Asset Tag</th>
                <th className="p-4 text-sm font-medium text-on-surface-variant whitespace-nowrap">Name</th>
                <th className="p-4 text-sm font-medium text-on-surface-variant whitespace-nowrap">Category</th>
                <th className="p-4 text-sm font-medium text-on-surface-variant whitespace-nowrap">Status</th>
                <th className="p-4 text-sm font-medium text-on-surface-variant whitespace-nowrap">Location</th>
                <th className="p-4 text-sm font-medium text-on-surface-variant whitespace-nowrap">Condition</th>
                <th className="p-4 text-sm font-medium text-on-surface-variant text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {assets.length === 0 && !loading ? (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-on-surface-variant text-sm">
                    No assets found. Click 'Register Asset' to add one.
                  </td>
                </tr>
              ) : (
                assets.map((asset) => (
                  <tr key={asset.id} className="transition-colors hover:bg-slate-50/50 group">
                    <td className="p-4">
                      <span className="font-mono text-xs font-bold px-2 py-1 bg-slate-100 text-slate-700 rounded border border-slate-200">
                        {asset.assetTag}
                      </span>
                    </td>
                    <td className="p-4 text-sm font-medium text-on-surface">{asset.name}</td>
                    <td className="p-4 text-sm text-on-surface-variant capitalize">{asset.Category?.name || 'Uncategorized'}</td>
                    <td className="p-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                        asset.status === 'AVAILABLE' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                        asset.status === 'ALLOCATED' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                        'bg-amber-50 text-amber-700 border-amber-100'
                      }`}>
                        {asset.status.charAt(0) + asset.status.slice(1).toLowerCase().replace('_', ' ')}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-on-surface-variant">{asset.location || '-'}</td>
                    <td className="p-4">
                      <span className="flex items-center gap-1.5 text-xs font-medium text-slate-600 capitalize">
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          asset.condition === 'EXCELLENT' ? 'bg-emerald-500' : 
                          asset.condition === 'GOOD' ? 'bg-blue-500' : 
                          asset.condition === 'FAIR' ? 'bg-amber-500' : 'bg-red-500'
                        }`}></span> 
                        {asset.condition.toLowerCase()}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button className="text-on-surface-variant hover:text-primary transition-colors">
                        <MoreVertical className="w-5 h-5 inline" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/30">
          <p className="text-xs font-medium text-on-surface-variant">Showing 1 to {assets.length} of {assets.length} assets</p>
          <div className="flex gap-2">
            <button className="px-3 py-1.5 border border-slate-200 rounded-md text-xs font-medium hover:bg-white transition-colors disabled:opacity-50">Previous</button>
            <button className="px-3 py-1.5 border border-slate-200 rounded-md text-xs font-medium hover:bg-white transition-colors">Next</button>
          </div>
        </div>
      </div>

      {/* Registration Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          <div className="relative bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold text-on-surface">Register New Asset</h3>
                <p className="text-sm text-on-surface-variant mt-1">Enter asset details to add it to the system.</p>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-slate-100 rounded-full transition-colors text-on-surface-variant"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form className="p-6 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-on-surface">Asset Name</label>
                  <input 
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all text-sm" 
                    placeholder="e.g. Sony A7IV Camera" 
                    type="text" 
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-on-surface">Category</label>
                  <select className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all text-sm appearance-none bg-transparent">
                    <option>Select category</option>
                    <option>Hardware</option>
                    <option>Software</option>
                    <option>Furniture</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-on-surface">Serial Number</label>
                  <input 
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all text-sm font-mono" 
                    placeholder="SN-XXXX-XXXX" 
                    type="text" 
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-on-surface">Acquisition Date</label>
                  <input 
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all text-sm" 
                    type="date" 
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-on-surface">Cost (USD)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">$</span>
                    <input 
                      className="w-full pl-7 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all text-sm" 
                      placeholder="0.00" 
                      type="number" 
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-on-surface">Condition</label>
                  <select className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all text-sm appearance-none bg-transparent">
                    <option>Excellent</option>
                    <option>Good</option>
                    <option>Fair</option>
                    <option>Poor</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-on-surface">Location</label>
                  <input 
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all text-sm" 
                    placeholder="e.g. Warehouse A, Bay 4" 
                    type="text" 
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-on-surface">Department</label>
                  <select className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all text-sm appearance-none bg-transparent">
                    <option>Marketing</option>
                    <option>Sales</option>
                    <option>IT</option>
                  </select>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                <div>
                  <p className="text-sm font-medium text-on-surface">Bookable Asset</p>
                  <p className="text-xs text-on-surface-variant mt-0.5">Allow employees to reserve this asset via the app.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>
            </form>
            
            <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-3">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="px-6 py-2 border border-slate-200 rounded-lg text-sm font-medium hover:bg-white transition-colors"
              >
                Cancel
              </button>
              <button className="px-6 py-2 bg-primary text-on-primary rounded-lg text-sm font-medium transition-colors hover:opacity-90">
                Confirm Registration
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
