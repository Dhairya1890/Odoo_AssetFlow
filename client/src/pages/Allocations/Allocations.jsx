import { useState, useEffect } from 'react';
import { Plus, Check, X, TrendingUp, AlertCircle, Box } from 'lucide-react';
import apiClient from '../../api/client';

export default function Allocations() {
  const [activeTab, setActiveTab] = useState('active');
  const [allocations, setAllocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchAllocations = async () => {
      try {
        const response = await apiClient.get('/allocations');
        setAllocations(response.data?.data?.allocations || []);
      } catch (error) {
        console.error('Failed to fetch allocations:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAllocations();
  }, []);

  return (
    <div className="p-container-padding">
      {/* Page Header */}
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-2xl font-bold text-on-surface">Asset Allocations</h2>
          <p className="text-sm text-on-surface-variant mt-1">Manage organization-wide asset assignments and track transfer requests.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-primary text-on-primary px-6 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2 hover:opacity-90 transition-opacity"
        >
          <Plus className="w-5 h-5" />
          Allocate Asset
        </button>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-outline-variant mb-6 flex gap-8">
        <button 
          onClick={() => setActiveTab('active')}
          className={`pb-3 border-b-2 text-sm font-medium transition-all ${
            activeTab === 'active' 
              ? 'border-primary text-primary' 
              : 'border-transparent text-on-surface-variant hover:text-primary'
          }`}
        >
          Active Allocations
        </button>
        <button 
          onClick={() => setActiveTab('transfer')}
          className={`pb-3 border-b-2 text-sm font-medium transition-all ${
            activeTab === 'transfer' 
              ? 'border-primary text-primary' 
              : 'border-transparent text-on-surface-variant hover:text-primary'
          }`}
        >
          Transfer Requests
        </button>
      </div>

      {/* Content Area */}
      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant overflow-hidden">
        {activeTab === 'active' ? (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low border-b border-outline-variant">
                <th className="px-6 py-4 text-xs uppercase tracking-wider text-on-surface-variant font-medium">Asset Tag</th>
                <th className="px-6 py-4 text-xs uppercase tracking-wider text-on-surface-variant font-medium">Asset Name</th>
                <th className="px-6 py-4 text-xs uppercase tracking-wider text-on-surface-variant font-medium">Assigned To</th>
                <th className="px-6 py-4 text-xs uppercase tracking-wider text-on-surface-variant font-medium">Expected Return</th>
                <th className="px-6 py-4 text-xs uppercase tracking-wider text-on-surface-variant font-medium text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {allocations.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-on-surface-variant text-sm">
                    No active allocations found.
                  </td>
                </tr>
              ) : (
                allocations.map((allocation) => (
                  <tr key={allocation.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium">{allocation.Asset?.assetTag || 'N/A'}</td>
                    <td className="px-6 py-4 text-sm">{allocation.Asset?.name || 'N/A'}</td>
                    <td className="px-6 py-4 text-sm">{allocation.User?.name || 'Unknown'}</td>
                    <td className="px-6 py-4 text-sm">{allocation.expectedReturnDate ? new Date(allocation.expectedReturnDate).toLocaleDateString() : '-'}</td>
                    <td className="px-6 py-4 text-right">
                      <span className="bg-secondary-container text-on-secondary-container px-2.5 py-1 rounded-full text-xs font-medium">
                        Active
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low border-b border-outline-variant">
                <th className="px-6 py-4 text-xs uppercase tracking-wider text-on-surface-variant font-medium">Asset</th>
                <th className="px-6 py-4 text-xs uppercase tracking-wider text-on-surface-variant font-medium">From</th>
                <th className="px-6 py-4 text-xs uppercase tracking-wider text-on-surface-variant font-medium">To</th>
                <th className="px-6 py-4 text-xs uppercase tracking-wider text-on-surface-variant font-medium">Requested By</th>
                <th className="px-6 py-4 text-xs uppercase tracking-wider text-on-surface-variant font-medium">Status</th>
                <th className="px-6 py-4 text-xs uppercase tracking-wider text-on-surface-variant font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              <tr>
                <td colSpan="6" className="p-8 text-center text-on-surface-variant text-sm">
                  No transfer requests pending.
                </td>
              </tr>
            </tbody>
          </table>
        )}
      </div>

      {/* Bento Grid Summary Section */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-2 bg-white p-6 rounded-xl border border-outline-variant relative overflow-hidden group">
          <div className="relative z-10">
            <p className="text-sm font-medium text-on-surface-variant">Allocation Health</p>
            <h3 className="text-4xl font-bold mt-2 text-primary">94%</h3>
            <p className="text-sm text-on-surface-variant mt-2">Assets returned on time this quarter. Great performance!</p>
          </div>
          <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform duration-700">
            <TrendingUp className="w-32 h-32" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-outline-variant">
          <p className="text-sm font-medium text-on-surface-variant">Pending Transfers</p>
          <h3 className="text-2xl font-bold mt-2 text-primary">0</h3>
          <div className="mt-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-slate-300"></span>
            <span className="text-xs text-on-surface-variant">All caught up</span>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-outline-variant">
          <p className="text-sm font-medium text-on-surface-variant">Active Loans</p>
          <h3 className="text-2xl font-bold mt-2 text-primary">{allocations.length}</h3>
          <p className="text-xs text-on-surface-variant mt-4">Current allocations</p>
        </div>
      </div>

      {/* Allocation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          <div className="relative bg-white w-full max-w-md rounded-xl shadow-2xl border border-outline-variant animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-outline-variant flex justify-between items-center">
              <h3 className="text-lg font-bold text-on-surface">New Asset Allocation</h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-1 hover:bg-surface-container-high rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-on-surface-variant mb-2">Select Asset</label>
                <select className="w-full px-4 py-2.5 bg-surface border border-outline-variant rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary">
                  <option>Select an available asset...</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-on-surface-variant mb-2">Assign to Employee</label>
                <select className="w-full px-4 py-2.5 bg-surface border border-outline-variant rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary">
                  <option>Select employee...</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-on-surface-variant mb-2">Expected Return Date</label>
                <input 
                  type="date"
                  className="w-full px-4 py-2.5 bg-surface border border-outline-variant rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary" 
                />
              </div>
              
              <div className="pt-4 flex gap-3">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2.5 border border-outline-variant rounded-lg text-sm font-medium hover:bg-surface-container-high transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 px-4 py-2.5 bg-primary text-on-primary rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
                >
                  Confirm Allocation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
