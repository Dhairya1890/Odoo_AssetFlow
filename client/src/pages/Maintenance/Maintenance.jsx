import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Plus, Search, Filter, Download, MoreVertical, X, UploadCloud, CheckCircle } from 'lucide-react';
import apiClient from '../../api/client';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../store/authStore';

export default function Maintenance() {
  const { user } = useAuthStore();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [eligibleAssets, setEligibleAssets] = useState([]);
  const [formData, setFormData] = useState({
    assetId: '',
    priority: 'Low',
    issueDescription: ''
  });
  const [photoFile, setPhotoFile] = useState(null);
  
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (location.state?.openModal) {
      setIsModalOpen(true);
      navigate(location.pathname, { replace: true, state: {} });
    }

    const fetchMaintenance = async () => {
      try {
        const url = user?.role === 'employee' ? '/maintenance/my' : '/maintenance';
        const response = await apiClient.get(url);
        setTasks(response.data?.data?.requests || response.data?.data?.tickets || []);
      } catch (error) {
        console.error('Failed to fetch maintenance tasks:', error);
      } finally {
        setLoading(false);
      }
    };
    
    const fetchAssets = async () => {
      try {
        if (user?.role === 'employee') {
          const [allocRes, bookRes] = await Promise.all([
            apiClient.get('/allocations/my'),
            apiClient.get('/bookings/my') // actually it's /bookings and filtered in backend if employee? wait, /bookings/my exists!
          ]);
          const allocAssets = allocRes.data?.data?.allocations.map(a => a.asset) || [];
          const bookAssets = bookRes.data?.data?.bookings.map(b => b.asset) || [];
          
          const combined = [...allocAssets, ...bookAssets].filter(Boolean);
          const unique = Array.from(new Map(combined.map(item => [item.id, item])).values());
          setEligibleAssets(unique);
        } else {
          const res = await apiClient.get('/assets');
          setEligibleAssets(res.data?.data?.assets || []);
        }
      } catch (err) {
        console.error('Failed to fetch assets:', err);
      }
    };

    fetchMaintenance();
    fetchAssets();
  }, [location.state, user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.assetId || !formData.issueDescription) {
      toast.error('Asset and Description are required');
      return;
    }
    try {
      const formPayload = new FormData();
      formPayload.append('assetId', formData.assetId);
      formPayload.append('priority', formData.priority.toLowerCase());
      formPayload.append('issueDescription', formData.issueDescription);
      if (photoFile) formPayload.append('photo', photoFile);

      await apiClient.post('/maintenance', formPayload, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      toast.success('Maintenance request raised successfully');
      setIsModalOpen(false);
      setFormData({ assetId: '', priority: 'Low', issueDescription: '' });
      setPhotoFile(null);
      // Refresh tasks
      const url = user?.role === 'employee' ? '/maintenance/my' : '/maintenance';
      const response = await apiClient.get(url);
      setTasks(response.data?.data?.requests || response.data?.data?.tickets || []);
      
      // Update Dashboard KPIs if required (mocking event for now)
      window.dispatchEvent(new Event('activity-updated'));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to raise request');
    }
  };

  return (
    <div className="p-container-padding space-y-stack-lg">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-stack-md">
        <div>
          <h2 className="text-2xl font-bold text-on-surface">Maintenance Pipeline</h2>
          <p className="text-sm text-on-surface-variant mt-1">Track and manage asset repairs and servicing requests.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-primary text-on-primary px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-opacity-90 transition-all"
        >
          <Plus className="w-5 h-5" />
          Raise Request
        </button>
      </div>

      {/* Kanban Board Placeholder */}
      <section className="mb-stack-lg">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 overflow-x-auto pb-4 custom-scrollbar">
          {/* Column: Pending */}
          <div className="flex flex-col gap-3 min-w-[240px]">
            <div className="flex items-center justify-between px-1">
              <span className="text-sm font-medium text-on-surface-variant">Pending</span>
              <span className="w-2 h-2 rounded-full bg-slate-300"></span>
            </div>
            
            <div className="bg-surface-container-low border border-outline-variant rounded-xl p-3 hover:border-outline transition-all cursor-grab active:cursor-grabbing shadow-sm">
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-bold px-2 py-0.5 bg-error-container text-on-error-container rounded-full">High</span>
                <span className="text-on-surface-variant text-xs">#TK-882</span>
              </div>
              <p className="text-sm font-bold mb-1">HVAC Unit Leakage</p>
              <p className="text-xs text-on-surface-variant line-clamp-2">Leaking water reported in Server Room B. Urgent check required.</p>
              <div className="mt-3 pt-3 border-t border-outline-variant flex justify-between items-center">
                <span className="text-[10px] text-on-surface-variant">2h ago</span>
                <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-600">JD</div>
              </div>
            </div>
          </div>
          
          {/* Column: Approved */}
          <div className="flex flex-col gap-3 min-w-[240px]">
            <div className="flex items-center justify-between px-1">
              <span className="text-sm font-medium text-on-surface-variant">Approved</span>
              <span className="w-2 h-2 rounded-full bg-amber-400"></span>
            </div>
          </div>
          
          {/* Column: Assigned */}
          <div className="flex flex-col gap-3 min-w-[240px]">
            <div className="flex items-center justify-between px-1">
              <span className="text-sm font-medium text-on-surface-variant">Assigned</span>
              <span className="w-2 h-2 rounded-full bg-blue-400"></span>
            </div>
          </div>
          
          {/* Column: In Progress */}
          <div className="flex flex-col gap-3 min-w-[240px]">
            <div className="flex items-center justify-between px-1">
              <span className="text-sm font-medium text-on-surface-variant">In Progress</span>
              <span className="w-2 h-2 rounded-full bg-primary"></span>
            </div>
          </div>
          
          {/* Column: Resolved */}
          <div className="flex flex-col gap-3 min-w-[240px]">
            <div className="flex items-center justify-between px-1">
              <span className="text-sm font-medium text-on-surface-variant">Resolved</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            </div>
          </div>
        </div>
      </section>

      {/* Filters and Table View */}
      <section className="bg-surface border border-outline-variant rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-outline-variant flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <h3 className="text-sm font-medium text-on-surface">All Tickets</h3>
            <div className="h-4 w-[1px] bg-outline-variant mx-1"></div>
            <div className="flex gap-2">
              <select className="text-xs border border-outline-variant rounded-lg bg-surface px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary appearance-none cursor-pointer">
                <option>All Priorities</option>
                <option>High</option>
                <option>Medium</option>
                <option>Low</option>
              </select>
              <select className="text-xs border border-outline-variant rounded-lg bg-surface px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary appearance-none cursor-pointer">
                <option>All Assets</option>
                <option>HVAC</option>
                <option>IT Hardware</option>
                <option>Furniture</option>
              </select>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-1.5 border border-outline-variant rounded-lg hover:bg-surface-container-high transition-colors">
              <Filter className="w-4 h-4 text-on-surface-variant" />
            </button>
            <button className="p-1.5 border border-outline-variant rounded-lg hover:bg-surface-container-high transition-colors">
              <Download className="w-4 h-4 text-on-surface-variant" />
            </button>
          </div>
        </div>
        
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low">
                <th className="px-4 py-3 text-xs font-medium text-on-surface-variant border-b border-outline-variant">Asset Tag</th>
                <th className="px-4 py-3 text-xs font-medium text-on-surface-variant border-b border-outline-variant">Issue Description</th>
                <th className="px-4 py-3 text-xs font-medium text-on-surface-variant border-b border-outline-variant">Priority</th>
                <th className="px-4 py-3 text-xs font-medium text-on-surface-variant border-b border-outline-variant">Status</th>
                <th className="px-4 py-3 text-xs font-medium text-on-surface-variant border-b border-outline-variant">Raised By</th>
                <th className="px-4 py-3 text-xs font-medium text-on-surface-variant border-b border-outline-variant text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {tasks.length === 0 && !loading ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-on-surface-variant text-sm">
                    No maintenance tickets found.
                  </td>
                </tr>
              ) : (
                tasks.map((task) => (
                  <tr key={task.id} className="hover:bg-surface-container-low transition-colors group">
                    <td className="px-4 py-4 text-sm font-bold">{task.Asset?.assetTag || 'Unknown'}</td>
                    <td className="px-4 py-4 text-sm max-w-xs truncate">{task.issueDescription}</td>
                    <td className="px-4 py-4">
                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full uppercase ${
                        task.priority === 'HIGH' || task.priority === 'CRITICAL' ? 'bg-error-container text-on-error-container' : 
                        task.priority === 'MEDIUM' ? 'bg-amber-100 text-amber-800' : 
                        'bg-slate-100 text-slate-800'
                      }`}>
                        {task.priority}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2 text-sm text-on-surface-variant capitalize">
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          task.status === 'RESOLVED' ? 'bg-emerald-500' :
                          task.status === 'IN_PROGRESS' ? 'bg-primary' : 'bg-slate-400'
                        }`}></span>
                        {task.status.toLowerCase().replace('_', ' ')}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-on-surface-variant">{task.ReportedBy?.name || '-'}</td>
                    <td className="px-4 py-4 text-right">
                      <button className="p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <MoreVertical className="w-5 h-5 text-on-surface-variant hover:text-primary" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Raise Request Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          <div className="relative bg-surface w-full max-w-lg rounded-xl border border-outline-variant shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-outline-variant flex justify-between items-center">
              <h2 className="text-xl font-bold text-on-surface">Raise Maintenance Request</h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-on-surface-variant hover:text-primary transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="p-6 space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium block text-on-surface">Select Asset</label>
                  <select 
                    required
                    value={formData.assetId}
                    onChange={(e) => setFormData({ ...formData, assetId: e.target.value })}
                    className="w-full px-4 py-2 border border-outline-variant rounded-lg bg-surface focus:outline-none focus:ring-1 focus:ring-primary text-sm appearance-none cursor-pointer transition-all"
                  >
                    <option value="">-- Choose an asset --</option>
                    {eligibleAssets.map(asset => (
                      <option key={asset.id} value={asset.id}>
                        {asset.assetTag} - {asset.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium block text-on-surface">Priority</label>
                    <select 
                      value={formData.priority}
                      onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                      className="w-full px-4 py-2 border border-outline-variant rounded-lg bg-surface focus:outline-none focus:ring-1 focus:ring-primary text-sm appearance-none cursor-pointer transition-all"
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                      <option value="Critical">Critical</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium block text-on-surface">Category</label>
                    <select className="w-full px-4 py-2 border border-outline-variant rounded-lg bg-surface focus:outline-none focus:ring-1 focus:ring-primary text-sm appearance-none cursor-pointer transition-all">
                      <option>Hardware</option>
                      <option>Electrical</option>
                      <option>Plumbing</option>
                      <option>HVAC</option>
                    </select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium block text-on-surface">Issue Description</label>
                  <textarea 
                    required
                    value={formData.issueDescription}
                    onChange={(e) => setFormData({ ...formData, issueDescription: e.target.value })}
                    className="w-full px-4 py-2 border border-outline-variant rounded-lg bg-surface focus:outline-none focus:ring-1 focus:ring-primary text-sm resize-none transition-all" 
                    placeholder="Describe the problem in detail..." 
                    rows="4"
                  ></textarea>
                </div>
                
                <div className="relative flex flex-col items-center justify-center gap-2 p-6 bg-surface-container-low rounded-lg border border-dashed border-outline-variant hover:bg-surface-container-high transition-colors">
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={(e) => setPhotoFile(e.target.files[0])}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  {photoFile ? (
                    <>
                      <CheckCircle className="w-8 h-8 text-primary" />
                      <span className="text-sm text-on-surface-variant">{photoFile.name}</span>
                    </>
                  ) : (
                    <>
                      <UploadCloud className="w-8 h-8 text-on-surface-variant" />
                      <span className="text-sm text-on-surface-variant">Click to attach photo (Optional)</span>
                    </>
                  )}
                </div>
              </div>
              
              <div className="p-6 bg-surface-container-low border-t border-outline-variant flex justify-end gap-3">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-2 border border-outline-variant rounded-lg text-sm font-medium hover:bg-surface transition-colors text-on-surface"
                >
                  Cancel
                </button>
                <button type="submit" className="px-6 py-2 bg-primary text-on-primary rounded-lg text-sm font-medium hover:bg-opacity-90 transition-all">
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
