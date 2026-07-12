import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Plus, Filter, MoreVertical, X, Search, SlidersHorizontal, Edit2, Trash2, History, ArrowRightLeft, Wrench, CheckCircle2, Clock, XCircle } from 'lucide-react';
import apiClient from '../../api/client';
import toast from 'react-hot-toast';
import RegisterAssetModal from '../../components/assets/RegisterAssetModal';
import { useAuthStore } from '../../store/authStore';

// ─── Per-Asset History Modal ──────────────────────────────────────────────────
function AssetHistoryModal({ asset, onClose }) {
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('allocations');

  useEffect(() => {
    apiClient.get(`/assets/${asset.id}`)
      .then(r => setDetail(r.data?.data?.asset))
      .catch(() => toast.error('Failed to load asset history'))
      .finally(() => setLoading(false));
  }, [asset.id]);

  const statusColor = (s) => {
    const map = {
      active: 'bg-blue-100 text-blue-700',
      returned: 'bg-emerald-100 text-emerald-700',
      overdue: 'bg-red-100 text-red-700',
      transfer_requested: 'bg-amber-100 text-amber-700',
      PENDING: 'bg-slate-100 text-slate-700',
      APPROVED: 'bg-blue-100 text-blue-700',
      IN_PROGRESS: 'bg-amber-100 text-amber-700',
      RESOLVED: 'bg-emerald-100 text-emerald-700',
      REJECTED: 'bg-red-100 text-red-700',
    };
    return map[s] || 'bg-slate-100 text-slate-600';
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-surface w-full max-w-2xl rounded-xl border border-outline-variant shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-6 py-5 border-b border-outline-variant flex items-start justify-between shrink-0">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <History className="w-4 h-4 text-primary" />
              <h2 className="text-base font-bold text-on-surface">Asset History</h2>
            </div>
            <p className="text-sm text-on-surface-variant">
              <span className="font-mono font-bold">{asset.assetTag}</span> · {asset.name}
            </p>
          </div>
          <button onClick={onClose} className="text-on-surface-variant hover:text-primary transition-colors mt-0.5">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-0 border-b border-outline-variant shrink-0">
          {[
            { id: 'allocations', label: 'Allocation History', Icon: ArrowRightLeft },
            { id: 'maintenance', label: 'Maintenance History', Icon: Wrench },
          ].map(({ id, label, Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 -mb-px transition-all
                ${tab === id ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant hover:text-on-surface'}`}
            >
              <Icon className="w-4 h-4" />
              {label}
              {!loading && detail && (
                <span className="text-xs px-1.5 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant font-bold">
                  {tab === id ? (id === 'allocations' ? detail.allocations?.length : detail.maintenanceRequests?.length) : ''}
                  {tab !== id ? (id === 'allocations' ? detail.allocations?.length : detail.maintenanceRequests?.length) : ''}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-1">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-7 h-7 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <>
              {tab === 'allocations' && (
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-surface-container-low">
                      {['Assigned To', 'Allocated By', 'From', 'Expected Return', 'Actual Return', 'Status'].map(h => (
                        <th key={h} className="px-4 py-2.5 text-xs font-medium text-on-surface-variant border-b border-outline-variant whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant">
                    {!detail?.allocations?.length ? (
                      <tr><td colSpan={6} className="px-4 py-10 text-center text-sm text-on-surface-variant">No allocation history found.</td></tr>
                    ) : detail.allocations.map(a => (
                      <tr key={a.id} className="hover:bg-surface-container-low transition-colors">
                        <td className="px-4 py-3 text-sm font-medium text-on-surface">{a.user?.name || '—'}</td>
                        <td className="px-4 py-3 text-sm text-on-surface-variant">{a.allocatedBy?.name || '—'}</td>
                        <td className="px-4 py-3 text-sm text-on-surface-variant whitespace-nowrap">{a.createdAt ? new Date(a.createdAt).toLocaleDateString() : '—'}</td>
                        <td className="px-4 py-3 text-sm text-on-surface-variant whitespace-nowrap">{a.expectedReturnDate ? new Date(a.expectedReturnDate).toLocaleDateString() : '—'}</td>
                        <td className="px-4 py-3 text-sm text-on-surface-variant whitespace-nowrap">{a.actualReturnDate ? new Date(a.actualReturnDate).toLocaleDateString() : '—'}</td>
                        <td className="px-4 py-3">
                          <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full capitalize ${statusColor(a.status)}`}>{a.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
              {tab === 'maintenance' && (
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-surface-container-low">
                      {['Issue', 'Priority', 'Raised By', 'Date', 'Status'].map(h => (
                        <th key={h} className="px-4 py-2.5 text-xs font-medium text-on-surface-variant border-b border-outline-variant whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant">
                    {!detail?.maintenanceRequests?.length ? (
                      <tr><td colSpan={5} className="px-4 py-10 text-center text-sm text-on-surface-variant">No maintenance history found.</td></tr>
                    ) : detail.maintenanceRequests.map(m => (
                      <tr key={m.id} className="hover:bg-surface-container-low transition-colors">
                        <td className="px-4 py-3 text-sm text-on-surface max-w-[200px] truncate">{m.issueDescription}</td>
                        <td className="px-4 py-3">
                          <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full uppercase ${
                            m.priority === 'high' || m.priority === 'critical' ? 'bg-red-100 text-red-700' :
                            m.priority === 'medium' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'
                          }`}>{m.priority}</span>
                        </td>
                        <td className="px-4 py-3 text-sm text-on-surface-variant">{m.raisedBy?.name || '—'}</td>
                        <td className="px-4 py-3 text-sm text-on-surface-variant whitespace-nowrap">{m.createdAt ? new Date(m.createdAt).toLocaleDateString() : '—'}</td>
                        <td className="px-4 py-3">
                          <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${statusColor(m.status)}`}>{m.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </>
          )}
        </div>

        <div className="px-6 py-3 border-t border-outline-variant bg-surface-container-low shrink-0 flex justify-end">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium border border-outline-variant rounded-lg hover:bg-surface transition-colors">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Assets Page ─────────────────────────────────────────────────────────
export default function Assets() {
  const { user } = useAuthStore();
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [historyAsset, setHistoryAsset] = useState(null);

  // ── Filters ────────────────────────────────────────────────────
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');

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

  useEffect(() => { fetchAssets(); }, []);

  const [searchParams, setSearchParams] = useSearchParams();
  useEffect(() => {
    if (searchParams.get('openRegister') === 'true') {
      setIsModalOpen(true);
      setSearchParams({});
    }
  }, [searchParams, setSearchParams]);

  const handleEdit = (asset) => { setEditData(asset); setIsModalOpen(true); };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this asset?')) {
      try {
        await apiClient.delete(`/assets/${id}`);
        toast.success('Asset deleted successfully');
        fetchAssets();
      } catch {
        toast.error('Failed to delete asset');
      }
    }
  };

  // Unique categories for filter dropdown (client-side from loaded data)
  const categories = useMemo(() => {
    const seen = new Set();
    return assets.reduce((acc, a) => {
      const name = a.category?.name || a.Category?.name;
      if (name && !seen.has(name)) { seen.add(name); acc.push(name); }
      return acc;
    }, []);
  }, [assets]);

  // Filtered assets
  const filtered = useMemo(() => {
    return assets.filter(a => {
      const name = a.category?.name || a.Category?.name || '';
      const q = search.toLowerCase();
      const matchSearch = !q ||
        a.assetTag?.toLowerCase().includes(q) ||
        a.name?.toLowerCase().includes(q) ||
        a.serialNumber?.toLowerCase().includes(q) ||
        a.location?.toLowerCase().includes(q);
      const matchStatus = filterStatus === 'all' || a.status?.toLowerCase() === filterStatus;
      const matchCategory = filterCategory === 'all' || name === filterCategory;
      return matchSearch && matchStatus && matchCategory;
    });
  }, [assets, search, filterStatus, filterCategory]);

  const isAdmin = ['admin', 'asset_manager'].includes(user?.role);

  return (
    <div className="p-container-padding">
      {/* Page Header */}
      <div className="flex justify-between items-center mb-stack-lg">
        <div>
          <h1 className="text-2xl font-bold text-on-surface">
            {user?.role === 'department_head' ? 'Department Assets' : 'Assets'}
          </h1>
          <p className="text-sm text-on-surface-variant mt-1">
            {user?.role === 'department_head'
              ? 'Assets allocated to your department.'
              : "Manage and track your organization's hardware and infrastructure."}
          </p>
        </div>
        {isAdmin && (
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
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4 mb-stack-lg flex flex-wrap items-end gap-4">
        {/* Search */}
        <div className="flex-1 min-w-[200px]">
          <label className="text-xs font-medium text-on-surface-variant mb-1 block px-1">Search</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant w-4 h-4" />
            <input
              id="asset-search"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-primary transition-all bg-transparent"
              placeholder="Tag, name, serial, location…"
              type="text"
            />
          </div>
        </div>

        {/* Status filter */}
        <div className="w-44">
          <label className="text-xs font-medium text-on-surface-variant mb-1 block px-1">Status</label>
          <select
            id="asset-filter-status"
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-primary transition-all bg-transparent cursor-pointer appearance-none"
          >
            <option value="all">All Statuses</option>
            <option value="available">Available</option>
            <option value="allocated">Allocated</option>
            <option value="reserved">Reserved</option>
            <option value="under_maintenance">Under Maintenance</option>
            <option value="lost">Lost</option>
            <option value="retired">Retired</option>
            <option value="disposed">Disposed</option>
          </select>
        </div>

        {/* Category filter */}
        <div className="w-44">
          <label className="text-xs font-medium text-on-surface-variant mb-1 block px-1">Category</label>
          <select
            id="asset-filter-category"
            value={filterCategory}
            onChange={e => setFilterCategory(e.target.value)}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-primary transition-all bg-transparent cursor-pointer appearance-none"
          >
            <option value="all">All Categories</option>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        {/* Clear */}
        {(search || filterStatus !== 'all' || filterCategory !== 'all') && (
          <div className="pb-0.5">
            <button
              onClick={() => { setSearch(''); setFilterStatus('all'); setFilterCategory('all'); }}
              className="flex items-center gap-1.5 text-xs text-on-surface-variant hover:text-primary transition-colors px-3 py-2 border border-outline-variant rounded-lg"
            >
              <X className="w-3.5 h-3.5" />
              Clear filters
            </button>
          </div>
        )}

        <div className="pb-0.5 ml-auto">
          <p className="text-xs text-on-surface-variant pt-6">
            Showing <span className="font-bold text-on-surface">{filtered.length}</span> of {assets.length} assets
          </p>
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
                <th className="p-4 text-sm font-medium text-on-surface-variant text-right whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 7 }).map((_, j) => (
                      <td key={j} className="p-4">
                        <div className="h-3 bg-slate-100 rounded animate-pulse" style={{ width: `${60 + j * 10}%` }} />
                      </td>
                    ))}
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-10 text-center text-on-surface-variant text-sm">
                    {assets.length === 0 ? 'No assets registered yet.' : 'No assets match your filters.'}
                  </td>
                </tr>
              ) : (
                filtered.map((asset) => (
                  <tr key={asset.id} className="transition-colors hover:bg-slate-50/50 group">
                    <td className="p-4">
                      <span className="font-mono text-xs font-bold px-2 py-1 bg-slate-100 text-slate-700 rounded border border-slate-200">
                        {asset.assetTag}
                      </span>
                    </td>
                    <td className="p-4 text-sm font-medium text-on-surface">{asset.name}</td>
                    <td className="p-4 text-sm text-on-surface-variant capitalize">
                      {asset.category?.name || asset.Category?.name || 'Uncategorized'}
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                        asset.status === 'available' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                        asset.status === 'allocated' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                        asset.status === 'under_maintenance' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                        asset.status === 'lost' ? 'bg-red-50 text-red-700 border-red-100' :
                        'bg-slate-50 text-slate-700 border-slate-100'
                      }`}>
                        {asset.status ? asset.status.charAt(0).toUpperCase() + asset.status.slice(1).replace(/_/g, ' ') : '—'}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-on-surface-variant">{asset.location || '-'}</td>
                    <td className="p-4">
                      {asset.condition ? (
                        <span className="flex items-center gap-1.5 text-xs font-medium text-slate-600 capitalize">
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            asset.condition === 'new' || asset.condition === 'good' ? 'bg-emerald-500' :
                            asset.condition === 'fair' ? 'bg-amber-500' : 'bg-red-500'
                          }`} />
                          {asset.condition}
                        </span>
                      ) : '—'}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {/* History — visible to all non-employees */}
                        {user?.role !== 'employee' && (
                          <button
                            id={`asset-history-${asset.id}`}
                            onClick={() => setHistoryAsset(asset)}
                            title="View history"
                            className="p-1.5 text-on-surface-variant hover:text-primary bg-slate-100 hover:bg-primary/10 rounded transition-colors"
                          >
                            <History className="w-4 h-4" />
                          </button>
                        )}
                        {/* Edit / Delete — only admin & asset_manager */}
                        {isAdmin && (
                          <>
                            <button
                              onClick={() => handleEdit(asset)}
                              className="p-1.5 text-on-surface-variant hover:text-primary bg-slate-100 hover:bg-primary/10 rounded transition-colors"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(asset.id)}
                              className="p-1.5 text-on-surface-variant hover:text-error bg-slate-100 hover:bg-error/10 rounded transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination footer */}
        <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/30">
          <p className="text-xs font-medium text-on-surface-variant">
            Showing {filtered.length} of {assets.length} assets
          </p>
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

      {historyAsset && (
        <AssetHistoryModal asset={historyAsset} onClose={() => setHistoryAsset(null)} />
      )}
    </div>
  );
}
