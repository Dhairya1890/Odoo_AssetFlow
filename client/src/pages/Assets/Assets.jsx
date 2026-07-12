import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Plus, Filter, MoreVertical, X, Search, SlidersHorizontal, Edit2, Trash2 } from 'lucide-react';
import apiClient from '../../api/client';
import toast from 'react-hot-toast';
import RegisterAssetModal from '../../components/assets/RegisterAssetModal';
import { useAuthStore } from '../../store/authStore';

export default function Assets() {
  const { user } = useAuthStore();
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editData, setEditData] = useState(null);

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

  useEffect(() => {
    fetchAssets();
  }, []);

  const handleEdit = (asset) => {
    setEditData(asset);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this asset?')) {
      try {
        await apiClient.delete(`/assets/${id}`);
        toast.success('Asset deleted successfully');
        fetchAssets();
      } catch (error) {
        toast.error('Failed to delete asset');
      }
    }
  };

  const [searchParams, setSearchParams] = useSearchParams();
  useEffect(() => {
    if (searchParams.get('openRegister') === 'true') {
      setIsModalOpen(true);
      setSearchParams({});
    }
  }, [searchParams, setSearchParams]);

  return (
    <div className="p-container-padding">
      {/* Page Header */}
      <div className="flex justify-between items-center mb-stack-lg">
        <div>
          <h1 className="text-2xl font-bold text-on-surface">Assets</h1>
          <p className="text-sm text-on-surface-variant mt-1">Manage and track your organization's hardware and infrastructure.</p>
        </div>
        {user?.role !== 'employee' && (
          <button 
            onClick={() => { setEditData(null); setIsModalOpen(true); }}
            className="bg-primary text-on-primary px-6 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2 transition-all hover:opacity-90 active:scale-95"
          >
            <Plus className="w-5 h-5" />
            Register Asset
          </button>
        )}
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
                {user?.role !== 'employee' && <th className="p-4 text-sm font-medium text-on-surface-variant text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {assets.length === 0 && !loading ? (
                <tr>
                  <td colSpan={user?.role === 'employee' ? 6 : 7} className="p-8 text-center text-on-surface-variant text-sm">
                    No assets found.
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
                    {user?.role !== 'employee' && (
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => handleEdit(asset)} className="p-1.5 text-on-surface-variant hover:text-primary bg-slate-100 hover:bg-primary/10 rounded transition-colors">
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDelete(asset.id)} className="p-1.5 text-on-surface-variant hover:text-error bg-slate-100 hover:bg-error/10 rounded transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    )}
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

      <RegisterAssetModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchAssets}
        editData={editData}
      />
    </div>
  );
}
